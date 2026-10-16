import { describe, expect, it } from "vitest";
import { complete, runCommand, tokenize, type Env, type Line } from "./commands";

const env: Env = { now: new Date("2026-10-15T12:00:00Z"), userAgent: "Mozilla/5.0 Chrome/140", width: 1440, height: 900, theme: "dark", uptimeMs: 65_000 };
const run = (input: string, cwd: string[] = [], history: string[] = []) => runCommand(input, { cwd, history }, env);

// Flatten any line into searchable text.
function textOf(lines: Line[]) {
  return lines
    .map((l) => {
      if (l.kind === "columns") return l.items.map((i) => i.name).join(" ");
      if (l.kind === "table") return l.rows.map((r) => r.join(" ")).join("\n");
      if (l.kind === "neofetch") return l.info.map((i) => i.join(" ")).join("\n");
      if (l.kind === "link") return `${l.text || ""}${l.label}`;
      if (l.kind === "prompt" || l.kind === "blank") return "";
      return l.text;
    })
    .join("\n");
}

describe("terminal commands", () => {
  it("help lists the public commands", () => {
    const out = textOf(run("help").lines);
    for (const cmd of ["whoami", "projects", "ls", "cd", "cat", "neofetch", "theme", "exit"]) expect(out).toContain(cmd);
    expect(out).not.toContain("sudo");
  });

  it("ls at home shows top-level folders and files", () => {
    const out = textOf(run("ls").lines);
    expect(out).toContain("projects/");
    expect(out).toContain("documents/");
    expect(out).toContain("README.md");
  });

  it("ls of projects lists category folders, and -l shows a long listing", () => {
    expect(textOf(run("ls projects").lines)).toContain("operations-tools/");
    expect(textOf(run("ls", ["projects"]).lines)).toContain("apps-games/");
    expect(textOf(run("ls -l", ["projects"]).lines)).not.toContain("README.md");
    const long = run("ls -l projects").lines[0];
    expect(long.kind).toBe("table");
    expect(textOf([long])).toContain("drwxr-xr-x");
  });

  it("cd moves into folders and supports .., ~ and absolute paths", () => {
    expect(run("cd projects").cwd).toEqual(["projects"]);
    expect(run("cd projects/apps-games").cwd).toEqual(["projects", "apps-games"]);
    expect(run("cd ..", ["projects", "apps-games"]).cwd).toEqual(["projects"]);
    expect(run("cd ~", ["projects"]).cwd).toEqual([]);
    expect(run("cd /home/moises/documents").cwd).toEqual(["documents"]);
    expect(run('cd "projects"').cwd).toEqual(["projects"]);
  });

  it("cd .. at home stays at home", () => {
    const r = run("cd ..");
    expect(r.cwd).toEqual([]);
    expect(r.lines).toHaveLength(0);
  });

  it("cd into a file or missing path errors and keeps cwd", () => {
    const file = run("cd README.md");
    expect(file.lines[0].kind).toBe("error");
    expect(textOf(file.lines)).toContain("not a directory");
    const missing = run("cd nowhere", ["projects"]);
    expect(missing.cwd).toEqual(["projects"]);
    expect(textOf(missing.lines)).toContain("no such file or directory");
  });

  it("cat prints a project file", () => {
    const out = textOf(run("cat projects/apps-games/phantom-sky.md").lines);
    expect(out).toContain("Phantom Sky");
    expect(out).toContain("Unity");
  });

  it("cat errors for missing files and folders", () => {
    expect(textOf(run("cat nope.txt").lines)).toContain("No such file or directory");
    expect(textOf(run("cat projects").lines)).toContain("Is a directory");
  });

  it("never prints placeholder copy", () => {
    expect(textOf(run("projects mymedia").lines)).not.toContain("[Placeholder");
    expect(textOf(run("experience").lines)).not.toContain("[Placeholder");
  });

  it("suggests a close command for typos", () => {
    const out = textOf(run("projcts").lines);
    expect(out).toContain("command not found: projcts");
    expect(out).toContain("Did you mean 'projects'?");
  });

  it("open produces open effects for files, apps, and project slugs", () => {
    expect(run("open resume.pdf", ["documents"]).effects).toEqual([{ type: "open", appId: "resume", route: "" }]);
    expect(run("open terminal").effects).toEqual([{ type: "open", appId: "terminal", route: "" }]);
    expect(run("open phantom-sky").effects).toEqual([{ type: "open", appId: "project", route: "phantom-sky" }]);
    expect(run("open projects").effects).toEqual([{ type: "open", appId: "finder", route: "projects" }]);
    expect(run("open nothing-here").lines[0].kind).toBe("error");
  });

  it("clear and exit produce effects", () => {
    expect(run("clear").effects).toEqual([{ type: "clear" }]);
    expect(run("exit").effects).toEqual([{ type: "close" }]);
  });

  it("theme validates its argument", () => {
    expect(run("theme light").effects).toEqual([{ type: "theme", theme: "light" }]);
    expect(run("theme purple").lines[0].kind).toBe("error");
    expect(run("theme purple").effects).toEqual([]);
    expect(textOf(run("theme").lines)).toContain("dark");
  });

  it("history lists previous commands", () => {
    const out = textOf(run("history", [], ["ls", "cd projects", "history"]).lines);
    expect(out).toContain("cd projects");
    expect(out).toMatch(/3\s+history/);
  });

  it("pwd and neofetch use the virtual home and real profile", () => {
    expect(textOf(run("pwd", ["projects"]).lines)).toBe("/home/moises/projects");
    const neo = textOf(run("neofetch").lines);
    expect(neo).toContain("Moises Sanchez");
    expect(neo).toContain("1440×900");
    expect(neo).toContain("1m 5s");
  });

  it("tokenize honors quotes and escapes", () => {
    expect(tokenize(`cat "a b" c\\ d 'e'`)).toEqual(["cat", "a b", "c d", "e"]);
  });
});

describe("tab completion", () => {
  it("completes unique commands and lists ambiguous ones", () => {
    expect(complete("neo", []).completed).toBe("neofetch ");
    const r = complete("c", []);
    expect(r.options).toEqual(expect.arrayContaining(["cd", "cat", "clear", "contact"]));
  });

  it("completes paths, folders only for cd", () => {
    expect(complete("cd pro", []).completed).toBe("cd projects/");
    expect(complete("cat projects/apps-games/phan", []).completed).toBe("cat projects/apps-games/phantom-sky.md ");
    expect(complete("cd READ", []).options).toEqual([]);
    expect(complete("cat READ", []).completed).toBe("cat README.md ");
  });

  it("completes command arguments", () => {
    expect(complete("theme li", []).completed).toBe("theme light ");
    expect(complete("projects phan", []).completed).toBe("projects phantom-sky ");
  });
});
