import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { profile } from "../../data/content";
import { appMeta, isAppId, windowIdFor, type AppId } from "../apps/meta";
import type { OpenTarget } from "../fs";
import { useMediaQuery } from "../lib/hooks";
import { copyText, loadJSON, saveJSON } from "../lib/util";
import { dockReserve, MENUBAR_H, OSContext, type ContextMenuState, type Notice, type OSAction, type OSValue } from "./os";
import { formatHash, HOME, hrefOf, sameTarget, targetOfHash, type Target } from "./router";
import {
  accents,
  defaultSettings,
  loadSettings,
  resolveMotion,
  resolveTheme,
  saveSettings,
  type Settings,
} from "./settings";
import { clampRect, focusedWindow, initialWM, wmReducer, type Rect, type Snap } from "./windows";

const RECTS_KEY = "moos:window-rects";

export function OSProvider({ children, titleOf }: { children: ReactNode; titleOf: (appId: AppId, route: string) => string }) {
  const [wm, dispatch] = useReducer(wmReducer, initialWM);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [toastIds, setToastIds] = useState<number[]>([]);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 767px), (max-height: 500px) and (pointer: coarse)");
  const isTouch = useMediaQuery("(pointer: coarse)");
  const theme = resolveTheme(settings.theme, systemDark);
  const motion = resolveMotion(settings.motion, systemReduced);
  const reserve = dockReserve(settings.dockSize, settings.dockLabels);
  // Phones always show one full-screen app, so single-window mode is desktop only.
  const solo = settings.singleWindow && !isMobile;

  // Refs let stable callbacks read the latest values without re-creating.
  const wmRef = useRef(wm);
  const motionRef = useRef(motion);
  const titleOfRef = useRef(titleOf);
  const reserveRef = useRef(reserve);
  const soloRef = useRef(solo);
  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    wmRef.current = wm;
    motionRef.current = motion;
    titleOfRef.current = titleOf;
    reserveRef.current = reserve;
    soloRef.current = solo;
    isMobileRef.current = isMobile;
  });

  // ---- Appearance ---------------------------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.motion = motion;
    root.dataset.transparency = settings.transparency;
    root.dataset.dock = settings.dockSize;
    root.dataset.dockLabels = String(settings.dockLabels);
    root.style.setProperty("--dock-reserve", `${reserve}px`);
    const accent = accents.find((a) => a.id === settings.accent) || accents[0];
    let accentColor = accent.dark;
    if (theme === "light") accentColor = accent.light;
    root.style.setProperty("--accent", accentColor);
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      let color = "#151b19";
      if (theme === "light") color = "#e8ede9";
      meta.setAttribute("content", color);
    }
  }, [theme, motion, settings.transparency, settings.dockSize, settings.dockLabels, settings.accent, reserve]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  // ---- Notifications ------------------------------------------------------
  const nextNotice = useRef(1);
  const notify = useCallback((n: Omit<Notice, "id" | "time">) => {
    const id = nextNotice.current++;
    const notice: Notice = { ...n, id, time: Date.now() };
    setNotices((list) => [notice, ...list].slice(0, 30));
    setToastIds((ids) => [...ids, id].slice(-3));
    window.setTimeout(() => setToastIds((ids) => ids.filter((t) => t !== id)), 5200);
  }, []);
  const dismissToast = useCallback((id: number) => setToastIds((ids) => ids.filter((t) => t !== id)), []);
  const clearNotices = useCallback(() => {
    setNotices([]);
    setToastIds([]);
  }, []);
  const toasts = useMemo(
    () => toastIds.map((id) => notices.find((n) => n.id === id)).filter((n): n is Notice => Boolean(n)),
    [toastIds, notices],
  );

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    notify({ title: "Settings restored", body: "MoOS is back to its default look.", appId: "settings" });
  }, [notify]);

  // ---- Windows ------------------------------------------------------------
  const desktopSize = useCallback(() => {
    return { width: window.innerWidth, height: Math.max(window.innerHeight - MENUBAR_H - reserveRef.current, 240) };
  }, []);

  const rememberRect = useCallback((appId: string, rect: Rect) => {
    if (isAppId(appId) && appMeta[appId].perRoute) return;
    const rects = loadJSON<Record<string, Rect>>(RECTS_KEY, {});
    rects[appId] = rect;
    saveJSON(RECTS_KEY, rects);
  }, []);

  const defaultRect = useCallback(
    (appId: AppId): Rect => {
      const { width, height } = desktopSize();
      const meta = appMeta[appId];
      const remembered = loadJSON<Record<string, Rect>>(RECTS_KEY, {})[appId];
      if (remembered && typeof remembered.x === "number") return clampRect(remembered, width, height);
      if (soloRef.current) {
        // One window at a time: open large and centred, like a page, leaving
        // the desktop icon column on the right uncovered.
        const w = Math.min(Math.round(meta.size.w * 1.2), 1120, width - 240);
        const h = Math.min(Math.round(meta.size.h * 1.12), 780, height - 24);
        const x = Math.round((width - w) / 2);
        const y = Math.max(8, Math.round((height - h) / 2.6));
        return clampRect({ x, y, w, h }, width, height);
      }
      const w = Math.min(meta.size.w, width - 32);
      const h = Math.min(meta.size.h, height - 24);
      // Cascade new windows so they don't stack exactly on top of each other.
      const open = Object.values(wmRef.current.windows).filter((win) => !win.closing && !win.minimized).length;
      const offset = (open % 6) * 28;
      let x = Math.round((width - w) / 2) + offset - 70;
      let y = Math.round((height - h) / 2.4) + offset;
      // Keep the whole window inside the desktop, clear of the dock.
      x = Math.max(16, Math.min(x, width - w - 16));
      y = Math.max(8, Math.min(y, height - h - 8));
      return clampRect({ x, y, w, h }, width, height);
    },
    [desktopSize],
  );

  const openApp = useCallback(
    (appId: AppId, requested = "", opts: { quiet?: boolean } = {}) => {
      const route = requested || appMeta[appId].defaultRoute || "";
      const id = windowIdFor(appId, route);
      const existing = wmRef.current.windows[id];
      if (existing && !existing.closing) {
        dispatch({ type: "focus", id, solo: soloRef.current });
        if (route !== existing.route && !appMeta[appId].perRoute) {
          dispatch({ type: "setRoute", id, route, title: titleOfRef.current(appId, route) });
        }
        return;
      }
      const { width } = desktopSize();
      const tablet = width < 1024;
      dispatch({
        type: "open",
        id,
        appId,
        route,
        title: titleOfRef.current(appId, route),
        rect: defaultRect(appId),
        maximized: tablet,
        solo: soloRef.current,
        quiet: opts.quiet,
      });
    },
    [defaultRect, desktopSize],
  );

  const focusWindow = useCallback((id: string) => dispatch({ type: "focus", id, solo: soloRef.current }), []);
  const minimizeWindow = useCallback((id: string) => dispatch({ type: "minimize", id }), []);
  const toggleMaximize = useCallback((id: string) => dispatch({ type: "toggleMaximize", id }), []);
  const snapWindow = useCallback((id: string, side: Snap) => dispatch({ type: "snap", id, side }), []);
  const showDesktop = useCallback(() => dispatch({ type: "blur" }), []);

  const closeWindow = useCallback(
    (id: string) => {
      const win = wmRef.current.windows[id];
      if (!win || win.closing) return;
      rememberRect(win.appId, win.rect);
      dispatch({ type: "close", id });
      let delay = 170;
      if (motionRef.current === "reduced") delay = 0;
      window.setTimeout(() => dispatch({ type: "remove", id }), delay);
    },
    [rememberRect],
  );

  const setWindowRect = useCallback(
    (id: string, rect: Rect, detach = false) => {
      const win = wmRef.current.windows[id];
      if (!win) return;
      if (detach) dispatch({ type: "detach", id, rect });
      else dispatch({ type: "setRect", id, rect });
      rememberRect(win.appId, rect);
    },
    [rememberRect],
  );

  const setWindowRoute = useCallback((id: string, route: string, title?: string) => {
    dispatch({ type: "setRoute", id, route, title });
  }, []);

  // Keep windows clear of the dock when its size or labels change.
  useEffect(() => {
    const { width, height } = desktopSize();
    dispatch({ type: "clamp", width, height });
  }, [reserve, desktopSize]);

  // Keep windows reachable when the browser window shrinks.
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { width, height } = desktopSize();
        dispatch({ type: "clamp", width, height });
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [desktopSize]);

  // ---- Actions ------------------------------------------------------------
  const run = useCallback(
    (action: OSAction) => {
      switch (action.type) {
        case "open":
          openApp(action.appId, action.route || "");
          break;
        case "url":
          window.open(action.url, "_blank", "noopener,noreferrer");
          break;
        case "copyEmail":
          copyText(profile.email).then((ok) => {
            if (ok) notify({ title: "Email copied", body: profile.email, appId: "contact" });
            else notify({ title: "Couldn't copy email", body: `Your browser blocked the clipboard. The address is ${profile.email}.`, appId: "contact" });
          });
          break;
        case "downloadResume": {
          const a = document.createElement("a");
          a.href = profile.resume;
          a.download = "Moises_Sanchez_Resume.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
          notify({ title: "Downloading résumé", body: "Moises_Sanchez_Resume.pdf", appId: "resume" });
          break;
        }
        case "theme":
          updateSettings({ theme: action.theme });
          break;
        case "search":
          setLauncherOpen(true);
          break;
      }
    },
    [notify, openApp, updateSettings],
  );

  const openTarget = useCallback(
    (target: OpenTarget) => {
      if ("url" in target) run({ type: "url", url: target.url });
      else openApp(target.appId, target.route);
    },
    [openApp, run],
  );

  // ---- History / deep links -----------------------------------------------
  // The URL hash mirrors the focused window. Opening or focusing a window
  // pushes a history entry; Back/Forward reopen whatever the hash points to.
  const focusedWin = focusedWindow(wm);
  const focusedTarget: Target | null = useMemo(() => {
    if (!focusedWin || focusedWin.closing) return null;
    return { appId: focusedWin.appId, route: focusedWin.route };
  }, [focusedWin]);

  // The window a link is opening; the hash isn't rewritten until it exists.
  const pendingRef = useRef<Target | null>(null);

  // A bare URL opens Home (on phones the home screen already plays that role).
  useEffect(() => {
    const applyHash = (landing: boolean) => {
      let target = targetOfHash(window.location.hash);
      // An unknown link on arrival lands on Home rather than an empty desktop.
      if (!target && landing) target = HOME;
      if (target && sameTarget(target, HOME) && isMobileRef.current) target = null;
      if (target && isAppId(target.appId)) {
        pendingRef.current = { appId: target.appId, route: target.route || appMeta[target.appId].defaultRoute || "" };
        openApp(target.appId, target.route, { quiet: landing });
      } else {
        pendingRef.current = null;
        dispatch({ type: "blur" });
      }
    };
    const onPop = () => applyHash(false);
    applyHash(true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [openApp]);

  useEffect(() => {
    const pending = pendingRef.current;
    if (pending) {
      const opened = wmRef.current.windows[windowIdFor(pending.appId as AppId, pending.route)];
      // Still opening: leave the URL alone so the link isn't overwritten.
      if (!opened && !sameTarget(pending, focusedTarget)) return;
      pendingRef.current = null;
    }
    let current = targetOfHash(window.location.hash);
    let hash = formatHash(focusedTarget);
    // On phones the home screen is Home, so it also lives at the bare URL.
    if (isMobileRef.current) {
      if (!focusedTarget) hash = "";
      if (sameTarget(current, HOME)) current = null;
    }
    let valid: Target | null = null;
    if (current && isAppId(current.appId)) valid = current;

    if (sameTarget(valid, focusedTarget)) {
      // Already in sync (e.g. after Back/Forward); just normalize legacy anchors.
      if (window.location.hash !== hash) window.history.replaceState(window.history.state, "", hrefOf(hash));
      return;
    }
    if (current && !valid) {
      window.history.replaceState(window.history.state, "", hrefOf(hash));
      return;
    }
    window.history.pushState(window.history.state, "", hrefOf(hash));
  }, [focusedTarget]);

  // Window title follows the focused app, like a real OS.
  useEffect(() => {
    if (focusedWin && !focusedWin.closing) document.title = `${focusedWin.title} — MoOS · ${profile.name}`;
    else document.title = `MoOS · ${profile.name} | ${profile.role}`;
  }, [focusedWin]);

  const openContextMenu = useCallback((menu: NonNullable<ContextMenuState>) => setContextMenu(menu), []);
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const value: OSValue = {
    wm,
    settings,
    theme,
    motion,
    isMobile,
    isTouch,
    notices,
    toasts,
    launcherOpen,
    contextMenu,
    dockReserve: reserve,
    desktopSize,
    openApp,
    openTarget,
    run,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    snapWindow,
    setWindowRect,
    setWindowRoute,
    showDesktop,
    updateSettings,
    resetSettings,
    notify,
    dismissToast,
    clearNotices,
    setLauncherOpen,
    openContextMenu,
    closeContextMenu,
  };

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}
