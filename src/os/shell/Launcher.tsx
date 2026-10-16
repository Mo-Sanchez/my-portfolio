import { useEffect, useMemo, useRef, useState } from "react";
import { cx, plural } from "../lib/util";
import { buildIndex, search, type SearchItem } from "../search";
import { useOS } from "../state/os";
import AppIcon from "../ui/AppIcon";
import { SearchIcon } from "../ui/Glyphs";

let cachedIndex: SearchItem[] | null = null;
function getIndex() {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

function LauncherPanel({ onClose }: { onClose: () => void }) {
  const { run, isMobile } = useOS();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const results = useMemo(() => search(getIndex(), query), [query]);
  const current = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const choose = (item: SearchItem | undefined) => {
    if (!item) return;
    onClose();
    run(item.action);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((current + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[current]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  let heading = "Suggestions";
  if (query.trim()) heading = plural(results.length, "result");

  return (
    <div className="launcherBackdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx("launcher glass", isMobile && "isMobile")} role="dialog" aria-modal="true" aria-label="Search MoOS">
        <div className="launcherInputRow">
          <SearchIcon width={20} height={20} className="launcherIcon" />
          <input
            ref={inputRef}
            className="launcherInput"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search apps, projects, skills…"
            role="combobox"
            aria-expanded="true"
            aria-controls="launcher-results"
            aria-activedescendant={results[current] && `launcher-${results[current].id}`}
            aria-autocomplete="list"
            spellCheck={false}
            autoComplete="off"
          />
          {isMobile && (
            <button type="button" className="btn btnGhost" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
        <p className="launcherHeading" aria-live="polite">
          {heading}
        </p>
        <ul id="launcher-results" ref={listRef} className="launcherResults" role="listbox" aria-label="Results">
          {results.map((item, i) => (
            <li
              key={item.id}
              id={`launcher-${item.id}`}
              data-index={i}
              role="option"
              aria-selected={i === current}
              className={cx("launcherItem", i === current && "isActive")}
              onMouseMove={() => i !== current && setActive(i)}
              onClick={() => choose(item)}
            >
              <AppIcon app={item.icon} size={30} />
              <span className="launcherText">
                <span className="launcherTitle">{item.title}</span>
                <span className="launcherSub">{item.subtitle}</span>
              </span>
              <span className="launcherKind">{item.kind}</span>
            </li>
          ))}
          {results.length === 0 && (
            <li className="launcherEmpty" role="presentation">
              No matches for “{query}”. Try a project name, a skill like “Java”, or “résumé”.
            </li>
          )}
        </ul>
        <p className="launcherFooter" aria-hidden="true">
          <span>
            <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> navigate
          </span>
          <span>
            <kbd className="kbd">↵</kbd> open
          </span>
          <span>
            <kbd className="kbd">esc</kbd> close
          </span>
        </p>
      </div>
    </div>
  );
}

export default function Launcher() {
  const { launcherOpen, setLauncherOpen } = useOS();
  if (!launcherOpen) return null;
  return <LauncherPanel onClose={() => setLauncherOpen(false)} />;
}
