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
};

export type WMState = {
  windows: Record<string, WindowState>;
  // Stacking order, bottom to top.
  order: string[];
  focused: string | null;
};

export type WMAction =
  | { type: "open"; id: string; appId: string; route: string; title: string; rect: Rect; maximized?: boolean }
  | { type: "focus"; id: string }
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
      };
      return { windows: { ...state.windows, [id]: win }, order: raise(state.order, id), focused: id };
    }
    case "focus": {
      const w = state.windows[action.id];
      if (!w || w.closing) return state;
      const isTop = state.order[state.order.length - 1] === action.id;
      if (state.focused === action.id && !w.minimized && isTop) return state;
      const next = update(state, action.id, { minimized: false });
      return { ...next, order: raise(state.order, action.id), focused: action.id };
    }
    case "blur":
      if (state.focused === null) return state;
      return { ...state, focused: null };
    case "minimize": {
      if (!state.windows[action.id]) return state;
      const next = update(state, action.id, { minimized: true });
      let focused = state.focused;
      if (focused === action.id) focused = topVisible(state, action.id);
      return { ...next, focused };
    }
    case "close": {
      if (!state.windows[action.id]) return state;
      const next = update(state, action.id, { closing: true });
      let focused = state.focused;
      if (focused === action.id) focused = topVisible(state, action.id);
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
      const next = update(state, action.id, { maximized, snap: "none", minimized: false });
      return { ...next, order: raise(state.order, action.id), focused: action.id };
    }
    case "snap": {
      const w = state.windows[action.id];
      if (!w) return state;
      const next = update(state, action.id, { snap: action.side, maximized: false, minimized: false });
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
