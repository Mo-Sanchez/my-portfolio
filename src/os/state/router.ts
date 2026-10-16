// Deep links use the URL hash so they work on GitHub Pages without server
// rewrites: #/finder/projects, #/project/phantom-sky, #/resume.
//
// Anchors from the previous single-page portfolio (#projects, #contact, ...)
// still resolve, so existing shared links keep working.

export type Target = { appId: string; route: string };

// The Home window lives at the bare URL, so landing on the site doesn't add a
// history entry and Back from any window returns to it.
export const HOME: Target = { appId: "home", route: "" };

const legacy: Record<string, Target> = {
  home: HOME,
  about: { appId: "about", route: "" },
  experience: { appId: "experience", route: "" },
  projects: { appId: "finder", route: "projects" },
  skills: { appId: "about", route: "skills" },
  contact: { appId: "contact", route: "" },
  resume: { appId: "resume", route: "" },
};

export function parseHash(hash: string): Target | null {
  let raw = hash.replace(/^#/, "");
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Malformed escapes: use the raw string.
  }
  if (!raw || raw === "/") return null;

  if (!raw.startsWith("/")) return legacy[raw.toLowerCase()] || null;

  const parts = raw.slice(1).split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const appId = parts[0].toLowerCase();
  if (!/^[a-z][a-z0-9-]*$/.test(appId)) return null;
  return { appId, route: parts.slice(1).join("/") };
}

// Like parseHash, but a URL with no hash at all means Home.
export function targetOfHash(hash: string): Target | null {
  if (hash === "" || hash === "#") return HOME;
  return parseHash(hash);
}

// "" means the bare URL (Home); "#/" is the empty desktop.
export function formatHash(target: Target | null) {
  if (!target) return "#/";
  if (sameTarget(target, HOME)) return "";
  const route = target.route
    .split("/")
    .filter(Boolean)
    .map((p) => encodeURIComponent(p))
    .join("/");
  if (route) return `#/${target.appId}/${route}`;
  return `#/${target.appId}`;
}

export function sameTarget(a: Target | null, b: Target | null) {
  if (a === null || b === null) return a === b;
  return a.appId === b.appId && a.route === b.route;
}

// A URL for history.pushState/replaceState: an empty hash drops the hash entirely.
export function hrefOf(hash: string) {
  if (hash) return hash;
  return window.location.pathname + window.location.search;
}
