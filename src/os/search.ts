// Search index for the launcher. Pure data so it's easy to test: each result
// carries an OSAction describing what selecting it should do.

import { about, allProjects, experience, isFilled, profile, projectCategories, skills } from "../data/content";
import { appList } from "./apps/meta";
import { allFiles } from "./fs";
import type { OSAction } from "./state/os";
import type { IconKind } from "./ui/AppIcon";

export type SearchKind = "App" | "Project" | "Section" | "Skill" | "Experience" | "Document" | "Action";

export type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: SearchKind;
  icon: IconKind;
  keywords: string;
  action: OSAction;
};

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const app of appList) {
    if (app.internal) continue;
    items.push({
      id: `app:${app.id}`,
      title: app.title,
      subtitle: app.description,
      kind: "App",
      icon: app.id,
      keywords: app.keywords,
      action: { type: "open", appId: app.id },
    });
  }

  for (const p of allProjects) {
    let subtitle = p.stack.join(" · ");
    if (isFilled(p.tagline)) subtitle = p.tagline;
    const category = projectCategories.find((c) => c.id === p.category)?.label || "";
    items.push({
      id: `project:${p.slug}`,
      title: p.name,
      subtitle,
      kind: "Project",
      icon: "project",
      keywords: [p.stack.join(" "), category, p.status || "", "project"].join(" "),
      action: { type: "open", appId: "project", route: p.slug },
    });
  }

  for (const c of projectCategories) {
    items.push({
      id: `folder:${c.id}`,
      title: c.label,
      subtitle: `Projects folder · ${c.description}`,
      kind: "Section",
      icon: "folder",
      keywords: "projects folder category",
      action: { type: "open", appId: "finder", route: `projects/${c.id}` },
    });
  }

  const sections: [string, string, OSAction, string][] = [
    ["All Projects", "Browse every project in Files", { type: "open", appId: "finder", route: "projects" }, "work portfolio built"],
    ["Skills", "Languages, frameworks, and tools", { type: "open", appId: "about", route: "skills" }, "tech stack toolkit"],
    ["Education", about.education.map((e) => e.credential).join(" · "), { type: "open", appId: "about", route: "education" }, "school university degree college uf"],
    ["Certifications", about.certifications.map((c) => c.name).join(" · "), { type: "open", appId: "about", route: "education" }, "aws cloud certified"],
    ["Impact Metrics", "Measured results from operations work", { type: "open", appId: "experience" }, "results savings numbers achievements"],
  ];
  for (const [title, subtitle, action, keywords] of sections) {
    items.push({ id: `section:${slugify(title)}`, title, subtitle, kind: "Section", icon: "folder", keywords, action });
  }

  for (const role of experience) {
    items.push({
      id: `role:${slugify(role.company + role.title)}`,
      title: `${role.title} · ${role.company}`,
      subtitle: `${role.period} · ${role.location}`,
      kind: "Experience",
      icon: "experience",
      keywords: role.scope.filter(isFilled).join(" ") + " job work career",
      action: { type: "open", appId: "experience" },
    });
    for (const c of role.cases) {
      items.push({
        id: `case:${slugify(c.title)}`,
        title: c.title,
        subtitle: `${c.metric} · ${role.company}`,
        kind: "Experience",
        icon: "experience",
        keywords: `${c.problem} ${c.result} case study`,
        action: { type: "open", appId: "experience", route: slugify(c.title) },
      });
    }
  }

  for (const group of skills) {
    for (const skill of group.items) {
      items.push({
        id: `skill:${slugify(skill)}`,
        title: skill,
        subtitle: `Skill · ${group.group}`,
        kind: "Skill",
        icon: "about",
        keywords: group.group,
        action: { type: "open", appId: "about", route: "skills" },
      });
    }
  }

  for (const { node } of allFiles()) {
    if (node.type !== "text" || !("appId" in node.open)) continue;
    items.push({
      id: `doc:${node.name}`,
      title: node.label,
      subtitle: "Document",
      kind: "Document",
      icon: "reader",
      keywords: "file document text",
      action: { type: "open", appId: node.open.appId, route: node.open.route },
    });
  }

  const actions: [string, string, OSAction, IconKind, string][] = [
    ["Download Résumé", "Moises_Sanchez_Resume.pdf", { type: "downloadResume" }, "resume", "resume cv pdf download"],
    ["Copy Email Address", profile.email, { type: "copyEmail" }, "contact", "email mail contact copy"],
    ["Email Moises", `Write to ${profile.email}`, { type: "open", appId: "contact" }, "contact", "email mail contact hire message"],
    ["LinkedIn Profile", "Opens in a new tab", { type: "url", url: profile.linkedin }, "contact", "linkedin social network"],
    ["GitHub Profile", "Opens in a new tab", { type: "url", url: profile.github }, "contact", "github code repositories source"],
    ["Use Dark Appearance", "Theme", { type: "theme", theme: "dark" }, "settings", "theme dark mode appearance night"],
    ["Use Light Appearance", "Theme", { type: "theme", theme: "light" }, "settings", "theme light mode appearance day"],
    ["Change Wallpaper", "Settings › Wallpaper", { type: "open", appId: "settings", route: "wallpaper" }, "settings", "wallpaper background desktop"],
  ];
  for (const [title, subtitle, action, icon, keywords] of actions) {
    items.push({ id: `action:${slugify(title)}`, title, subtitle, kind: "Action", icon, keywords, action });
  }

  return items;
}

const SUGGESTED = ["app:finder", "app:experience", "app:resume", "app:about", "app:contact", "app:terminal"];

function score(item: SearchItem, tokens: string[]) {
  const title = item.title.toLowerCase();
  const rest = `${item.subtitle} ${item.keywords} ${item.kind}`.toLowerCase();
  let total = 0;
  for (const t of tokens) {
    if (title === t) total += 120;
    else if (title.startsWith(t)) total += 80;
    else if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title)) total += 55;
    else if (title.includes(t)) total += 35;
    else if (rest.includes(t)) total += 12;
    else return 0;
  }
  // Prefer apps and projects over long-tail matches when scores tie.
  if (item.kind === "App" || item.kind === "Project") total += 6;
  return total;
}

export function search(index: SearchItem[], query: string, limit = 14): SearchItem[] {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    const suggested = SUGGESTED.map((id) => index.find((i) => i.id === id)).filter((i): i is SearchItem => Boolean(i));
    const projects = index.filter((i) => i.kind === "Project").slice(0, 4);
    return [...suggested, ...projects];
  }
  return index
    .map((item) => ({ item, s: score(item, tokens) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((r) => r.item);
}
