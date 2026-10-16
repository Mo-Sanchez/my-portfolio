// Pure address-bar logic for the MoOS Browser: turns whatever the user types
// into an internal page, an external URL, or an internal search.

import { allProjects, isFilled, profile, projectCategories, skills, type Project } from "../../../data/content";

export type Location =
  | { kind: "internal"; path: string }
  | { kind: "external"; url: string }
  | { kind: "search"; query: string };

export const HOME: Location = { kind: "internal", path: "home" };

const INTERNAL_PAGES = ["home", "projects", "about", "resume"];
const DOMAIN = /^(localhost|[a-z0-9-]+(\.[a-z0-9-]+)+)(:\d+)?([/?#].*)?$/i;

function cleanPath(path: string) {
  const p = path.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!p) return "home";
  return p;
}

function external(url: string): Location | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return { kind: "external", url: parsed.href };
  } catch {
    return null;
  }
}

export function normalize(input: string): Location {
  const text = input.trim();
  if (!text) return HOME;

  const scheme = /^moos:(\/\/)?(.*)$/i.exec(text);
  if (scheme) return { kind: "internal", path: cleanPath(scheme[2]) };

  if (/^https?:\/\//i.test(text)) {
    const ext = external(text);
    if (ext) return ext;
    return { kind: "search", query: text };
  }

  if (!/\s/.test(text)) {
    const lower = cleanPath(text);
    if (INTERNAL_PAGES.includes(lower) || lower.startsWith("projects/")) return { kind: "internal", path: lower };
    if (DOMAIN.test(text)) {
      const ext = external(`https://${text}`);
      if (ext) return ext;
    }
  }

  return { kind: "search", query: text };
}

// An exact project-name search jumps straight to the project page.
export function resolve(location: Location): Location {
  if (location.kind !== "search") return location;
  const q = location.query.trim().toLowerCase();
  const project = allProjects.find((p) => p.name.toLowerCase() === q || p.slug === q);
  if (project) return { kind: "internal", path: `projects/${project.slug}` };
  return location;
}

export function displayUrl(location: Location) {
  if (location.kind === "internal") return `moos://${location.path}`;
  if (location.kind === "external") return location.url;
  return `moos://search?q=${encodeURIComponent(location.query)}`;
}

// The window route mirrors internal pages ("projects/phantom-sky"); external
// pages don't change the route, so null means "leave it as is".
export function toRoute(location: Location): string | null {
  if (location.kind === "internal") {
    if (location.path === "home") return "";
    return location.path;
  }
  if (location.kind === "search") return `search/${encodeURIComponent(location.query)}`;
  return null;
}

export function fromRoute(route: string): Location {
  const r = route.replace(/^\/+|\/+$/g, "");
  if (!r) return HOME;
  if (r.startsWith("search/")) {
    let query = r.slice("search/".length);
    try {
      query = decodeURIComponent(query);
    } catch {
      // keep raw
    }
    return { kind: "search", query };
  }
  return { kind: "internal", path: cleanPath(r) };
}

export function sameLocation(a: Location, b: Location) {
  return displayUrl(a) === displayUrl(b);
}

export function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function titleFor(location: Location) {
  if (location.kind === "external") return hostOf(location.url);
  if (location.kind === "search") return `Search: ${location.query}`;
  const path = location.path;
  if (path === "home") return "Start Page";
  if (path === "projects") return "Projects";
  if (path === "about") return `About ${profile.name}`;
  if (path === "resume") return "Résumé";
  if (path.startsWith("projects/")) {
    const project = allProjects.find((p) => `projects/${p.slug}` === path);
    if (project) return project.name;
  }
  return "Page not found";
}

export type SearchResults = {
  projects: Project[];
  skills: { skill: string; group: string }[];
  pages: { path: string; title: string }[];
};

// Simple substring search over internal content for the results page.
export function searchContent(query: string): SearchResults {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (text: string) => terms.length > 0 && terms.every((t) => text.toLowerCase().includes(t));
  const projects = allProjects.filter((p) => {
    const category = projectCategories.find((c) => c.id === p.category)?.label || "";
    let tagline = "";
    if (isFilled(p.tagline)) tagline = p.tagline;
    return matches([p.name, tagline, p.stack.join(" "), category, p.status || ""].join(" "));
  });
  const found: { skill: string; group: string }[] = [];
  for (const g of skills) {
    for (const item of g.items) {
      if (matches(`${item} ${g.group}`)) found.push({ skill: item, group: g.group });
    }
  }
  const pages = INTERNAL_PAGES.map((path) => ({ path, title: titleFor({ kind: "internal", path }) })).filter((p) =>
    matches(`${p.path} ${p.title}`),
  );
  return { projects, skills: found, pages };
}
