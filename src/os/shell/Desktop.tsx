import { useCallback, useEffect, useState } from "react";
import { useOS } from "../state/os";
import { focusedWindow } from "../state/windows";
import ContextMenu from "./Menu";
import DesktopIcons from "./DesktopIcons";
import Dock from "./Dock";
import Launcher from "./Launcher";
import MenuBar from "./MenuBar";
import { NotificationCenter, Toasts } from "./Notifications";
import WindowFrame from "./Window";

function useShortcuts() {
  const os = useOS();
  const { wm, launcherOpen, setLauncherOpen } = os;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.altKey && e.code === "KeyK") {
        e.preventDefault();
        setLauncherOpen(!launcherOpen);
        return;
      }
      if (mod && e.code === "Comma") {
        e.preventDefault();
        os.openApp("settings");
        return;
      }
      if (!(e.altKey && e.shiftKey) || mod) return;

      const win = focusedWindow(wm);
      if (e.code === "Backquote") {
        e.preventDefault();
        const visible = wm.order.filter((id) => !wm.windows[id].closing);
        if (visible.length) os.focusWindow(visible[0]);
        return;
      }
      if (!win) return;
      const actions: Record<string, () => void> = {
        KeyW: () => os.closeWindow(win.id),
        KeyM: () => os.minimizeWindow(win.id),
        ArrowUp: () => os.toggleMaximize(win.id),
        ArrowLeft: () => os.snapWindow(win.id, "left"),
        ArrowRight: () => os.snapWindow(win.id, "right"),
        ArrowDown: () => {
          if (win.maximized) os.toggleMaximize(win.id);
          else if (win.snap !== "none") os.snapWindow(win.id, "none");
          else os.minimizeWindow(win.id);
        },
      };
      const action = actions[e.code];
      if (action) {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [os, wm, launcherOpen, setLauncherOpen]);
}

export default function Desktop() {
  const os = useOS();
  const { wm } = os;
  const [centerOpen, setCenterOpen] = useState(false);
  const closeCenter = useCallback(() => setCenterOpen(false), []);
  useShortcuts();

  return (
    <div className="desktopShell">
      <a className="skipLink" href="#dock">
        Skip to dock
      </a>
      <MenuBar centerOpen={centerOpen} onToggleCenter={() => setCenterOpen((o) => !o)} />
      <main className="desktop" aria-label="Desktop">
        <DesktopIcons />
        {wm.order.map((id, i) => (
          <WindowFrame key={id} win={wm.windows[id]} focused={wm.focused === id} z={10 + i} />
        ))}
      </main>
      <div id="dock">
        <Dock />
      </div>
      <Toasts hidden={centerOpen} />
      {centerOpen && <NotificationCenter onClose={closeCenter} />}
      <Launcher />
      <ContextMenu />
    </div>
  );
}
