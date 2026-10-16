import { describe, expect, it } from "vitest";
import { allProjects } from "../data/content";
import { appMeta, windowIdFor } from "./apps/meta";
import { absolutePath, allFiles, displayPath, getNode, labelPath, projectText, resolvePath, root } from "./fs";
import { buildIndex, search, slugify } from "./search";
import { formatHash, parseHash, sameTarget } from "./state/router";
import { defaultSettings, resolveMotion, resolveTheme, sanitizeSettings } from "./state/settings";

describe("router", () => {
  it("parses app routes", () => {
    expect(parseHash("#/project/phantom-sky")).toEqual({ appId: "project", route: "phantom-sky" });
    expect(parseHash("#/finder/projects/apps-games")).toEqual({ appId: "finder", route: "projects/apps-games" });
    expect(parseHash("#/about")).toEqual({ appId: "about", route: "" });
  });

  it("maps legacy single-page anchors", () => {
    expect(parseHash("#projects")).toEqual({ appId: "finder", route: "projects" });
    expect(parseHash("#skills")).toEqual({ appId: "about", route: "skills" });
    expect(parseHash("#contact")).toEqual({ appId: "contact", route: "" });
    expect(parseHash("#home")).toBeNull();
  });

  it("treats empty and junk hashes as the desktop", () => {
    expect(parseHash("")).toBeNull();
    expect(parseHash("#/")).toBeNull();
    expect(parseHash("#/<script>")).toBeNull();
    expect(parseHash("#/%E0%A4%A")).toBeNull();
  });

  it("round-trips through formatHash", () => {
    const t = { appId: "reader", route: "documents/education.txt" };
    expect(parseHash(formatHash(t))).toEqual(t);
    expect(formatHash(null)).toBe("#/");
    expect(sameTarget(t, { ...t })).toBe(true);
    expect(sameTarget(t, null)).toBe(false);
  });
});

describe("virtual filesystem", () => {
  it("resolves shell-style paths", () => {
    expect(resolvePath([], "projects/apps-games")).toEqual(["projects", "apps-games"]);
    expect(resolvePath(["projects"], "..")).toEqual([]);
    expect(resolvePath([], "..")).toEqual([]);
    expect(resolvePath(["projects"], "~/documents")).toEqual(["documents"]);
    expect(resolvePath(["projects"], "/home/moises/documents")).toEqual(["documents"]);
    expect(resolvePath(["a"], "./b/../c")).toEqual(["a", "c"]);
  });

  it("formats paths", () => {
    expect(displayPath([])).toBe("~");
    expect(displayPath(["projects"])).toBe("~/projects");
    expect(absolutePath(["projects"])).toBe("/home/moises/projects");
    expect(labelPath(["projects", "apps-games"])).toEqual(["Projects", "Apps & Games"]);
  });

  it("contains every project exactly once under projects/", () => {
    const projectFiles = allFiles().filter((f) => f.node.type === "project");
    expect(projectFiles.map((f) => f.node.slug).sort()).toEqual(allProjects.map((p) => p.slug).sort());
    for (const f of projectFiles) expect(f.path[0]).toBe("projects");
  });

  it("never exposes placeholder copy", () => {
    for (const { node } of allFiles()) expect(node.text()).not.toMatch(/\[Placeholder/);
    for (const p of allProjects) expect(projectText(p)).not.toMatch(/\[Placeholder/);
  });

  it("text files resolve back through their reader route", () => {
    for (const { node } of allFiles()) {
      if (node.type !== "text" || !("appId" in node.open)) continue;
      expect(getNode(node.open.route.split("/"))).toBe(node);
    }
  });

  it("has the expected top-level folders", () => {
    const names = root.children.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(["desktop", "projects", "documents", "applications", "README.md"]));
  });
});

describe("search", () => {
  const index = buildIndex();

  it("suggests key destinations for an empty query", () => {
    const ids = search(index, "").map((r) => r.id);
    expect(ids.slice(0, 3)).toEqual(["app:finder", "app:experience", "app:resume"]);
  });

  it("finds projects by name and by stack", () => {
    expect(search(index, "phantom")[0].id).toBe("project:phantom-sky");
    expect(search(index, "selenium").some((r) => r.id === "project:flight-info-scraper")).toBe(true);
  });

  it("finds skills, apps, and actions", () => {
    expect(search(index, "postgres").some((r) => r.kind === "Skill")).toBe(true);
    expect(search(index, "terminal")[0].id).toBe("app:terminal");
    expect(search(index, "resume").some((r) => r.action.type === "downloadResume")).toBe(true);
  });

  it("requires every word to match and handles regex characters", () => {
    expect(search(index, "phantom zzzz")).toEqual([]);
    expect(() => search(index, "c++ (")).not.toThrow();
    expect(search(index, "c++").some((r) => r.title === "C++")).toBe(true);
  });

  it("slugifies titles", () => {
    expect(slugify("Trailer loading process")).toBe("trailer-loading-process");
    expect(slugify("Automation & AI")).toBe("automation-and-ai");
  });
});

describe("settings", () => {
  it("falls back to defaults for bad input", () => {
    expect(sanitizeSettings(null)).toEqual(defaultSettings);
    expect(sanitizeSettings("nope")).toEqual(defaultSettings);
  });

  it("keeps valid values and drops invalid ones", () => {
    const s = sanitizeSettings({ theme: "light", accent: "neon", dockMagnify: "yes", wallpaper: "blue-hour", extra: 1 });
    expect(s.theme).toBe("light");
    expect(s.accent).toBe(defaultSettings.accent);
    expect(s.dockMagnify).toBe(defaultSettings.dockMagnify);
    expect(s.wallpaper).toBe("blue-hour");
    expect("extra" in s).toBe(false);
  });

  it("resolves system preferences", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveMotion("system", true)).toBe("reduced");
    expect(resolveMotion("full", true)).toBe("full");
  });
});

describe("app registry", () => {
  it("uses one window per route only for per-route apps", () => {
    expect(windowIdFor("about", "skills")).toBe("about");
    expect(windowIdFor("project", "phantom-sky")).toBe("project:phantom-sky");
    expect(appMeta.project.perRoute).toBe(true);
  });
});
