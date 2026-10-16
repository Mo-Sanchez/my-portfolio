import { createContext, useContext } from "react";
import type { AppId } from "../apps/meta";
import type { OpenTarget } from "../fs";
import type { DockSize, Settings, ThemePref } from "./settings";
import type { Rect, Snap, WMState } from "./windows";

export const MENUBAR_H = 32;

// Space kept clear above the bottom of the screen for the dock.
const DOCK_BASE: Record<DockSize, number> = { small: 78, medium: 88, large: 100 };
const DOCK_LABEL_H = 16;

export function dockReserve(size: DockSize, labels: boolean) {
  let reserve = DOCK_BASE[size];
  if (labels) reserve += DOCK_LABEL_H;
  return reserve;
}

export type OSAction =
  | { type: "open"; appId: AppId; route?: string }
  | { type: "url"; url: string }
  | { type: "copyEmail" }
  | { type: "downloadResume" }
  | { type: "theme"; theme: ThemePref }
  | { type: "search" };

export type Notice = {
  id: number;
  title: string;
  body?: string;
  appId?: AppId;
  time: number;
  action?: { label: string; run: OSAction };
};

export type MenuItem =
  | { label: string; onSelect: () => void; shortcut?: string; detail?: string; danger?: boolean; checked?: boolean }
  | "separator";

export type ContextMenuState = { x: number; y: number; items: MenuItem[]; label: string } | null;

export type OSValue = {
  wm: WMState;
  settings: Settings;
  theme: "dark" | "light";
  motion: "full" | "reduced";
  isMobile: boolean;
  isTouch: boolean;
  notices: Notice[];
  toasts: Notice[];
  launcherOpen: boolean;
  contextMenu: ContextMenuState;
  // Height reserved for the dock, in pixels.
  dockReserve: number;
  desktopSize: () => { width: number; height: number };
  openApp: (appId: AppId, route?: string, opts?: { quiet?: boolean }) => void;
  openTarget: (target: OpenTarget) => void;
  run: (action: OSAction) => void;
  focusWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  snapWindow: (id: string, side: Snap) => void;
  setWindowRect: (id: string, rect: Rect, detach?: boolean) => void;
  setWindowRoute: (id: string, route: string, title?: string) => void;
  showDesktop: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
  notify: (n: Omit<Notice, "id" | "time">) => void;
  dismissToast: (id: number) => void;
  clearNotices: () => void;
  setLauncherOpen: (open: boolean) => void;
  openContextMenu: (menu: NonNullable<ContextMenuState>) => void;
  closeContextMenu: () => void;
};

export const OSContext = createContext<OSValue | null>(null);

export function useOS() {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error("useOS must be used inside <OSProvider>");
  return ctx;
}

