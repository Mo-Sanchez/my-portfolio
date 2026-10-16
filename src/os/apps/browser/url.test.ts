import { describe, expect, it } from "vitest";
import { displayUrl, fromRoute, hostOf, normalize, resolve, searchContent, titleFor, toRoute } from "./url";

describe("normalize", () => {
  it("treats empty input as the start page", () => {
    expect(normalize("   ")).toEqual({ kind: "internal", path: "home" });
  });

  it("parses moos:// addresses", () => {
    expect(normalize("moos://projects/phantom-sky")).toEqual({ kind: "internal", path: "projects/phantom-sky" });
    expect(normalize("moos://")).toEqual({ kind: "internal", path: "home" });
    expect(normalize("MOOS://About/")).toEqual({ kind: "internal", path: "about" });
  });

  it("recognizes bare internal page names", () => {
    expect(normalize("projects")).toEqual({ kind: "internal", path: "projects" });
    expect(normalize("resume")).toEqual({ kind: "internal", path: "resume" });
  });

  it("keeps http(s) URLs external", () => {
    expect(normalize("https://github.com/Mo-Sanchez")).toEqual({ kind: "external", url: "https://github.com/Mo-Sanchez" });
  });

  it("turns bare domains into https URLs", () => {
    expect(normalize("github.com/Mo-Sanchez")).toEqual({ kind: "external", url: "https://github.com/Mo-Sanchez" });
  });

  it("searches plain words", () => {
    expect(normalize("java swing")).toEqual({ kind: "search", query: "java swing" });
    expect(normalize("blazor")).toEqual({ kind: "search", query: "blazor" });
  });

  it("never produces non-http external links", () => {
    expect(normalize("javascript:alert(1)").kind).toBe("search");
  });
});

describe("resolve", () => {
  it("jumps to a project on an exact name match", () => {
    expect(resolve({ kind: "search", query: "Phantom Sky" })).toEqual({ kind: "internal", path: "projects/phantom-sky" });
  });

  it("leaves other searches alone", () => {
    expect(resolve({ kind: "search", query: "sky" })).toEqual({ kind: "search", query: "sky" });
  });
});

describe("routes", () => {
  it("round-trips internal pages and searches", () => {
    for (const input of ["moos://projects/phantom-sky", "moos://about", "moos://home", "hello world"]) {
      const loc = normalize(input);
      const route = toRoute(loc);
      expect(route).not.toBeNull();
      expect(displayUrl(fromRoute(route!))).toBe(displayUrl(loc));
    }
  });

  it("maps the start page to an empty route", () => {
    expect(toRoute(normalize("moos://home"))).toBe("");
    expect(fromRoute("")).toEqual({ kind: "internal", path: "home" });
  });

  it("doesn't change the route for external pages", () => {
    expect(toRoute(normalize("https://example.com"))).toBeNull();
  });
});

describe("hostOf", () => {
  it("strips www", () => {
    expect(hostOf("https://www.linkedin.com/in/x")).toBe("linkedin.com");
  });
});

describe("titleFor", () => {
  it("names internal pages", () => {
    expect(titleFor(normalize("moos://projects/phantom-sky"))).toBe("Phantom Sky");
    expect(titleFor(normalize("moos://nowhere"))).toBe("Page not found");
    expect(titleFor(normalize("https://github.com/x"))).toBe("github.com");
  });
});

describe("searchContent", () => {
  it("finds projects by stack and skills by name", () => {
    const r = searchContent("java");
    expect(r.projects.map((p) => p.slug)).toContain("trailer-delay-report");
    expect(r.skills.some((s) => s.skill === "Java")).toBe(true);
  });

  it("returns nothing for an empty query", () => {
    const r = searchContent("  ");
    expect(r.projects).toHaveLength(0);
    expect(r.skills).toHaveLength(0);
  });
});
