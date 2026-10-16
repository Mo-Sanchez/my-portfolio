import { useEffect, useMemo, useRef, useState } from "react";
import { copyText, cx } from "../../lib/util";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, CopyIcon, LayoutIcon, XIcon } from "../../ui/Glyphs";
import type { AppProps } from "../registry";
import { highlight } from "./highlight";
import { buildTree, findSource, sourceFiles, type SourceFile, type TreeNode } from "./sources";
import "./editor.css";

const DEFAULT_FILE = sourceFiles[0].path;

const languageNames: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TypeScript JSX",
  js: "JavaScript",
  css: "CSS",
};

function fileName(path: string) {
  return path.split("/").pop() || path;
}

function FileBadge({ path }: { path: string }) {
  const ext = path.split(".").pop() || "";
  let label = "JS";
  if (ext === "ts") label = "TS";
  if (ext === "tsx") label = "TSX";
  if (ext === "css") label = "CSS";
  return <span className={cx("edBadge", `edBadge-${ext}`)}>{label}</span>;
}

function Tree({ node, depth, active, collapsed, onToggle, onOpen }: {
  node: TreeNode;
  depth: number;
  active: string;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
  onOpen: (file: SourceFile) => void;
}) {
  return (
    <ul className="edTree" role={(depth === 0 && "tree") || "group"} aria-label={(depth === 0 && "Source files") || undefined}>
      {node.children.map((child) => {
        const pad = { paddingLeft: 8 + depth * 12 };
        if (child.file) {
          const file = child.file;
          return (
            <li key={child.path} role="none">
              <button
                type="button"
                role="treeitem"
                aria-selected={active === file.path}
                className={cx("edNode", active === file.path && "isActive")}
                style={pad}
                onClick={() => onOpen(file)}
                title={file.path}
              >
                <FileBadge path={file.path} />
                <span className="edNodeName">{child.name}</span>
              </button>
            </li>
          );
        }
        const open = !collapsed.has(child.path);
        let Chevron = ChevronRightIcon;
        if (open) Chevron = ChevronDownIcon;
        return (
          <li key={child.path} role="none">
            <button
              type="button"
              role="treeitem"
              aria-expanded={open}
              className="edNode edFolder"
              style={pad}
              onClick={() => onToggle(child.path)}
            >
              <Chevron width={13} height={13} />
              <span className="edNodeName">{child.name}</span>
            </button>
            {open && (
              <Tree node={child} depth={depth + 1} active={active} collapsed={collapsed} onToggle={onToggle} onOpen={onOpen} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

function CodeView({ file }: { file: SourceFile }) {
  const lines = useMemo(() => highlight(file.code, file.language), [file]);
  const [current, setCurrent] = useState<number | null>(null);
  const gutterWidth = `${String(lines.length).length + 1}ch`;
  return (
    <div className="edCode" role="region" aria-label={`${fileName(file.path)} source, read-only`} tabIndex={0}>
      <div className="edLines" style={{ ["--gutter" as string]: gutterWidth }}>
        {lines.map((tokens, i) => (
          <div
            key={i}
            className={cx("edLine", current === i && "isCurrent")}
            onClick={() => setCurrent(i)}
          >
            <span className="edNum" aria-hidden="true">
              {i + 1}
            </span>
            <code className="edText">
              {tokens.map((t, j) => {
                if (t.type === "plain") return t.text;
                return (
                  <span key={j} className={`tok-${t.type}`}>
                    {t.text}
                  </span>
                );
              })}
              {tokens.length === 0 && " "}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CodeEditor({ route, setRoute }: AppProps) {
  const initial = findSource(route)?.path || DEFAULT_FILE;
  const [tabs, setTabs] = useState<string[]>([initial]);
  const [active, setActive] = useState(initial);
  const [seenRoute, setSeenRoute] = useState(route);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(0);
  const tree = useMemo(() => buildTree(), []);

  // Follow the route when it changes from outside (deep links, Back/Forward).
  if (route !== seenRoute) {
    setSeenRoute(route);
    const target = findSource(route);
    if (target) {
      setActive(target.path);
      if (!tabs.includes(target.path)) setTabs([...tabs, target.path]);
    }
  }

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const file = findSource(active);

  const open = (f: SourceFile) => {
    if (!tabs.includes(f.path)) setTabs([...tabs, f.path]);
    setActive(f.path);
    setExplorerOpen(false);
    setSeenRoute(f.path);
    setRoute(f.path);
  };

  const closeTab = (path: string) => {
    const index = tabs.indexOf(path);
    const next = tabs.filter((t) => t !== path);
    setTabs(next);
    if (path !== active) return;
    const neighbor = next[Math.min(index, next.length - 1)];
    if (neighbor) {
      setActive(neighbor);
      setSeenRoute(neighbor);
      setRoute(neighbor);
    } else {
      setActive("");
      setSeenRoute("");
      setRoute("");
    }
  };

  const toggleFolder = (path: string) => {
    const next = new Set(collapsed);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setCollapsed(next);
  };

  const copy = async () => {
    if (!file) return;
    const ok = await copyText(file.code);
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  let CopyGlyph = CopyIcon;
  let copyLabel = "Copy";
  if (copied) {
    CopyGlyph = CheckIcon;
    copyLabel = "Copied";
  }

  const lineCount = file?.code.split("\n").length || 0;

  return (
    <div className={cx("app editor", explorerOpen && "explorerOpen")}>
      <div className="appRow">
        <nav className="edExplorer" aria-label="Explorer">
          <p className="sideHeading">Explorer · my-portfolio</p>
          <Tree node={tree} depth={0} active={active} collapsed={collapsed} onToggle={toggleFolder} onOpen={open} />
          <p className="edExplorerNote">
            Real source from this site, bundled at build time. Read-only.
          </p>
        </nav>
        {explorerOpen && <button type="button" className="edScrim" aria-label="Close explorer" onClick={() => setExplorerOpen(false)} />}

        <div className="edMain">
          <div className="edTabs">
            <button
              type="button"
              className="iconBtn edExplorerToggle"
              aria-label="Toggle explorer"
              aria-expanded={explorerOpen}
              onClick={() => setExplorerOpen((o) => !o)}
            >
              <LayoutIcon />
            </button>
            <div className="edTabList" role="group" aria-label="Open files">
              {tabs.map((path) => (
                <div key={path} className={cx("edTab", path === active && "isActive")}>
                  <button
                    type="button"
                    aria-current={(path === active && "true") || undefined}
                    className="edTabLabel"
                    onClick={() => {
                      const f = findSource(path);
                      if (f) open(f);
                    }}
                    title={path}
                  >
                    <FileBadge path={path} />
                    {fileName(path)}
                  </button>
                  <button type="button" className="edTabClose" aria-label={`Close ${fileName(path)}`} onClick={() => closeTab(path)}>
                    <XIcon width={12} height={12} />
                  </button>
                </div>
              ))}
            </div>
            {file && (
              <button type="button" className="btn btnGhost edCopy" onClick={copy} aria-live="polite">
                <CopyGlyph width={14} height={14} />
                {copyLabel}
              </button>
            )}
          </div>

          {file && (
            <>
              <div className="edCrumbs">
                <span className="edPath">{file.path.split("/").join(" › ")}</span>
                <span className="edNote">{file.note}</span>
              </div>
              <CodeView key={file.path} file={file} />
              <footer className="edStatus">
                <span>{languageNames[file.language]}</span>
                <span>{lineCount} lines</span>
                <span className="edStatusSpacer" />
                <span>Read-only</span>
                <span>UTF-8</span>
                <span>LF</span>
              </footer>
            </>
          )}
          {!file && (
            <div className="emptyState edEmpty">
              <p>No file open.</p>
              <button type="button" className="btn" onClick={() => open(sourceFiles[0])}>
                Open {fileName(DEFAULT_FILE)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
