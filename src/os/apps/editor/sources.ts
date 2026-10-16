// Real source files from this portfolio, bundled as text with Vite's ?raw
// imports so the Code app always shows exactly what's running.

import wallpaperScript from "../../../../scripts/generate-wallpapers.mjs?raw";
import content from "../../../data/content.ts?raw";
import fs from "../../fs.ts?raw";
import search from "../../search.ts?raw";
import windowFrame from "../../shell/Window.tsx?raw";
import router from "../../state/router.ts?raw";
import windows from "../../state/windows.ts?raw";
import commands from "../terminal/commands.ts?raw";
import highlightSource from "./highlight.ts?raw";
import { languageOf, type Language } from "./highlight";

export type SourceFile = { path: string; note: string; code: string; language: Language };

const files: Omit<SourceFile, "language">[] = [
  {
    path: "src/os/state/windows.ts",
    note: "Pure reducer behind the window manager: focus, stacking, minimize, maximize, and snapping.",
    code: windows,
  },
  {
    path: "src/os/shell/Window.tsx",
    note: "Window frame with pointer-driven dragging, eight-way resizing, and edge snapping.",
    code: windowFrame,
  },
  {
    path: "src/os/state/router.ts",
    note: "Hash-based deep links that work on GitHub Pages and keep old #anchors alive.",
    code: router,
  },
  {
    path: "src/os/fs.ts",
    note: "Virtual filesystem shared by Files, Terminal, and Reader, generated from portfolio content.",
    code: fs,
  },
  {
    path: "src/os/search.ts",
    note: "Launcher index and ranking across apps, projects, skills, and actions.",
    code: search,
  },
  {
    path: "src/os/apps/terminal/commands.ts",
    note: "Pure command interpreter for the Terminal, with tab completion and typo suggestions.",
    code: commands,
  },
  {
    path: "src/os/apps/editor/highlight.ts",
    note: "The tokenizer coloring the code you're reading right now.",
    code: highlightSource,
  },
  {
    path: "src/data/content.ts",
    note: "Single source of truth for every portfolio fact in MoOS.",
    code: content,
  },
  {
    path: "scripts/generate-wallpapers.mjs",
    note: "Procedural generator for the layered misty-forest wallpapers.",
    code: wallpaperScript,
  },
];

export const sourceFiles: SourceFile[] = files.map((f) => ({
  ...f,
  code: f.code.replace(/\r\n/g, "\n"),
  language: languageOf(f.path),
}));

export function findSource(path: string) {
  return sourceFiles.find((f) => f.path === path);
}

export type TreeNode = { name: string; path: string; children: TreeNode[]; file?: SourceFile };

// Folder tree for the explorer, collapsing single-child folder chains ("src/os").
export function buildTree(list: SourceFile[] = sourceFiles): TreeNode {
  const root: TreeNode = { name: "", path: "", children: [] };
  for (const file of list) {
    const parts = file.path.split("/");
    let node = root;
    parts.forEach((part, i) => {
      const path = parts.slice(0, i + 1).join("/");
      let child = node.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, path, children: [] };
        node.children.push(child);
      }
      if (i === parts.length - 1) child.file = file;
      node = child;
    });
  }
  const collapse = (node: TreeNode): TreeNode => {
    let current = node;
    while (!current.file && current.children.length === 1 && !current.children[0].file && current.name) {
      const only = current.children[0];
      current = { ...only, name: `${current.name}/${only.name}` };
    }
    const children = current.children.map(collapse).sort((a, b) => {
      const af = Number(Boolean(a.file));
      const bf = Number(Boolean(b.file));
      return af - bf || a.name.localeCompare(b.name);
    });
    return { ...current, children };
  };
  return collapse(root);
}
