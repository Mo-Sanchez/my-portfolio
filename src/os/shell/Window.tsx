import { Component, memo, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { appComponents, titleOf } from "../apps/registry";
import { appMeta, type AppId } from "../apps/meta";
import { clamp, cx } from "../lib/util";
import { useOS } from "../state/os";
import { clampRect, type Rect, type WindowState } from "../state/windows";
import AppIcon from "../ui/AppIcon";
import { MaximizeIcon, MinimizeIcon, RestoreIcon, XIcon } from "../ui/Glyphs";

// ---------------------------------------------------------------------------
// App host: loads the app lazily and contains crashes to a single window.
// ---------------------------------------------------------------------------

class AppErrorBoundary extends Component<{ children: ReactNode; name: string }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="appState" role="alert">
          <p className="appStateTitle">{this.props.name} ran into a problem.</p>
          <p className="muted">Something went wrong while loading this app.</p>
          <button type="button" className="btn" onClick={() => this.setState({ error: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AppLoading() {
  return (
    <div className="appState" aria-busy="true">
      <div className="spinner" />
      <span className="srOnly">Loading…</span>
    </div>
  );
}

type HostProps = {
  appId: AppId;
  route: string;
  windowId: string;
  active: boolean;
  setRoute: (route: string) => void;
};

// Memoized so window moves and focus changes don't re-render app content.
export const AppHost = memo(function AppHost({ appId, route, windowId, active, setRoute }: HostProps) {
  const App = appComponents[appId];
  return (
    <AppErrorBoundary name={appMeta[appId].title}>
      <Suspense fallback={<AppLoading />}>
        <App windowId={windowId} route={route} setRoute={setRoute} active={active} />
      </Suspense>
    </AppErrorBoundary>
  );
});

// ---------------------------------------------------------------------------
// Window frame
// ---------------------------------------------------------------------------

type Hint = "left" | "right" | "max" | null;
const DIRS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;
type Dir = (typeof DIRS)[number];

function WindowFrame({ win, focused, z }: { win: WindowState; focused: boolean; z: number }) {
  const os = useOS();
  const { focusWindow, setWindowRect, toggleMaximize, snapWindow, closeWindow, minimizeWindow, setWindowRoute } = os;
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState<Rect | null>(null);
  const [hint, setHint] = useState<Hint>(null);
  const [mode, setMode] = useState<"idle" | "drag" | "resize">("idle");
  const cleanup = useRef<(() => void) | null>(null);
  const appId = win.appId as AppId;
  const meta = appMeta[appId];
  const floating = !win.maximized && win.snap === "none";

  useEffect(() => () => cleanup.current?.(), []);

  // Move keyboard focus into the window when it becomes active.
  useEffect(() => {
    const el = ref.current;
    if (focused && !win.minimized && el && !el.contains(document.activeElement)) {
      el.focus({ preventScroll: true });
    }
  }, [focused, win.minimized]);

  const track = (onMove: (ev: PointerEvent) => void, onEnd: () => void) => {
    const end = (ev?: PointerEvent) => {
      // Browsers coalesce pointermove, so the release point can be newer than
      // the last move we saw. Apply it so the window lands under the cursor.
      if (ev?.type === "pointerup") onMove(ev);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      document.documentElement.classList.remove("isInteracting");
      cleanup.current = null;
      onEnd();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    cleanup.current = end;
  };

  const desktopBox = () => ref.current?.parentElement?.getBoundingClientRect();

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const el = ref.current;
    const desk = desktopBox();
    if (!el || !desk) return;
    focusWindow(win.id);

    const box = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    let grabX = e.clientX - box.left;
    const grabY = e.clientY - box.top;
    let attached = !floating;
    let w = box.width;
    let h = box.height;
    if (attached) {
      w = win.rect.w;
      h = win.rect.h;
    }
    let moved = false;
    let last: Rect = win.rect;
    let lastHint: Hint = null;

    track(
      (ev) => {
        if (!moved) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 4) return;
          moved = true;
          setMode("drag");
          document.documentElement.classList.add("isInteracting");
        }
        if (attached) {
          // Pulling a maximized window off the edge: keep the cursor at the
          // same relative spot on the (now smaller) title bar.
          grabX = clamp(w * (grabX / box.width), 40, w - 40);
          attached = false;
        }
        const x = Math.round(ev.clientX - desk.left - grabX);
        const y = Math.round(clamp(ev.clientY - desk.top - grabY, 0, desk.height - 40));
        last = { x, y, w, h };
        setLive(last);

        let next: Hint = null;
        if (ev.clientX <= desk.left + 8) next = "left";
        else if (ev.clientX >= desk.right - 8) next = "right";
        else if (ev.clientY <= desk.top + 4) next = "max";
        if (next !== lastHint) {
          lastHint = next;
          setHint(next);
        }
      },
      () => {
        setMode("idle");
        setLive(null);
        setHint(null);
        if (!moved) return;
        const rect = clampRect(last, desk.width, desk.height);
        setWindowRect(win.id, rect, true);
        if (lastHint === "max") toggleMaximize(win.id);
        else if (lastHint) snapWindow(win.id, lastHint);
      },
    );
  };

  const onResizeDown = (dir: Dir) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    const desk = desktopBox();
    if (!el || !desk) return;
    focusWindow(win.id);
    const box = el.getBoundingClientRect();
    const base: Rect = { x: box.left - desk.left, y: box.top - desk.top, w: box.width, h: box.height };
    const startX = e.clientX;
    const startY = e.clientY;
    let last = base;
    setMode("resize");
    document.documentElement.classList.add("isInteracting");

    track(
      (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let { x, y, w, h } = base;
        if (dir.includes("e")) w = Math.max(meta.minSize.w, Math.min(base.w + dx, desk.width - base.x));
        if (dir.includes("s")) h = Math.max(meta.minSize.h, Math.min(base.h + dy, desk.height - base.y));
        if (dir.includes("w")) {
          w = Math.max(meta.minSize.w, base.w - dx);
          x = base.x + base.w - w;
        }
        if (dir.includes("n")) {
          h = Math.max(meta.minSize.h, base.h - dy);
          y = base.y + base.h - h;
          if (y < 0) {
            h += y;
            y = 0;
          }
        }
        last = { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
        setLive(last);
      },
      () => {
        setMode("idle");
        setLive(null);
        setWindowRect(win.id, last, true);
      },
    );
  };

  const setRoute = useCallback(
    (route: string) => setWindowRoute(win.id, route, titleOf(appId, route)),
    [setWindowRoute, win.id, appId],
  );

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    let maxLabel = "Maximize";
    if (win.maximized) maxLabel = "Restore";
    os.openContextMenu({
      x: e.clientX,
      y: e.clientY,
      label: `${win.title} window`,
      items: [
        { label: "Minimize", onSelect: () => minimizeWindow(win.id), shortcut: "Alt⇧M" },
        { label: maxLabel, onSelect: () => toggleMaximize(win.id), shortcut: "Alt⇧↑" },
        { label: "Snap Left", onSelect: () => snapWindow(win.id, "left"), shortcut: "Alt⇧←" },
        { label: "Snap Right", onSelect: () => snapWindow(win.id, "right"), shortcut: "Alt⇧→" },
        "separator",
        { label: "Close", onSelect: () => closeWindow(win.id), shortcut: "Alt⇧W", danger: true },
      ],
    });
  };

  const rect = live || win.rect;
  const style: React.CSSProperties = { zIndex: z };
  if (live || floating) {
    style.left = rect.x;
    style.top = rect.y;
    style.width = rect.w;
    style.height = rect.h;
  }

  let MaxGlyph = MaximizeIcon;
  let maxLabel = "Maximize";
  if (win.maximized) {
    MaxGlyph = RestoreIcon;
    maxLabel = "Restore";
  }

  let hintClass = "";
  if (hint === "left") hintClass = "snapLeft";
  if (hint === "right") hintClass = "snapRight";
  if (hint === "max") hintClass = "snapMax";

  return (
    <>
      {hint && <div className={cx("snapPreview", hintClass)} aria-hidden="true" />}
      <section
        ref={ref}
        className={cx(
          "window",
          focused && "isFocused",
          win.minimized && "isMinimized",
          win.closing && "isClosing",
          !live && win.maximized && "isMaximized",
          !live && win.snap === "left" && "isSnapLeft",
          !live && win.snap === "right" && "isSnapRight",
          mode === "idle" && "animGeom",
          mode === "drag" && "isDragging",
        )}
        style={style}
        aria-label={win.title}
        aria-hidden={win.minimized || undefined}
        tabIndex={-1}
        onPointerDownCapture={() => {
          if (!focused) focusWindow(win.id);
        }}
        data-window={win.id}
      >
        <header
          className="titlebar"
          onPointerDown={onTitlePointerDown}
          onDoubleClick={(e) => {
            if (!(e.target as HTMLElement).closest("button")) toggleMaximize(win.id);
          }}
          onContextMenu={onContextMenu}
        >
          <AppIcon app={appId} size={18} className="titleIcon" />
          <h2 className="winTitle">{win.title}</h2>
          <div className="winControls">
            <button type="button" className="winBtn" aria-label={`Minimize ${win.title}`} title="Minimize" onClick={() => minimizeWindow(win.id)}>
              <MinimizeIcon />
            </button>
            <button type="button" className="winBtn" aria-label={`${maxLabel} ${win.title}`} title={maxLabel} onClick={() => toggleMaximize(win.id)}>
              <MaxGlyph width={14} height={14} />
            </button>
            <button type="button" className="winBtn winClose" aria-label={`Close ${win.title}`} title="Close" onClick={() => closeWindow(win.id)}>
              <XIcon />
            </button>
          </div>
        </header>

        <div className="winBody">
          <AppHost appId={appId} route={win.route} windowId={win.id} active={focused && !win.minimized} setRoute={setRoute} />
        </div>

        {floating &&
          DIRS.map((d) => <div key={d} className={`rz rz-${d}`} onPointerDown={onResizeDown(d)} aria-hidden="true" />)}
      </section>
    </>
  );
}

export default memo(WindowFrame);
