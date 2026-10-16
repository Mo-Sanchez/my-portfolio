import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { displayPath } from "../../fs";
import { cx } from "../../lib/util";
import { useOS } from "../../state/os";
import type { AppProps } from "../registry";
import { complete, defaultEnv, MOOS_VERSION, runCommand, type Effect, type Line } from "./commands";
import "./terminal.css";

const HISTORY_KEY = "moos:terminal-history";

type Entry = { id: number; line: Line };

let nextId = 0;
const makeEntries = (lines: Line[]): Entry[] => lines.map((line) => ({ id: nextId++, line }));

function loadHistory(): string[] {
  try {
    const raw = window.sessionStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((h) => typeof h === "string").slice(-100);
  } catch {
    // Storage unavailable: history lasts for this window only.
  }
  return [];
}

function saveHistory(history: string[]) {
  try {
    window.sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-100)));
  } catch {
    // ignore
  }
}

const banner: Line[] = [
  { kind: "accent", text: `MoOS Terminal · version ${MOOS_VERSION}` },
  { kind: "muted", text: "Type 'help' to get started. Try 'projects', 'neofetch', or 'open resume.pdf'." },
  { kind: "blank" },
];

function Prompt({ cwd }: { cwd: string }) {
  return (
    <span className="tPrompt" aria-hidden="true">
      <span className="tUser">moises@moos</span> <span className="tPath">{cwd}</span> <span className="tSym">%</span>{" "}
    </span>
  );
}

function OutputLine({ line }: { line: Line }) {
  switch (line.kind) {
    case "prompt":
      return (
        <div className="tLine">
          <Prompt cwd={line.cwd} />
          <span>{line.input}</span>
        </div>
      );
    case "blank":
      return <div className="tLine tBlank" />;
    case "link":
      return (
        <div className="tLine">
          {line.text && <span className="tMuted">{line.text}</span>}
          <a className="tLink" href={line.href} target="_blank" rel="noopener noreferrer">
            {line.label}
          </a>
        </div>
      );
    case "columns":
      return (
        <div className="tColumns">
          {line.items.map((item) => (
            <span key={item.name} className={cx("tItem", `tItem-${item.kind}`)}>
              {item.name}
            </span>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="tTable" style={{ gridTemplateColumns: `repeat(${line.rows[0]?.length || 1}, auto)` }}>
          {line.rows.map((row, r) =>
            row.map((cell, c) => (
              <span key={`${r}-${c}`} className={cx("tCell", c === 0 && "tCellFirst")}>
                {cell}
              </span>
            )),
          )}
        </div>
      );
    case "neofetch":
      return (
        <div className="tNeofetch">
          <pre className="tArt" aria-hidden="true">
            {line.art.join("\n")}
          </pre>
          <div className="tInfo">
            {line.info.map(([key, value], i) => {
              if (!key) {
                return (
                  <div key={i} className={cx(i === 0 && "tUser")}>
                    {value}
                  </div>
                );
              }
              return (
                <div key={i}>
                  <span className="tKey">{key}</span>
                  <span className="tMuted">: </span>
                  {value}
                </div>
              );
            })}
            <div className="tSwatches" aria-hidden="true">
              {["#102c26", "#1e4237", "#526b4f", "#859586", "#a5aca8", "#e8ede9"].map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      );
    default:
      return <div className={cx("tLine", `t-${line.kind}`)}>{line.text}</div>;
  }
}

export default function Terminal({ windowId, active }: AppProps) {
  const os = useOS();
  const [entries, setEntries] = useState<Entry[]>(() => makeEntries(banner));
  const [cwd, setCwd] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [cursor, setCursor] = useState<number | null>(null);
  const draft = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) inputRef.current?.focus({ preventScroll: true });
  }, [active]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const print = (lines: Line[]) => setEntries((list) => [...list, ...makeEntries(lines)].slice(-600));

  const apply = (effects: Effect[]) => {
    for (const effect of effects) {
      switch (effect.type) {
        case "clear":
          setEntries([]);
          break;
        case "open":
          os.openApp(effect.appId, effect.route);
          break;
        case "url":
          os.run({ type: "url", url: effect.url });
          break;
        case "theme":
          os.updateSettings({ theme: effect.theme });
          break;
        case "download-resume":
          os.run({ type: "downloadResume" });
          break;
        case "close":
          os.closeWindow(windowId);
          break;
      }
    }
  };

  const submit = () => {
    const value = input;
    const promptLine: Line = { kind: "prompt", cwd: displayPath(cwd), input: value };
    setInput("");
    setCursor(null);
    draft.current = "";
    if (!value.trim()) {
      print([promptLine]);
      return;
    }
    let nextHistory = history;
    if (history[history.length - 1] !== value) nextHistory = [...history, value].slice(-100);
    setHistory(nextHistory);
    saveHistory(nextHistory);
    let theme: string = os.settings.theme;
    if (theme === "system") theme = `system, currently ${os.theme}`;
    const env = { ...defaultEnv(), theme };
    const result = runCommand(value, { cwd, history: nextHistory }, env);
    print([promptLine, ...result.lines]);
    setCwd(result.cwd);
    apply(result.effects);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const { completed, options } = complete(input, cwd);
      setInput(completed);
      if (options.length > 1) {
        print([{ kind: "prompt", cwd: displayPath(cwd), input }, { kind: "columns", items: options.map((name) => ({ name, kind: "file" })) }]);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      let next = history.length - 1;
      if (cursor === null) draft.current = input;
      else next = Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(null);
        setInput(draft.current);
      } else {
        setCursor(next);
        setInput(history[next]);
      }
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setEntries([]);
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      // Leave Ctrl+C alone when the user is copying a selection.
      const selected = window.getSelection()?.toString() || "";
      const field = inputRef.current;
      const fieldSelection = field && field.selectionStart !== field.selectionEnd;
      if (selected || fieldSelection) return;
      e.preventDefault();
      print([{ kind: "prompt", cwd: displayPath(cwd), input: `${input}^C` }]);
      setInput("");
      setCursor(null);
    }
  };

  return (
    <div
      className="app terminal"
      onMouseUp={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
      }}
    >
      <div ref={scrollRef} className="tScroll" role="log" aria-live="polite" aria-label="Terminal output">
        {entries.map((entry) => (
          <OutputLine key={entry.id} line={entry.line} />
        ))}
        <div className="tLine tInputRow">
          <Prompt cwd={displayPath(cwd)} />
          <input
            ref={inputRef}
            className="tInput"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setCursor(null);
            }}
            onKeyDown={onKeyDown}
            aria-label={`Terminal command input, current directory ${displayPath(cwd)}`}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="send"
          />
        </div>
      </div>
    </div>
  );
}
