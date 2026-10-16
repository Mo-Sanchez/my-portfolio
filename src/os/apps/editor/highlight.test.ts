import { describe, expect, it } from "vitest";
import { highlight, languageOf, type Language, type Token } from "./highlight";

const join = (lines: Token[][]) => lines.map((l) => l.map((t) => t.text).join("")).join("\n");
const find = (lines: Token[][], text: string) => lines.flat().find((t) => t.text === text);

const samples: [Language, string][] = [
  ["ts", 'import { a } from "b";\nconst x: number = 0x1f + 2.5e3; // note\nexport function f(y) {\n  return `t ${y}`;\n}'],
  ["ts", "/* block\n   still comment */ const done = true;\nlet s = `multi\nline ${1 + 2}\nend`;"],
  ["tsx", 'export default function App() {\n  return <div className="x">{a < b && <Item key={1} />}</div>;\n}'],
  ["css", ":root {\n  --accent: #86c2a2; /* tone */\n}\n@media (max-width: 620px) {\n  .page h1:hover { padding: 22px 18px; }\n}"],
  ["js", "const re = a / b; const s = 'it\\'s'; // ok\n\n\tweird ¿ chars ✓"],
];

describe("highlight", () => {
  it("preserves the source text exactly", () => {
    for (const [lang, code] of samples) expect(join(highlight(code, lang))).toBe(code);
  });

  it("carries block comments and template strings across lines", () => {
    const [, code] = samples[1];
    const lines = highlight(code, "ts");
    expect(lines[1][0]).toEqual({ text: "   still comment */", type: "comment" });
    expect(lines[3].every((t) => t.type === "string")).toBe(true);
    // Code resumes after the comment closes.
    expect(find(lines, "const")?.type).toBe("keyword");
    expect(lines[1].find((t) => t.text.includes("done"))?.type).toBe("plain");
  });

  it("classifies common TypeScript tokens", () => {
    const lines = highlight(samples[0][1], "ts");
    expect(find(lines, "import")?.type).toBe("keyword");
    expect(find(lines, '"b"')?.type).toBe("string");
    expect(find(lines, "0x1f")?.type).toBe("number");
    expect(find(lines, "f")?.type).toBe("function");
    expect(find(lines, "// note")?.type).toBe("comment");
  });

  it("recognizes JSX tags but not less-than comparisons", () => {
    const lines = highlight(samples[2][1], "tsx");
    expect(find(lines, "div")?.type).toBe("tag");
    expect(find(lines, "Item")?.type).toBe("tag");
    expect(find(lines, "App")?.type).toBe("function");
    expect(lines[1].some((t) => t.text === "b" && t.type === "tag")).toBe(false);
  });

  it("highlights CSS properties, selectors, and values", () => {
    const lines = highlight(samples[3][1], "css");
    expect(find(lines, "--accent")?.type).toBe("property");
    expect(find(lines, "#86c2a2")?.type).toBe("number");
    expect(find(lines, "@media")?.type).toBe("keyword");
    expect(find(lines, "page")?.type).toBe("type");
    expect(find(lines, "padding")?.type).toBe("property");
  });

  it("never throws on odd input", () => {
    for (const code of ["", "`unterminated", "/* open", "'''", "<", "{{{{"]) {
      expect(() => highlight(code, "tsx")).not.toThrow();
      expect(join(highlight(code, "css"))).toBe(code);
    }
  });

  it("maps file extensions to languages", () => {
    expect(languageOf("a/b.tsx")).toBe("tsx");
    expect(languageOf("a.css")).toBe("css");
    expect(languageOf("a.ts")).toBe("ts");
    expect(languageOf("a.mjs")).toBe("js");
  });
});
