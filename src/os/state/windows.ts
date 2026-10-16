// Window manager state. Pure reducer so it can be unit tested without a DOM.
//
// Geometry is stored as the window's "normal" rectangle. Maximized and snapped
// windows keep that rectangle so restoring returns them to where they were;
// the shell renders the maximized/snapped layout from CSS.

export type Rect = { x: number; y: number; w: number; h: number };
export type Snap = "none" | "left" | "right";

export type WindowState = {
  id: string;
  appId: string;
  route: string;
  title: string;
  rect: Rect;
  minimized: boolean;
  maximized: boolean;
  snap: Snap;
  closing: boolean;
  // Hidden automatically by single-window mode (not by the visitor), so it
  // comes back when the window that replaced it closes.
  parked: boolean;
  // Opened by the page on load rather than by the visitor: it doesn't take
  // keyboard focus until the visitor focuses it.
  quiet?: boolean;
};

export type WMState = {
  windows: Record<string, WindowState>;
  // Stacking order, bottom to top.
  order: string[];
  focused: string | null;
};

export type WMAction =
  | {
      type: "open";
      id: string;
      appId: string;
      route: string;
      title: string;
      rect: Rect;
      maximized?: boolean;
      solo?: boolean;
      quiet?: boolean;
    }
  | { type: "focus"; id: string; solo?: boolean }
  | { type: "blur" }
  | { type: "minimize"; id: string }
  | { type: "close"; id: string }
  | { type: "remove"; id: string }
  | { type: "toggleMaximize"; id: string }
  | { type: "snap"; id: string; side: Snap }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "setRect"; id: string; rect: Rect }
  | { type: "detach"; id: string; rect: Rect }
  | { type: "setRoute"; id: string; route: string; title?: string }
  | { type: "clamp"; width: number; height: number };

export const initialWM: WMState = { windows: {}, order: [], focused: null };

export function focusedWindow(state: WMState): WindowState | undefined {
  if (!state.focused) return undefined;
  return state.windows[state.focused];
}

// The window that should receive focus once `excludeId` goes away.
function topVisible(state: WMState, excludeId: string) {
  for (let i = state.order.length - 1; i >= 0; i--) {
    const id = state.order[i];
    const w = state.windows[id];
    if (id !== excludeId && w && !w.minimized && !w.closing) return id;
  }
  return null;
}

function raise(order: string[], id: string) {
  return [...order.filter((o) => o !== id), id];
}

// Minimize every visible window except `id` (single-window mode).
function hideOthers(windows: Record<string, WindowState>, id: string) {
  const out: Record<string, WindowState> = {};
  for (const [key, w] of Object.entries(windows)) {
    if (key !== id && !w.minimized && !w.closing) out[key] = { ...w, minimized: true, parked: true };
    else out[key] = w;
  }
  return out;
}

// The window to bring back when `excludeId` closes: the most recent one that
// single-window mode put away.
function topParked(state: WMState, excludeId: string) {
  for (let i = state.order.length - 1; i >= 0; i--) {
    const id = state.order[i];
    const w = state.windows[id];
    if (id !== excludeId && w && w.parked && w.minimized && !w.closing) return id;
  }
  return null;
}

function othersVisible(state: WMState, id: string) {
  return state.order.some((o) => o !== id && !state.windows[o].minimized && !state.windows[o].closing);
}

function update(state: WMState, id: string, patch: Partial<WindowState>): WMState {
  const w = state.windows[id];
  if (!w) return state;
  return { ...state, windows: { ...state.windows, [id]: { ...w, ...patch } } };
}

// Keep at least a grabbable strip of the title bar inside the desktop.
export function clampRect(rect: Rect, width: number, height: number): Rect {
  const w = Math.min(rect.w, Math.max(width, 240));
  const h = Math.min(rect.h, Math.max(height, 160));
  const grab = 96;
  const x = Math.min(Math.max(rect.x, grab - w), width - grab);
  const y = Math.min(Math.max(rect.y, 0), Math.max(height - 40, 0));
  return { x, y, w, h };
}

export function wmReducer(state: WMState, action: WMAction): WMState {
  switch (action.type) {
    case "open": {
      const { id, appId, route, title, rect } = action;
      const win: WindowState = {
        id,
        appId,
        route,
        title,
        rect,
        minimized: false,
        maximized: Boolean(action.maximized),
        snap: "none",
        closing: false,
        parked: false,
        quiet: action.quiet,
      };
      let windows = { ...state.windows, [id]: win };
      if (action.solo) windows = hideOthers(windows, id);
      return { windows, order: raise(state.order, id), focused: id };
    }
    case "focus": {
      const w = state.windows[action.id];
      if (!w || w.closing) return state;
      const isTop = state.order[state.order.length - 1] === action.id;
      const settled = state.focused === action.id && !w.minimized && isTop;
      if (settled && !(action.solo && othersVisible(state, action.id))) return state;
      const next = update(state, action.id, { minimized: false, parked: false, quiet: false });
      let windows = next.windows;
      if (action.solo) windows = hideOthers(windows, action.id);
      return { windows, order: raise(state.order, action.id), focused: action.id };
    }
    case "blur":
      if (state.focused === null) return state;
      return { ...state, focused: null };
    case "minimize": {
      if (!state.windows[action.id]) return state;
      const next = update(state, action.id, { minimized: true, parked: false });
      let focused = state.focused;
      if (focused === action.id) focused = topVisible(state, action.id);
      return { ...next, focused };
    }
    case "close": {
      if (!state.windows[action.id]) return state;
      let next = update(state, action.id, { closing: true });
      let focused = state.focused;
      if (focused === action.id) {
        focused = topVisible(state, action.id);
        // Closing the only window on screen returns to the one it replaced.
        const back = topParked(state, action.id);
        if (!focused && back) {
          next = update(next, back, { minimized: false, parked: false });
          focused = back;
        }
      }
      return { ...next, focused };
    }
    case "remove": {
      const w = state.windows[action.id];
      // A window reopened during its close animation is no longer closing; keep it.
      if (!w || !w.closing) return state;
      const windows = { ...state.windows };
      delete windows[action.id];
      let focused = state.focused;
      if (focused === action.id) focused = null;
      return { windows, order: state.order.filter((o) => o !== action.id), focused };
    }
    case "toggleMaximize": {
      const w = state.windows[action.id];
      if (!w) return state;
      let maximized = !w.maximized;
      if (w.snap !== "none") maximized = true;
      const next = update(state, action.id, { maximized, snap: "none", minimized: false, parked: false });
      return { ...next, order: raise(state.order, action.id), focused: action.id };
    }
    case "snap": {
      const w = state.windows[action.id];
      if (!w) return state;
      const next = update(state, action.id, { snap: action.side, maximized: false, minimized: false, parked: false });
      return { ...next, order: raise(state.order, action.id), focused: action.id };
    }
    case "move": {
      const w = state.windows[action.id];
      if (!w) return state;
      return update(state, action.id, { rect: { ...w.rect, x: action.x, y: action.y } });
    }
    case "setRect":
      return update(state, action.id, { rect: action.rect });
    case "detach":
      // Dragging a maximized or snapped window pulls it back to its normal size.
      return update(state, action.id, { rect: action.rect, maximized: false, snap: "none" });
    case "setRoute": {
      const w = state.windows[action.id];
      if (!w) return state;
      if (w.route === action.route && (action.title === undefined || action.title === w.title)) return state;
      return update(state, action.id, { route: action.route, title: action.title || w.title });
    }
    case "clamp": {
      let changed = false;
      const windows: Record<string, WindowState> = {};
      for (const [id, w] of Object.entries(state.windows)) {
        const rect = clampRect(w.rect, action.width, action.height);
        const same = rect.x === w.rect.x && rect.y === w.rect.y && rect.w === w.rect.w && rect.h === w.rect.h;
        if (same) {
          windows[id] = w;
        } else {
          windows[id] = { ...w, rect };
          changed = true;
        }
      }
      if (!changed) return state;
      return { ...state, windows };
    }
  }
}
