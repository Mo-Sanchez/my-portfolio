import { describe, expect, it } from "vitest";
import { clampRect, focusedWindow, initialWM, wmReducer, type WMAction, type WMState } from "./windows";

const rect = { x: 100, y: 80, w: 600, h: 400 };

function run(...actions: WMAction[]): WMState {
  return actions.reduce(wmReducer, initialWM);
}

const open = (id: string): WMAction => ({ type: "open", id, appId: id, route: "", title: id, rect });

describe("window manager", () => {
  it("opens windows on top and focuses them", () => {
    const s = run(open("a"), open("b"));
    expect(s.order).toEqual(["a", "b"]);
    expect(s.focused).toBe("b");
    expect(focusedWindow(s)?.id).toBe("b");
  });

  it("raises a window when focused", () => {
    const s = run(open("a"), open("b"), { type: "focus", id: "a" });
    expect(s.order).toEqual(["b", "a"]);
    expect(s.focused).toBe("a");
  });

  it("minimizing moves focus to the next visible window", () => {
    const s = run(open("a"), open("b"), { type: "minimize", id: "b" });
    expect(s.windows.b.minimized).toBe(true);
    expect(s.focused).toBe("a");
  });

  it("minimizing the only window leaves nothing focused", () => {
    const s = run(open("a"), { type: "minimize", id: "a" });
    expect(s.focused).toBeNull();
  });

  it("focus restores a minimized window", () => {
    const s = run(open("a"), { type: "minimize", id: "a" }, { type: "focus", id: "a" });
    expect(s.windows.a.minimized).toBe(false);
    expect(s.focused).toBe("a");
  });

  it("repeated minimize/restore cycles stay consistent", () => {
    let s = run(open("a"), open("b"));
    for (let i = 0; i < 20; i++) {
      s = wmReducer(s, { type: "minimize", id: "a" });
      s = wmReducer(s, { type: "focus", id: "a" });
    }
    expect(s.order).toEqual(["b", "a"]);
    expect(s.windows.a.minimized).toBe(false);
    expect(s.focused).toBe("a");
  });

  it("close marks the window closing, then remove deletes it", () => {
    let s = run(open("a"), open("b"), { type: "close", id: "b" });
    expect(s.windows.b.closing).toBe(true);
    expect(s.focused).toBe("a");
    s = wmReducer(s, { type: "remove", id: "b" });
    expect(s.windows.b).toBeUndefined();
    expect(s.order).toEqual(["a"]);
  });

  it("reopening during the close animation keeps the window", () => {
    const s = run(open("a"), { type: "close", id: "a" }, open("a"), { type: "remove", id: "a" });
    expect(s.windows.a).toBeDefined();
    expect(s.windows.a.closing).toBe(false);
    expect(s.focused).toBe("a");
  });

  it("rapid open/close of many windows leaves a clean state", () => {
    let s = initialWM;
    for (let i = 0; i < 50; i++) {
      s = wmReducer(s, open(`w${i % 5}`));
      s = wmReducer(s, { type: "close", id: `w${(i + 2) % 5}` });
      s = wmReducer(s, { type: "remove", id: `w${(i + 2) % 5}` });
    }
    expect(new Set(s.order).size).toBe(s.order.length);
    expect(Object.keys(s.windows).sort()).toEqual([...s.order].sort());
    if (s.focused) expect(s.windows[s.focused]).toBeDefined();
  });

  it("toggles maximize and remembers the normal rect", () => {
    let s = run(open("a"), { type: "toggleMaximize", id: "a" });
    expect(s.windows.a.maximized).toBe(true);
    expect(s.windows.a.rect).toEqual(rect);
    s = wmReducer(s, { type: "toggleMaximize", id: "a" });
    expect(s.windows.a.maximized).toBe(false);
  });

  it("snapping clears maximize, and maximizing a snapped window maximizes it", () => {
    let s = run(open("a"), { type: "toggleMaximize", id: "a" }, { type: "snap", id: "a", side: "left" });
    expect(s.windows.a.snap).toBe("left");
    expect(s.windows.a.maximized).toBe(false);
    s = wmReducer(s, { type: "toggleMaximize", id: "a" });
    expect(s.windows.a.maximized).toBe(true);
    expect(s.windows.a.snap).toBe("none");
  });

  it("detach restores normal geometry from a maximized window", () => {
    const next = { x: 10, y: 10, w: 500, h: 300 };
    const s = run(open("a"), { type: "toggleMaximize", id: "a" }, { type: "detach", id: "a", rect: next });
    expect(s.windows.a.maximized).toBe(false);
    expect(s.windows.a.rect).toEqual(next);
  });

  it("setRoute ignores no-op updates", () => {
    const s = run(open("a"));
    expect(wmReducer(s, { type: "setRoute", id: "a", route: "" })).toBe(s);
    expect(wmReducer(s, { type: "setRoute", id: "a", route: "x", title: "X" }).windows.a.title).toBe("X");
  });

  it("ignores actions for unknown windows", () => {
    const s = run(open("a"));
    expect(wmReducer(s, { type: "minimize", id: "nope" })).toBe(s);
    expect(wmReducer(s, { type: "focus", id: "nope" })).toBe(s);
    expect(wmReducer(s, { type: "close", id: "nope" })).toBe(s);
  });

  it("clamps windows back into a smaller desktop", () => {
    const s = run({ type: "open", id: "a", appId: "a", route: "", title: "a", rect: { x: 1800, y: 900, w: 600, h: 400 } }, {
      type: "clamp",
      width: 1000,
      height: 700,
    });
    const r = s.windows.a.rect;
    expect(r.x).toBeLessThanOrEqual(1000 - 96);
    expect(r.y).toBeLessThanOrEqual(700 - 40);
  });

  it("clampRect keeps a grabbable strip on screen", () => {
    expect(clampRect({ x: -2000, y: -50, w: 600, h: 400 }, 1200, 800)).toEqual({ x: 96 - 600, y: 0, w: 600, h: 400 });
    expect(clampRect({ x: 0, y: 0, w: 3000, h: 3000 }, 1200, 800)).toEqual({ x: 0, y: 0, w: 1200, h: 800 });
  });
});
