// A small syntax highlighter for the Code app. It splits source into lines of
// typed tokens and carries state (open block comments, template strings, CSS
// nesting) across lines. It favors robustness over completeness: it never
// throws, and joining a line's tokens reproduces that line exactly (a trailing
// carriage return from CRLF files is dropped).

export type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "type"
  | "function"
  | "property"
  | "tag"
  | "punctuation"
  | "operator"
  | "plain";

export type Token = { text: string; type: TokenType };
export type Language = "ts" | "tsx" | "js" | "css";

const JS_KEYWORDS = new Set(
  (
    "import export from default as const let var function return if else for while do switch case break continue " +
    "new delete typeof instanceof in of class extends super this null undefined true false try catch finally throw " +
    "async await yield type interface enum implements private public protected readonly static declare keyof satisfies void"
  ).split(" "),
);

const CSS_AT = /^@[\w-]+/;

type State = { mode: "code" | "block" | "template"; depth: number };

function push(tokens: Token[], text: string, type: TokenType) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last && last.type === type) last.text += text;
  else tokens.push({ text, type });
}

// Index just past the closing quote, honoring backslash escapes (or end of line).
function scanString(line: string, start: number, quote: string) {
  let i = start + 1;
  while (i < line.length) {
    if (line[i] === "\\") i += 2;
    else if (line[i] === quote) return i + 1;
    else i++;
  }
  return line.length;
}

function lastSignificant(tokens: Token[]) {
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].text.trim()) return tokens[i];
  }
  return undefined;
}

function jsLine(line: string, state: State, jsx: boolean): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (state.mode === "block") {
      const end = line.indexOf("*/", i);
      if (end === -1) {
        push(tokens, line.slice(i), "comment");
        return tokens;
      }
      push(tokens, line.slice(i, end + 2), "comment");
      i = end + 2;
      state.mode = "code";
      continue;
    }
    if (state.mode === "template") {
      let j = i;
      while (j < line.length && line[j] !== "`") {
        if (line[j] === "\\") j++;
        j++;
      }
      if (j >= line.length) {
        push(tokens, line.slice(i), "string");
        return tokens;
      }
      push(tokens, line.slice(i, j + 1), "string");
      i = j + 1;
      state.mode = "code";
      continue;
    }

    const rest = line.slice(i);
    const ch = line[i];
    const ws = /^\s+/.exec(rest);
    if (ws) {
      push(tokens, ws[0], "plain");
      i += ws[0].length;
      continue;
    }
    if (rest.startsWith("//")) {
      push(tokens, rest, "comment");
      return tokens;
    }
    if (rest.startsWith("/*")) {
      state.mode = "block";
      push(tokens, "/*", "comment");
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const end = scanString(line, i, ch);
      push(tokens, line.slice(i, end), "string");
      i = end;
      continue;
    }
    if (ch === "`") {
      state.mode = "template";
      push(tokens, "`", "string");
      i += 1;
      continue;
    }
    const num = /^(0[xob][\da-f_]+n?|\d[\d_]*(\.\d+)?(e[+-]?\d+)?n?|\.\d+)/i.exec(rest);
    if (num) {
      push(tokens, num[0], "number");
      i += num[0].length;
      continue;
    }
    // JSX tags: "<Name" or "</name" where a less-than comparison is unlikely.
    if (jsx && ch === "<") {
      const tag = /^<\/?([A-Za-z][\w.]*)/.exec(rest);
      const prev = lastSignificant(tokens);
      const afterValue = prev && (prev.type === "plain" || prev.type === "number" || prev.text.endsWith(")"));
      if (tag && !afterValue) {
        const open = tag[0].length - tag[1].length;
        push(tokens, tag[0].slice(0, open), "punctuation");
        push(tokens, tag[1], "tag");
        i += tag[0].length;
        continue;
      }
    }
    const ident = /^[A-Za-z_$][\w$]*/.exec(rest);
    if (ident) {
      const word = ident[0];
      const after = line.slice(i + word.length);
      const prev = lastSignificant(tokens);
      let type: TokenType = "plain";
      if (prev && prev.text.endsWith(".") && prev.type === "punctuation") {
        type = "property";
        if (/^\s*\(/.test(after)) type = "function";
      } else if (JS_KEYWORDS.has(word)) type = "keyword";
      else if (/^\s*(<[^>]*>)?\s*\(/.test(after) && !(prev && prev.text === "new")) type = "function";
      else if (/^[A-Z]/.test(word)) type = "type";
      else if (/^\??:(?!:)/.test(after)) type = "property";
      push(tokens, word, type);
      i += word.length;
      continue;
    }
    if (/[{}()[\];,.]/.test(ch)) push(tokens, ch, "punctuation");
    else push(tokens, ch, "operator");
    i += 1;
  }
  return tokens;
}

function cssLine(line: string, state: State): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    if (state.mode === "block") {
      const end = line.indexOf("*/", i);
      if (end === -1) {
        push(tokens, line.slice(i), "comment");
        return tokens;
      }
      push(tokens, line.slice(i, end + 2), "comment");
      i = end + 2;
      state.mode = "code";
      continue;
    }
    const rest = line.slice(i);
    const ch = line[i];
    const ws = /^\s+/.exec(rest);
    if (ws) {
      push(tokens, ws[0], "plain");
      i += ws[0].length;
      continue;
    }
    if (rest.startsWith("/*")) {
      state.mode = "block";
      push(tokens, "/*", "comment");
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const end = scanString(line, i, ch);
      push(tokens, line.slice(i, end), "string");
      i = end;
      continue;
    }
    const at = CSS_AT.exec(rest);
    if (at) {
      push(tokens, at[0], "keyword");
      i += at[0].length;
      continue;
    }
    const hex = /^#[\da-f]{3,8}\b/i.exec(rest);
    if (hex && state.depth > 0) {
      push(tokens, hex[0], "number");
      i += hex[0].length;
      continue;
    }
    const num = /^-?(\d*\.)?\d+(%|[a-z]+)?/i.exec(rest);
    if (num) {
      push(tokens, num[0], "number");
      i += num[0].length;
      continue;
    }
    const ident = /^-*[A-Za-z_][\w-]*/.exec(rest);
    if (ident) {
      const word = ident[0];
      const after = line.slice(i + word.length);
      // A selector if a "{" follows on this line before any ";".
      const brace = after.indexOf("{");
      const semi = after.indexOf(";");
      const prev = line[i - 1];
      const selector = brace !== -1 && (semi === -1 || brace < semi) && prev !== "(";
      let type: TokenType = "plain";
      if (/^\(/.test(after)) type = "function";
      else if (selector || (state.depth === 0 && /^\s*,?\s*$/.test(after))) {
        if (prev === "." || prev === "#") type = "type";
        else if (prev === ":") type = "keyword";
        else type = "tag";
      } else if (/^\s*:/.test(after)) type = "property";
      push(tokens, word, type);
      i += word.length;
      continue;
    }
    if (ch === "{") state.depth += 1;
    if (ch === "}") state.depth = Math.max(0, state.depth - 1);
    if (/[{}()[\];,.:#]/.test(ch)) push(tokens, ch, "punctuation");
    else push(tokens, ch, "operator");
    i += 1;
  }
  return tokens;
}

export function highlight(code: string, language: Language): Token[][] {
  const state: State = { mode: "code", depth: 0 };
  return code.split("\n").map((raw) => {
    const line = raw.replace(/\r$/, "");
    try {
      if (language === "css") return cssLine(line, state);
      return jsLine(line, state, language === "tsx");
    } catch {
      return [{ text: line, type: "plain" }];
    }
  });
}

export function languageOf(path: string): Language {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".ts")) return "ts";
  return "js";
}
