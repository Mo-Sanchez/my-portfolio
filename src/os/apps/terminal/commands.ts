// The Terminal's command interpreter. Pure: it takes input plus the current
// shell state and returns output lines, the next working directory, and
// side effects for the UI to apply. Nothing here touches the DOM, so every
// command is unit tested. It is a simulation: nothing is ever executed.

import { about, allProjects, profile, projectCategories } from "../../../data/content";
import {
  absolutePath,
  certificationsText,
  displayPath,
  educationText,
  experienceText,
  getNode,
  projectText,
  resolvePath,
  skillsText,
  aboutText,
  type FolderNode,
  type FsNode,
} from "../../fs";
import { appList, type AppId } from "../meta";

export const MOOS_VERSION = "1.0";

export type ListItem = { name: string; kind: "dir" | "file" | "app" };

export type Line =
  | { kind: "text" | "muted" | "error" | "accent" | "heading"; text: string }
  | { kind: "link"; label: string; href: string; text?: string }
  | { kind: "prompt"; cwd: string; input: string }
  | { kind: "columns"; items: ListItem[] }
  | { kind: "table"; rows: string[][] }
  | { kind: "neofetch"; art: string[]; info: [string, string][] }
  | { kind: "blank" };

export type Theme = "dark" | "light" | "system";

export type Effect =
  | { type: "open"; appId: AppId; route: string }
  | { type: "url"; url: string }
  | { type: "clear" }
  | { type: "theme"; theme: Theme }
  | { type: "close" }
  | { type: "download-resume" };

export type ShellState = { cwd: string[]; history: string[] };

// Facts about the host, injected so commands stay pure and testable.
export type Env = {
  now: Date;
  userAgent: string;
  width: number;
  height: number;
  theme: string;
  uptimeMs: number;
};

export type Result = { lines: Line[]; cwd: string[]; effects: Effect[] };

export function defaultEnv(): Env {
  const hasWindow = typeof window !== "undefined";
  let width = 0;
  let height = 0;
  if (hasWindow) {
    width = window.screen?.width || window.innerWidth;
    height = window.screen?.height || window.innerHeight;
  }
  let uptimeMs = 0;
  if (typeof performance !== "undefined") uptimeMs = performance.now();
  let userAgent = "";
  if (typeof navigator !== "undefined") userAgent = navigator.userAgent;
  return { now: new Date(), userAgent, width, height, theme: "dark", uptimeMs };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const text = (t: string): Line => ({ kind: "text", text: t });
const muted = (t: string): Line => ({ kind: "muted", text: t });
const error = (t: string): Line => ({ kind: "error", text: t });
const accent = (t: string): Line => ({ kind: "accent", text: t });
const heading = (t: string): Line => ({ kind: "heading", text: t });
const blank: Line = { kind: "blank" };

const lines = (block: string): Line[] => block.split("\n").map((l) => text(l));

// Split input into words, honoring "double", 'single' quotes and backslash escapes.
export function tokenize(input: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote = "";
  let has = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) quote = "";
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (ch === "\\" && i + 1 < input.length) {
      cur += input[++i];
      has = true;
    } else if (/\s/.test(ch)) {
      if (has) out.push(cur);
      cur = "";
      has = false;
    } else {
      cur += ch;
      has = true;
    }
  }
  if (has) out.push(cur);
  return out;
}

function distance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      let cost = 1;
      if (a[i - 1] === b[j - 1]) cost = 0;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function itemKind(node: FsNode): ListItem["kind"] {
  if (node.kind === "folder") return "dir";
  if (node.type === "app") return "app";
  return "file";
}

function listName(node: FsNode) {
  if (node.kind === "folder") return `${node.name}/`;
  return node.name;
}

function findProject(slug: string) {
  const clean = slug.toLowerCase().replace(/\.md$/, "");
  return allProjects.find((p) => p.slug === clean);
}

function findApp(name: string) {
  const n = name.toLowerCase().replace(/\.app$/, "");
  return appList.find((a) => !a.internal && (a.id === n || a.title.toLowerCase() === n));
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

type Ctx = { args: string[]; raw: string; state: ShellState; env: Env };
type Out = { lines: Line[]; cwd?: string[]; effects?: Effect[] };
type Command = { name: string; usage: string; description: string; hidden?: boolean; run: (ctx: Ctx) => Out };

const commands: Command[] = [
  {
    name: "help",
    usage: "help",
    description: "Show this list",
    run: () => {
      const rows = commands.filter((c) => !c.hidden).map((c) => [c.usage, c.description]);
      return {
        lines: [
          heading("MoOS shell commands"),
          { kind: "table", rows },
          blank,
          muted("Tip: Tab completes commands and paths, ↑/↓ browse history, Ctrl+L clears."),
        ],
      };
    },
  },
  {
    name: "whoami",
    usage: "whoami",
    description: "Who built this",
    run: () => ({
      lines: [accent(profile.name), text(profile.role), muted(profile.location)],
    }),
  },
  {
    name: "about",
    usage: "about",
    description: "Background and focus areas",
    run: () => ({ lines: lines(aboutText()) }),
  },
  {
    name: "projects",
    usage: "projects [slug]",
    description: "List projects, or show one in detail",
    run: ({ args }) => {
      if (args[0]) {
        const p = findProject(args[0]);
        if (!p) return { lines: [error(`projects: no project named '${args[0]}'. Run 'projects' to list them.`)] };
        return {
          lines: [...lines(projectText(p)), blank, muted(`Run 'open ${p.slug}' to open it in a window.`)],
        };
      }
      const out: Line[] = [];
      for (const c of projectCategories) {
        const list = allProjects.filter((p) => p.category === c.id);
        if (!list.length) continue;
        out.push(heading(c.label));
        out.push({ kind: "table", rows: list.map((p) => [p.slug, p.name, p.stack.join(", ")]) });
        out.push(blank);
      }
      out.push(muted("Run 'projects <slug>' for details or 'open <slug>' to open one."));
      return { lines: out };
    },
  },
  {
    name: "skills",
    usage: "skills",
    description: "Technical and professional skills",
    run: () => ({ lines: lines(skillsText()) }),
  },
  {
    name: "experience",
    usage: "experience",
    description: "Work history and measured impact",
    run: () => ({ lines: lines(experienceText()) }),
  },
  {
    name: "education",
    usage: "education",
    description: "Degrees and certifications",
    run: () => ({ lines: [...lines(educationText()), blank, heading("Certifications"), ...lines(certificationsText())] }),
  },
  {
    name: "contact",
    usage: "contact",
    description: "Email, LinkedIn, GitHub",
    run: () => ({
      lines: [
        { kind: "link", text: "Email     ", label: profile.email, href: `mailto:${profile.email}` },
        { kind: "link", text: "LinkedIn  ", label: profile.linkedin, href: profile.linkedin },
        { kind: "link", text: "GitHub    ", label: profile.github, href: profile.github },
        blank,
        muted("Run 'open contact' to write a message, or 'resume' for the PDF."),
      ],
    }),
  },
  {
    name: "resume",
    usage: "resume [download]",
    description: "Open the résumé (or download the PDF)",
    run: ({ args }) => {
      if (args[0] === "download" || args[0] === "--download") {
        return { lines: [muted("Downloading Moises_Sanchez_Resume.pdf…")], effects: [{ type: "download-resume" }] };
      }
      return { lines: [muted("Opening Résumé…")], effects: [{ type: "open", appId: "resume", route: "" }] };
    },
  },
  {
    name: "ls",
    usage: "ls [-l] [path]",
    description: "List a directory",
    run: ({ args, state }) => {
      const flags = args.filter((a) => a.startsWith("-")).join("");
      const target = args.find((a) => !a.startsWith("-")) || ".";
      const parts = resolvePath(state.cwd, target);
      const node = getNode(parts);
      if (!node) return { lines: [error(`ls: ${target}: No such file or directory`)] };
      if (node.kind === "file") return { lines: [{ kind: "columns", items: [{ name: node.name, kind: itemKind(node) }] }] };
      const children = [...node.children].sort((a, b) => listName(a).localeCompare(listName(b)));
      if (flags.includes("l")) {
        const rows: string[][] = [];
        if (flags.includes("a")) rows.push(["drwxr-xr-x", "./"], ["drwxr-xr-x", "../"]);
        for (const c of children) {
          let perms = "-r--r--r--";
          if (c.kind === "folder") perms = "drwxr-xr-x";
          else if (c.type === "app") perms = "-r-xr-xr-x";
          rows.push([perms, listName(c), c.label]);
        }
        if (!rows.length) return { lines: [muted("(empty)")] };
        return { lines: [{ kind: "table", rows }] };
      }
      const items: ListItem[] = children.map((c) => ({ name: listName(c), kind: itemKind(c) }));
      if (flags.includes("a")) items.unshift({ name: "./", kind: "dir" }, { name: "../", kind: "dir" });
      if (!items.length) return { lines: [muted("(empty)")] };
      return { lines: [{ kind: "columns", items }] };
    },
  },
  {
    name: "cd",
    usage: "cd [path]",
    description: "Change directory",
    run: ({ args, state }) => {
      const target = args[0] || "~";
      const parts = resolvePath(state.cwd, target);
      const node = getNode(parts);
      if (!node) return { lines: [error(`cd: no such file or directory: ${target}`)] };
      if (node.kind !== "folder") return { lines: [error(`cd: not a directory: ${target}`)] };
      return { lines: [], cwd: parts };
    },
  },
  {
    name: "cat",
    usage: "cat <file>",
    description: "Print a file",
    run: ({ args, state }) => {
      if (!args.length) return { lines: [error("cat: missing file operand. Try 'cat README.md'.")] };
      const out: Line[] = [];
      args.forEach((arg, i) => {
        if (i > 0) out.push(blank);
        const node = getNode(resolvePath(state.cwd, arg));
        if (!node) out.push(error(`cat: ${arg}: No such file or directory`));
        else if (node.kind === "folder") out.push(error(`cat: ${arg}: Is a directory`));
        else if (node.type === "pdf" || node.type === "app") out.push(muted(node.text()));
        else out.push(...lines(node.text()));
      });
      return { lines: out };
    },
  },
  {
    name: "open",
    usage: "open <file|app|slug>",
    description: "Open a file, folder, app, or project",
    run: ({ args, state }) => {
      const target = args.join(" ");
      if (!target) return { lines: [error("open: what should I open? Try 'open resume.pdf' or 'open terminal'.")] };
      const parts = resolvePath(state.cwd, target);
      const node = getNode(parts);
      if (node && node.kind === "folder") {
        return { lines: [muted(`Opening ${displayPath(parts)}…`)], effects: [{ type: "open", appId: "finder", route: parts.join("/") }] };
      }
      if (node && node.kind === "file") {
        if ("url" in node.open) return { lines: [muted(`Opening ${node.open.url}…`)], effects: [{ type: "url", url: node.open.url }] };
        return { lines: [muted(`Opening ${node.label}…`)], effects: [{ type: "open", appId: node.open.appId, route: node.open.route }] };
      }
      const project = findProject(target);
      if (project) {
        return { lines: [muted(`Opening ${project.name}…`)], effects: [{ type: "open", appId: "project", route: project.slug }] };
      }
      const app = findApp(target);
      if (app) return { lines: [muted(`Opening ${app.title}…`)], effects: [{ type: "open", appId: app.id, route: "" }] };
      return { lines: [error(`open: ${target}: No such file, folder, app, or project`)] };
    },
  },
  {
    name: "pwd",
    usage: "pwd",
    description: "Print working directory",
    run: ({ state }) => ({ lines: [text(absolutePath(state.cwd))] }),
  },
  {
    name: "date",
    usage: "date",
    description: "Current date and time",
    run: ({ env }) => ({ lines: [text(env.now.toString())] }),
  },
  {
    name: "neofetch",
    usage: "neofetch",
    description: "MoOS system information",
    run: ({ env }) => ({ lines: [neofetch(env)] }),
  },
  {
    name: "echo",
    usage: "echo <text>",
    description: "Print text",
    run: ({ args }) => ({ lines: [text(args.join(" "))] }),
  },
  {
    name: "history",
    usage: "history",
    description: "Commands you've run",
    run: ({ state }) => {
      if (!state.history.length) return { lines: [muted("No history yet.")] };
      return { lines: [{ kind: "table", rows: state.history.map((h, i) => [String(i + 1).padStart(4), h]) }] };
    },
  },
  {
    name: "theme",
    usage: "theme [dark|light|system]",
    description: "Switch the MoOS appearance",
    run: ({ args, env }) => {
      const value = args[0]?.toLowerCase();
      if (!value) return { lines: [text(`Current appearance: ${env.theme}`), muted("Usage: theme dark | light | system")] };
      if (value !== "dark" && value !== "light" && value !== "system") {
        return { lines: [error(`theme: unknown appearance '${args[0]}'. Use dark, light, or system.`)] };
      }
      return { lines: [muted(`Appearance set to ${value}.`)], effects: [{ type: "theme", theme: value }] };
    },
  },
  {
    name: "clear",
    usage: "clear",
    description: "Clear the screen",
    run: () => ({ lines: [], effects: [{ type: "clear" }] }),
  },
  {
    name: "exit",
    usage: "exit",
    description: "Close this window",
    run: () => ({ lines: [muted("logout")], effects: [{ type: "close" }] }),
  },

  // Easter eggs ---------------------------------------------------------------
  {
    name: "sudo",
    usage: "sudo",
    description: "",
    hidden: true,
    run: () => ({
      lines: [error("moises is not in the sudoers file. This incident will be reported to the hiring manager.")],
    }),
  },
  {
    name: "rm",
    usage: "rm",
    description: "",
    hidden: true,
    run: ({ args }) => {
      if (args.some((a) => a.startsWith("-") && a.includes("r")) && args.includes("/")) {
        return {
          lines: [
            error("rm: refusing to remove '/'."),
            muted("Pulling that much weight off one end would put this aircraft well outside its center-of-gravity limits."),
            muted("Load plan rejected. Nothing was deleted."),
          ],
        };
      }
      return { lines: [error("rm: read-only file system. Portfolio content is load-bearing.")] };
    },
  },
  {
    name: "hire",
    usage: "hire",
    description: "",
    hidden: true,
    run: () => ({
      lines: [
        accent(`Excellent choice. Here's how to reach ${profile.name}.`),
        { kind: "link", text: "Email     ", label: profile.email, href: `mailto:${profile.email}` },
        { kind: "link", text: "LinkedIn  ", label: profile.linkedin, href: profile.linkedin },
        muted("Run 'resume' to see the résumé."),
      ],
    }),
  },
  {
    name: "coffee",
    usage: "coffee",
    description: "",
    hidden: true,
    run: () => ({
      lines: [...["    ( (", "     ) )", "  ........", "  |      |]", "  \\      /", "   `----'"].map(text), muted("Brewing… ready. Back to building.")],
    }),
  },
  {
    name: "weather",
    usage: "weather",
    description: "",
    hidden: true,
    run: () => ({
      lines: [text("Misty Forest: 54°F, dense fog, visibility 200 ft."), muted("Same as yesterday. The pines don't mind.")],
    }),
  },
];

const aliases: Record<string, string> = { dir: "ls", cls: "clear", "?": "help", man: "help", logout: "exit", ll: "ls" };

const visibleNames = commands.filter((c) => !c.hidden).map((c) => c.name);

function browserName(ua: string) {
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\//.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  if (/Node/.test(ua)) return "Node.js";
  return "Unknown browser";
}

function formatUptime(ms: number) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

const ART = [
  "        /\\          ",
  "       /  \\   /\\    ",
  "      /    \\ /  \\   ",
  "     /  /\\  \\    \\  ",
  "    /  /  \\  \\    \\ ",
  "   /__/____\\__\\____\\",
  "  ~~~ ~~ ~~~ ~~ ~~~ ",
];

function neofetch(env: Env): Line {
  let resolution = "unknown";
  if (env.width && env.height) resolution = `${env.width}×${env.height}`;
  const degree = about.education[0];
  const info: [string, string][] = [
    ["", `moises@moos`],
    ["", "-----------"],
    ["OS", `MoOS ${MOOS_VERSION} (React + TypeScript)`],
    ["Host", browserName(env.userAgent)],
    ["Uptime", formatUptime(env.uptimeMs)],
    ["Shell", "mosh (MoOS shell)"],
    ["Resolution", resolution],
    ["Theme", `Misty Forest (${env.theme})`],
    ["User", profile.name],
    ["Role", profile.role],
    ["Location", profile.location],
  ];
  if (degree) info.push(["Education", `${degree.credential}, ${degree.school}`]);
  return { kind: "neofetch", art: ART, info };
}

function suggest(name: string) {
  let best = "";
  let bestScore = 3;
  for (const n of [...visibleNames, ...Object.keys(aliases)]) {
    const d = distance(name.toLowerCase(), n);
    if (d < bestScore) {
      bestScore = d;
      best = n;
    }
  }
  return best;
}

export function runCommand(input: string, state: ShellState, env: Env = defaultEnv()): Result {
  const raw = input.trim();
  if (!raw) return { lines: [], cwd: state.cwd, effects: [] };
  const words = tokenize(raw);
  if (!words.length) return { lines: [], cwd: state.cwd, effects: [] };
  let name = words[0].toLowerCase();
  if (aliases[name]) name = aliases[name];
  const command = commands.find((c) => c.name === name);
  if (!command) {
    const out: Line[] = [error(`command not found: ${words[0]}. Type 'help' for a list of commands.`)];
    const hint = suggest(words[0]);
    if (hint) out.push(muted(`Did you mean '${hint}'?`));
    return { lines: out, cwd: state.cwd, effects: [] };
  }
  const result = command.run({ args: words.slice(1), raw, state, env });
  return { lines: result.lines, cwd: result.cwd || state.cwd, effects: result.effects || [] };
}

// ---------------------------------------------------------------------------
// Tab completion
// ---------------------------------------------------------------------------

const pathCommands = new Set(["ls", "cd", "cat", "open", "dir", "ll"]);

function commonPrefix(values: string[]) {
  if (!values.length) return "";
  let prefix = values[0];
  for (const v of values) {
    while (!v.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function complete(input: string, cwd: string[]): { completed: string; options: string[] } {
  const none = { completed: input, options: [] as string[] };
  const firstSpace = input.search(/\s/);

  // Completing the command name itself.
  if (firstSpace === -1) {
    const matches = visibleNames.filter((n) => n.startsWith(input.toLowerCase()));
    if (matches.length === 1) return { completed: `${matches[0]} `, options: [] };
    if (matches.length > 1) return { completed: commonPrefix(matches), options: matches };
    return none;
  }

  const cmd = input.slice(0, firstSpace).toLowerCase();
  const lastSpace = Math.max(input.lastIndexOf(" "), input.lastIndexOf("\t"));
  const head = input.slice(0, lastSpace + 1);
  const word = input.slice(lastSpace + 1);

  let candidates: string[] = [];
  let folderOnly = false;
  if (cmd === "theme") candidates = ["dark", "light", "system"];
  else if (cmd === "projects") candidates = allProjects.map((p) => p.slug);
  else if (cmd === "resume") candidates = ["download"];
  else if (pathCommands.has(cmd)) {
    folderOnly = cmd === "cd";
    const slash = word.lastIndexOf("/");
    const dirPart = word.slice(0, slash + 1);
    const base = word.slice(slash + 1);
    const folder = getNode(resolvePath(cwd, dirPart || "."));
    if (!folder || folder.kind !== "folder") return none;
    const names = (folder as FolderNode).children
      .filter((c) => !folderOnly || c.kind === "folder")
      .map((c) => listName(c))
      .filter((n) => n.startsWith(base));
    if (cmd === "open" && !dirPart) {
      for (const p of allProjects) if (p.slug.startsWith(base)) names.push(p.slug);
      for (const a of appList) if (!a.internal && a.id.startsWith(base) && !names.includes(a.id)) names.push(a.id);
    }
    if (names.length === 1) {
      let suffix = " ";
      if (names[0].endsWith("/")) suffix = "";
      return { completed: head + dirPart + names[0] + suffix, options: [] };
    }
    if (names.length > 1) return { completed: head + dirPart + commonPrefix(names), options: names };
    return none;
  }

  const matches = candidates.filter((c) => c.startsWith(word.toLowerCase()));
  if (matches.length === 1) return { completed: `${head}${matches[0]} `, options: [] };
  if (matches.length > 1) return { completed: head + commonPrefix(matches), options: matches };
  return none;
}
