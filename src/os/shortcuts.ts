// Keyboard shortcuts, shared by the desktop key handler and the help document.
// "Mod" is Ctrl on Windows/Linux and ⌘ on macOS.

export const shortcuts: { keys: string; action: string }[] = [
  { keys: "Mod + K", action: "Search apps, projects, and skills" },
  { keys: "Mod + ,", action: "Open Settings" },
  { keys: "Alt + Shift + W", action: "Close the focused window" },
  { keys: "Alt + Shift + M", action: "Minimize the focused window" },
  { keys: "Alt + Shift + ↑", action: "Maximize or restore the focused window" },
  { keys: "Alt + Shift + ← / →", action: "Snap the focused window left or right" },
  { keys: "Alt + Shift + ↓", action: "Restore a snapped window, or minimize" },
  { keys: "Alt + Shift + `", action: "Cycle through open windows" },
  { keys: "Esc", action: "Close menus, search, and notifications" },
  { keys: "Double-click title bar", action: "Maximize or restore" },
  { keys: "Drag to screen edge", action: "Snap left, right, or (top) maximize" },
];

export function shortcutsText() {
  const width = Math.max(...shortcuts.map((s) => s.keys.length));
  return [
    "Keyboard shortcuts",
    "",
    ...shortcuts.map((s) => `  ${s.keys.padEnd(width)}   ${s.action}`),
    "",
    "Mod is Ctrl on Windows and Linux, ⌘ on macOS.",
  ].join("\n");
}
