// The MoOS virtual filesystem. Files, the Terminal, and the Reader all read
// from this one tree, and every file is generated from src/data/content.ts so
// there is a single source of truth for portfolio facts.

import {
  about,
  allProjects,
  experience,
  isFilled,
  metrics,
  profile,
  projectCategories,
  skills,
  type Project,
} from "../data/content";
import { appList, type AppId } from "./apps/meta";
import { shortcutsText } from "./shortcuts";

export type OpenTarget = { appId: AppId; route: string } | { url: string };

type NodeBase = { name: string; label: string };
export type FolderNode = NodeBase & { kind: "folder"; description?: string; children: FsNode[] };
export type FileKind = "text" | "project" | "app" | "pdf" | "link";
export type FileNode = NodeBase & {
  kind: "file";
  type: FileKind;
  // App to use for a file icon (apps and project files).
  iconApp?: AppId;
  slug?: string;
  open: OpenTarget;
  text: () => string;
  size?: number;
};
export type FsNode = FolderNode | FileNode;

export const HOME = "/home/moises";

function textFile(name: string, label: string, path: string, text: () => string): FileNode {
  return { kind: "file", type: "text", name, label, open: { appId: "reader", route: path }, text };
}

function appFile(name: string, label: string, appId: AppId, route = ""): FileNode {
  const meta = appList.find((a) => a.id === appId);
  return {
    kind: "file",
    type: "app",
    name,
    label,
    iconApp: appId,
    open: { appId, route },
    text: () => `${label}: ${meta?.description || "application"}.\nOpen it with: open ${name}`,
  };
}

function resumeFile(): FileNode {
  return {
    kind: "file",
    type: "pdf",
    name: "resume.pdf",
    label: "Résumé.pdf",
    open: { appId: "resume", route: "" },
    text: () => "resume.pdf is a PDF document. Run `resume` or `open resume.pdf` to view it.",
  };
}

const categoryLabel = (id: string) => projectCategories.find((c) => c.id === id)?.label || id;

export function projectText(p: Project) {
  const lines = [`# ${p.name}`, ""];
  if (isFilled(p.tagline)) lines.push(p.tagline, "");
  if (p.status) lines.push(`Status:     ${p.status}`);
  lines.push(`Category:   ${categoryLabel(p.category)}`);
  lines.push(`Stack:      ${p.stack.join(", ")}`);
  if (isFilled(p.problem)) lines.push("", "## Problem", p.problem);
  if (isFilled(p.challenge)) lines.push("", "## Key challenge", p.challenge);
  const links: string[] = [];
  if (p.github) links.push(`Source:     ${p.github}`);
  if (p.demo) links.push(`Live demo:  ${p.demo}`);
  if (p.note) links.push(`Note:       ${p.note}`);
  if (links.length) lines.push("", ...links);
  return lines.join("\n");
}

export function aboutText() {
  return [
    `${profile.name}`,
    `${profile.role}`,
    `${profile.location}`,
    "",
    profile.headline,
    "",
    ...about.paragraphs.flatMap((p) => [p, ""]),
    "Focus",
    ...about.focus.map((f) => `  • ${f.title}: ${f.text}`),
    "",
    `Status: ${profile.status}`,
  ].join("\n");
}

export function educationText() {
  return about.education.map((e) => `${e.credential}\n  ${e.school} · ${e.date}`).join("\n\n");
}

export function certificationsText() {
  return about.certifications.map((c) => `${c.name} (${c.date})`).join("\n");
}

export function skillsText() {
  return skills.map((g) => `${g.group}\n  ${g.items.join(" · ")}`).join("\n\n");
}

export function contactText() {
  return [
    `Email     ${profile.email}`,
    `LinkedIn  ${profile.linkedin}`,
    `GitHub    ${profile.github}`,
    "",
    "Run `open contact` to write a message, or `resume` for the PDF.",
  ].join("\n");
}

export function experienceText() {
  const out: string[] = [];
  for (const role of experience) {
    out.push(`${role.title} · ${role.company}`, `${role.period} · ${role.location}`, "", role.summary, "");
    for (const c of role.cases) {
      out.push(`## ${c.title}  [${c.metric}]`, `Problem: ${c.problem}`, `Action:  ${c.action}`, `Result:  ${c.result}`, "");
    }
  }
  out.push("Impact at a glance", ...metrics.map((m) => `  ${m.value.padEnd(7)} ${m.label} (${m.detail})`));
  return out.join("\n");
}

function readmeText() {
  return [
    "# Welcome to MoOS",
    "",
    `MoOS is ${profile.name}'s portfolio, built as a small desktop operating system`,
    "in React and TypeScript. Everything here is real portfolio content.",
    "",
    "Quick start",
    "  • Projects live in ~/projects. Open any project file for details.",
    "  • The résumé is in ~/documents/resume.pdf.",
    "  • Press Ctrl+K (⌘K on Mac) to search apps, projects, and skills.",
    "  • In Terminal, type `help` to see every command.",
    "",
    "Prefer a simple page? Add ?view=classic to the address.",
  ].join("\n");
}

function projectFile(p: Project): FileNode {
  return {
    kind: "file",
    type: "project",
    name: `${p.slug}.md`,
    label: p.name,
    slug: p.slug,
    iconApp: "project",
    open: { appId: "project", route: p.slug },
    text: () => projectText(p),
  };
}

function buildTree(): FolderNode {
  const projectFolders: FolderNode[] = projectCategories.map((c) => ({
    kind: "folder",
    name: c.id,
    label: c.label,
    description: c.description,
    children: allProjects.filter((p) => p.category === c.id).map(projectFile),
  }));

  return {
    kind: "folder",
    name: "",
    label: "Home",
    children: [
      {
        kind: "folder",
        name: "desktop",
        label: "Desktop",
        children: [
          appFile("about-me.app", "About Me", "about"),
          appFile("projects.app", "Projects", "finder", "projects"),
          appFile("experience.app", "Experience", "experience"),
          resumeFile(),
          appFile("contact.app", "Contact", "contact"),
        ],
      },
      {
        kind: "folder",
        name: "projects",
        label: "Projects",
        description: "Everything I've built, grouped by kind.",
        children: projectFolders,
      },
      {
        kind: "folder",
        name: "documents",
        label: "Documents",
        children: [
          resumeFile(),
          appFile("experience.app", "Experience", "experience"),
          textFile("education.txt", "Education.txt", "documents/education.txt", educationText),
          textFile("certifications.txt", "Certifications.txt", "documents/certifications.txt", certificationsText),
          textFile("skills.txt", "Skills.txt", "documents/skills.txt", skillsText),
          textFile("keyboard-shortcuts.txt", "Keyboard Shortcuts.txt", "documents/keyboard-shortcuts.txt", shortcutsText),
        ],
      },
      {
        kind: "folder",
        name: "applications",
        label: "Applications",
        children: appList.filter((a) => !a.internal).map((a) => appFile(`${a.id}.app`, a.title, a.id)),
      },
      textFile("about.txt", "About.txt", "about.txt", aboutText),
      textFile("contact.txt", "Contact.txt", "contact.txt", contactText),
      textFile("README.md", "README.md", "README.md", readmeText),
    ],
  };
}

export const root: FolderNode = buildTree();

export function splitPath(path: string) {
  return path.split("/").filter(Boolean);
}

export function getNode(parts: string[]): FsNode | null {
  let node: FsNode = root;
  for (const part of parts) {
    if (node.kind !== "folder") return null;
    const next: FsNode | undefined = node.children.find((c) => c.name === part);
    if (!next) return null;
    node = next;
  }
  return node;
}

// Resolve a shell-style path against the current directory. The filesystem is
// rooted at the home directory: "/", "~" and the absolute home path all map there.
export function resolvePath(cwd: string[], input: string): string[] {
  let parts: string[] = [...cwd];
  let rest = input.trim();
  if (rest === "" || rest === "~") return [];
  if (rest.startsWith(HOME)) {
    parts = [];
    rest = rest.slice(HOME.length);
  } else if (rest.startsWith("~/") || rest.startsWith("/")) {
    parts = [];
  }
  for (const seg of rest.replace(/^~/, "").split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return parts;
}

export function displayPath(parts: string[]) {
  if (parts.length === 0) return "~";
  return "~/" + parts.join("/");
}

export function absolutePath(parts: string[]) {
  if (parts.length === 0) return HOME;
  return `${HOME}/${parts.join("/")}`;
}

export function labelPath(parts: string[]) {
  const labels: string[] = [];
  let node: FsNode = root;
  for (const part of parts) {
    if (node.kind !== "folder") break;
    const next: FsNode | undefined = node.children.find((c) => c.name === part);
    if (!next) break;
    labels.push(next.label);
    node = next;
  }
  return labels;
}

// Depth-first list of every file, used by search.
export function allFiles(): { path: string[]; node: FileNode }[] {
  const out: { path: string[]; node: FileNode }[] = [];
  const walk = (folder: FolderNode, path: string[]) => {
    for (const child of folder.children) {
      const childPath = [...path, child.name];
      if (child.kind === "folder") walk(child, childPath);
      else out.push({ path: childPath, node: child });
    }
  };
  walk(root, []);
  return out;
}
