import { useEffect, useState } from "react";
import { getNode, splitPath } from "../../fs";
import { copyText, cx } from "../../lib/util";
import { useOS } from "../../state/os";
import AppIcon from "../../ui/AppIcon";
import { CheckIcon, CopyIcon } from "../../ui/Glyphs";
import type { AppProps } from "../registry";
import "./reader.css";

type Block =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "text"; text: string };

// Light markdown-ish parsing: headings, bullet lists, everything else preformatted.
function parse(text: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "text", text: para.join("\n") });
    para = [];
  };
  for (const line of text.split("\n")) {
    if (line.startsWith("# ")) {
      flush();
      blocks.push({ kind: "h1", text: line.slice(2) });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ kind: "h2", text: line.slice(3) });
    } else if (/^\s*•\s/.test(line)) {
      flush();
      const item = line.replace(/^\s*•\s/, "");
      const last = blocks[blocks.length - 1];
      if (last && last.kind === "list") last.items.push(item);
      else blocks.push({ kind: "list", items: [item] });
    } else if (line.trim() === "") {
      flush();
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

export default function Reader({ route }: AppProps) {
  const { openApp } = useOS();
  const [copied, setCopied] = useState(false);
  const parts = splitPath(route);
  const node = getNode(parts);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!node || node.kind !== "file" || node.type !== "text") {
    return (
      <div className="appState">
        <AppIcon app="reader" size={48} />
        <p className="appStateTitle">This document couldn't be opened.</p>
        <p className="muted">It may have moved, or it isn't a text file.</p>
        <button type="button" className="btn btnPrimary" onClick={() => openApp("finder")}>
          Browse files
        </button>
      </div>
    );
  }

  const text = node.text();
  const isMarkdown = node.name.endsWith(".md");
  const folder = parts.slice(0, -1).join("/");

  const onCopy = async () => {
    if (await copyText(text)) setCopied(true);
  };

  let CopyGlyph = CopyIcon;
  let copyLabel = "Copy";
  if (copied) {
    CopyGlyph = CheckIcon;
    copyLabel = "Copied";
  }

  return (
    <div className="app reader">
      <div className="appToolbar">
        <AppIcon app="reader" size={22} />
        <span className="readerName">{node.label}</span>
        <span className="toolbarSpacer" />
        <button type="button" className="btn btnGhost" onClick={onCopy} aria-live="polite">
          <CopyGlyph width={14} height={14} /> {copyLabel}
        </button>
        <button type="button" className="btn" onClick={() => openApp("finder", folder)}>
          Open in Files
        </button>
      </div>
      <div className="appScroll">
        <article className={cx("readerDoc", isMarkdown && "isMarkdown", !isMarkdown && "isPlain")}>
          {parse(text).map((block, i) => {
            if (block.kind === "h1") return <h1 key={i}>{block.text}</h1>;
            if (block.kind === "h2") return <h2 key={i}>{block.text}</h2>;
            if (block.kind === "list") {
              return (
                <ul key={i}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{block.text}</p>;
          })}
        </article>
      </div>
    </div>
  );
}
