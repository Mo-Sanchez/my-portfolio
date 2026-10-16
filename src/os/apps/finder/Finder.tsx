import { useState } from "react";
import { allProjects, isFilled, projectCategories } from "../../../data/content";
import {
  getNode,
  labelPath,
  root,
  splitPath,
  type FolderNode,
  type FsNode,
} from "../../fs";
import { copyText, cx, loadJSON, plural, saveJSON } from "../../lib/util";
import { useOS, type MenuItem } from "../../state/os";
import { formatHash } from "../../state/router";
import AppIcon, { type IconKind } from "../../ui/AppIcon";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  HomeIcon,
  ListIcon,
  SearchIcon,
  XIcon,
} from "../../ui/Glyphs";
import { ProjectCover } from "../project/ProjectDetails";
import type { AppProps } from "../registry";
import "./finder.css";

type Entry = { node: FsNode; path: string[] };
type View = "grid" | "list";
type SortKey = "name" | "kind";

const VIEW_KEY = "moos:finder-view";

function iconFor(node: FsNode): IconKind {
  if (node.kind === "folder") return "folder";
  if (node.type === "project") return "project";
  if (node.type === "app") return node.iconApp || "finder";
  if (node.type === "pdf") return "resume";
  return "reader";
}

function kindOf(node: FsNode) {
  if (node.kind === "folder") return "Folder";
  const kinds: Record<string, string> = {
    project: "Project",
    app: "Application",
    pdf: "PDF document",
    link: "Link",
    text: "Text document",
  };
  if (node.type === "text" && node.name.endsWith(".md")) return "Markdown document";
  return kinds[node.type] || "File";
}

function projectFor(node: FsNode) {
  if (node.kind !== "file" || node.type !== "project") return undefined;
  return allProjects.find((p) => p.slug === node.slug);
}

function detailOf(node: FsNode) {
  if (node.kind === "folder") {
    if (node.description) return node.description;
    return plural(node.children.length, "item");
  }
  const project = projectFor(node);
  if (project) return project.stack.join(", ");
  if (node.type === "app") return "Opens the app";
  if (node.type === "pdf") return "Résumé, PDF";
  return "";
}

function searchText(node: FsNode) {
  const project = projectFor(node);
  if (!project) return node.label.toLowerCase();
  return [node.label, project.tagline, project.stack.join(" "), project.status || ""].join(" ").toLowerCase();
}

function walk(folder: FolderNode, path: string[], out: Entry[]) {
  for (const child of folder.children) {
    const childPath = [...path, child.name];
    out.push({ node: child, path: childPath });
    if (child.kind === "folder") walk(child, childPath, out);
  }
  return out;
}

function projectGroups(folder: FolderNode): FolderNode[] | null {
  if (folder.children.length === 0) return null;
  const folders = folder.children.filter((c): c is FolderNode => c.kind === "folder");
  if (folders.length !== folder.children.length) return null;
  const allProjects = folders.every((f) => f.children.every((c) => c.kind === "file" && c.type === "project"));
  if (!allProjects) return null;
  return folders;
}

const sidebar: { label: string; path: string; icon: IconKind }[] = [
  { label: "Home", path: "", icon: "finder" },
  { label: "Desktop", path: "desktop", icon: "folder" },
  { label: "Projects", path: "projects", icon: "folder" },
  { label: "Documents", path: "documents", icon: "folder" },
  { label: "Applications", path: "applications", icon: "folder" },
];

export default function Finder({ route, setRoute }: AppProps) {
  const os = useOS();
  const [history, setHistory] = useState<string[]>([route]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>(() => loadJSON<View>(VIEW_KEY, "grid"));
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "name", asc: true });

  // Routes can also change from outside (menu bar, launcher, Back button).
  if (route !== history[index]) {
    const next = [...history.slice(0, index + 1), route];
    setHistory(next);
    setIndex(next.length - 1);
    setSelected(null);
    setQuery("");
  }

  let parts = splitPath(route);
  let folder = getNode(parts);
  if (!folder || folder.kind !== "folder") {
    parts = [];
    folder = root;
  }
  const current = folder;
  const labels = labelPath(parts);

  const navigate = (path: string) => {
    setSelected(null);
    setQuery("");
    setRoute(path);
  };

  const go = (delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= history.length) return;
    setIndex(target);
    setSelected(null);
    setQuery("");
    setRoute(history[target]);
  };

  const setViewMode = (v: View) => {
    setView(v);
    saveJSON(VIEW_KEY, v);
  };

  const folderPath = parts.join("/");
  const q = query.trim().toLowerCase();
  // A folder made only of project folders (e.g. Projects) shows every project
  // grouped by subfolder, so visitors see the work without extra clicks.
  const groups = projectGroups(current);
  const grouped = Boolean(groups) && !q;

  // Folders hold a handful of items, so this is cheap to compute each render.
  const entries = (() => {
    const base = splitPath(folderPath);
    let list: Entry[] = current.children.map((node) => ({ node, path: [...base, node.name] }));
    if (groups && grouped) {
      list = groups.flatMap((g) => g.children.map((node) => ({ node, path: [...base, g.name, node.name] })));
    }
    if (q) list = walk(current, base, []).filter((e) => searchText(e.node).includes(q));
    let dir = 1;
    if (!sort.asc) dir = -1;
    const sorted = [...list].sort((a, b) => {
      const af = Number(a.node.kind !== "folder");
      const bf = Number(b.node.kind !== "folder");
      if (af !== bf) return af - bf;
      if (sort.key === "kind") {
        const k = kindOf(a.node).localeCompare(kindOf(b.node));
        if (k !== 0) return k * dir;
      }
      return a.node.label.localeCompare(b.node.label) * dir;
    });
    if (!groups || !grouped) return sorted;
    // Keep the folder order, sorting only within each group.
    const order = groups.map((g) => g.name);
    return sorted.sort((a, b) => order.indexOf(a.path[a.path.length - 2]) - order.indexOf(b.path[b.path.length - 2]));
  })();

  const open = (entry: Entry) => {
    const { node } = entry;
    if (node.kind === "folder") navigate(entry.path.join("/"));
    else os.openTarget(node.open);
  };

  const selectedEntry = entries.find((e) => e.path.join("/") === selected);

  const linkFor = (entry: Entry) => {
    const node = entry.node;
    let hash = formatHash({ appId: "finder", route: entry.path.join("/") });
    if (node.kind === "file" && "appId" in node.open) hash = formatHash(node.open);
    return `${window.location.origin}${window.location.pathname}${hash}`;
  };

  const itemMenu = (entry: Entry) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(entry.path.join("/"));
    const items: MenuItem[] = [{ label: "Open", onSelect: () => open(entry) }];
    const project = projectFor(entry.node);
    if (project) {
      items.push({ label: "Open in Browser", onSelect: () => os.openApp("browser", `projects/${project.slug}`) });
      if (project.github) items.push({ label: "View Source on GitHub", onSelect: () => os.run({ type: "url", url: project.github! }) });
    }
    if (entry.node.kind === "file" && entry.node.type === "pdf") {
      items.push({ label: "Download", onSelect: () => os.run({ type: "downloadResume" }) });
    }
    if (query) {
      const parent = entry.path.slice(0, -1).join("/");
      items.push({ label: "Show in Enclosing Folder", onSelect: () => navigate(parent) });
    }
    items.push("separator", {
      label: "Copy Link",
      onSelect: () => {
        copyText(linkFor(entry)).then((ok) => {
          if (ok) os.notify({ title: "Link copied", body: entry.node.label, appId: "finder" });
        });
      },
    });
    os.openContextMenu({ x: e.clientX, y: e.clientY, items, label: `${entry.node.label} options` });
  };

  const backgroundMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-entry]")) return;
    e.preventDefault();
    os.openContextMenu({
      x: e.clientX,
      y: e.clientY,
      label: "Folder options",
      items: [
        { label: "View as Icons", checked: view === "grid", onSelect: () => setViewMode("grid") },
        { label: "View as List", checked: view === "list", onSelect: () => setViewMode("list") },
        "separator",
        { label: "Sort by Name", checked: sort.key === "name", onSelect: () => setSort({ key: "name", asc: true }) },
        { label: "Sort by Kind", checked: sort.key === "kind", onSelect: () => setSort({ key: "kind", asc: true }) },
      ],
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const i = entries.findIndex((en) => en.path.join("/") === selected);
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = Math.min(i + 1, entries.length - 1);
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = Math.max(i - 1, 0);
    if (next >= 0 && entries[next]) {
      e.preventDefault();
      setSelected(entries[next].path.join("/"));
      return;
    }
    if (e.key === "Enter" && selectedEntry) {
      e.preventDefault();
      open(selectedEntry);
    }
    if ((e.key === "Backspace" || (e.altKey && e.key === "ArrowUp")) && parts.length) {
      e.preventDefault();
      navigate(parts.slice(0, -1).join("/"));
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sort.key === key) setSort({ key, asc: !sort.asc });
    else setSort({ key, asc: true });
  };

  const sortMark = (key: SortKey) => {
    if (sort.key !== key) return null;
    if (sort.asc) return " ↑";
    return " ↓";
  };

  let ariaSortName: "ascending" | "descending" | "none" = "none";
  if (sort.key === "name") ariaSortName = "descending";
  if (sort.key === "name" && sort.asc) ariaSortName = "ascending";
  let ariaSortKind: "ascending" | "descending" | "none" = "none";
  if (sort.key === "kind") ariaSortKind = "descending";
  if (sort.key === "kind" && sort.asc) ariaSortKind = "ascending";

  const activePath = folderPath;
  let status = plural(entries.length, "item");
  if (grouped && groups) status = `${plural(entries.length, "project")} in ${plural(groups.length, "folder")}`;
  if (query) status = `${plural(entries.length, "result")} in ${labels[labels.length - 1] || "Home"}`;

  const renderGrid = (items: Entry[]) => (
    <ul className="finderGrid" role="listbox" aria-label="Items">
      {items.map((entry) => {
        const key = entry.path.join("/");
        const project = projectFor(entry.node);
        return (
          <li
            key={key}
            data-entry
            role="option"
            aria-selected={selected === key}
            className={cx("gridItem", project && "isProject", selected === key && "isSelected")}
            onClick={() => {
              if (os.isTouch || os.isMobile) open(entry);
              else setSelected(key);
            }}
            onDoubleClick={() => open(entry)}
            onContextMenu={itemMenu(entry)}
            title={entry.node.label}
          >
            {project && <ProjectCover project={project} size="small" />}
            {!project && <AppIcon app={iconFor(entry.node)} size={58} />}
            <span className="gridLabel">{entry.node.label}</span>
            {project && <span className="gridSub">{project.stack.slice(0, 3).join(" · ")}</span>}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="app finder">
      <div className="appToolbar finderToolbar">
        <div className="toolbarGroup">
          <button type="button" className="iconBtn" onClick={() => go(-1)} disabled={index === 0} aria-label="Back">
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className="iconBtn"
            onClick={() => go(1)}
            disabled={index >= history.length - 1}
            aria-label="Forward"
          >
            <ChevronRightIcon />
          </button>
        </div>

        <nav className="crumbs" aria-label="Folder path">
          <button type="button" className="crumb" onClick={() => navigate("")} aria-label="Home">
            <HomeIcon width={14} height={14} />
          </button>
          {labels.map((label, i) => (
            <span key={parts[i]} className="crumbWrap">
              <ChevronRightIcon width={12} height={12} className="crumbSep" />
              <button
                type="button"
                className={cx("crumb", i === labels.length - 1 && "isCurrent")}
                onClick={() => navigate(parts.slice(0, i + 1).join("/"))}
                aria-current={(i === labels.length - 1 && "page") || undefined}
              >
                {label}
              </button>
            </span>
          ))}
        </nav>

        <div className="toolbarSpacer" />

        <div className="toolbarGroup viewToggle" role="group" aria-label="View">
          <button type="button" className="iconBtn" aria-pressed={view === "grid"} aria-label="Icon view" onClick={() => setViewMode("grid")}>
            <GridIcon />
          </button>
          <button type="button" className="iconBtn" aria-pressed={view === "list"} aria-label="List view" onClick={() => setViewMode("list")}>
            <ListIcon />
          </button>
        </div>

        <label className="finderSearch">
          <SearchIcon width={14} height={14} />
          <span className="srOnly">Search this folder</span>
          <input
            className="input"
            type="search"
            value={query}
            placeholder="Search"
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
          />
          {query && (
            <button type="button" className="finderClear" aria-label="Clear search" onClick={() => setQuery("")}>
              <XIcon width={12} height={12} />
            </button>
          )}
        </label>
      </div>

      <div className="appRow">
        <nav className="appSidebar" aria-label="Locations">
          <p className="sideHeading">Favorites</p>
          {sidebar.map((s) => (
            <button
              key={s.label}
              type="button"
              className={cx("sideItem", activePath === s.path && "isActive")}
              onClick={() => navigate(s.path)}
            >
              <AppIcon app={s.icon} size={18} />
              {s.label}
            </button>
          ))}
          <p className="sideHeading">Project folders</p>
          {projectCategories.map((c) => {
            const path = `projects/${c.id}`;
            return (
              <button
                key={c.id}
                type="button"
                className={cx("sideItem", activePath === path && "isActive")}
                onClick={() => navigate(path)}
              >
                <AppIcon app="folder" size={18} />
                {c.label}
              </button>
            );
          })}
        </nav>

        <div
          className="appScroll finderMain"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onContextMenu={backgroundMenu}
          onPointerDown={(e) => {
            if (!(e.target as HTMLElement).closest("[data-entry]")) setSelected(null);
          }}
          aria-label={`${labels[labels.length - 1] || "Home"} contents`}
        >
          {current.description && !query && <p className="folderNote">{current.description}</p>}

          {entries.length === 0 && (
            <div className="emptyState">
              {query && <p>No items match “{query}”.</p>}
              {!query && <p>This folder is empty.</p>}
            </div>
          )}

          {view === "grid" && entries.length > 0 && !grouped && renderGrid(entries)}

          {view === "grid" &&
            grouped &&
            groups?.map((g) => {
              const items = entries.filter((e) => e.path[e.path.length - 2] === g.name);
              const path = [...parts, g.name].join("/");
              return (
                <section key={g.name} className="finderGroup" aria-label={g.label}>
                  <header className="finderGroupHead">
                    <button type="button" className="finderGroupTitle" onClick={() => navigate(path)}>
                      <AppIcon app="folder" size={20} />
                      {g.label}
                      <ChevronRightIcon width={14} height={14} />
                    </button>
                    {g.description && <span className="faint">{g.description}</span>}
                  </header>
                  {renderGrid(items)}
                </section>
              );
            })}

          {view === "list" && entries.length > 0 && (
            <table className="finderList">
              <thead>
                <tr>
                  <th aria-sort={ariaSortName}>
                    <button type="button" onClick={() => toggleSort("name")}>
                      Name{sortMark("name")}
                    </button>
                  </th>
                  <th aria-sort={ariaSortKind}>
                    <button type="button" onClick={() => toggleSort("kind")}>
                      Kind{sortMark("kind")}
                    </button>
                  </th>
                  <th className="colDetail">{(query && "Location") || (grouped && "Folder") || "Details"}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const key = entry.path.join("/");
                  let detail = detailOf(entry.node);
                  if (query) detail = labelPath(entry.path.slice(0, -1)).join(" › ") || "Home";
                  if (grouped) detail = labelPath(entry.path.slice(0, -1)).pop() || "";
                  return (
                    <tr
                      key={key}
                      data-entry
                      aria-selected={selected === key}
                      className={cx(selected === key && "isSelected")}
                      onClick={() => {
                        if (os.isTouch || os.isMobile) open(entry);
                        else setSelected(key);
                      }}
                      onDoubleClick={() => open(entry)}
                      onContextMenu={itemMenu(entry)}
                    >
                      <td>
                        <span className="listName">
                          <AppIcon app={iconFor(entry.node)} size={22} />
                          {entry.node.label}
                        </span>
                      </td>
                      <td className="faint">{kindOf(entry.node)}</td>
                      <td className="faint colDetail">{detail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {selectedEntry && <Preview entry={selectedEntry} onOpen={() => open(selectedEntry)} />}
      </div>

      <footer className="finderStatus" aria-live="polite">
        <span>{status}</span>
        {selectedEntry && <span className="faint">“{selectedEntry.node.label}” selected · double-click or press Enter to open</span>}
      </footer>
    </div>
  );
}

function Preview({ entry, onOpen }: { entry: Entry; onOpen: () => void }) {
  const { node } = entry;
  const project = projectFor(node);
  let excerpt = "";
  if (node.kind === "file" && node.type === "text") excerpt = node.text().split("\n").slice(0, 8).join("\n");

  return (
    <section className="finderPreview" aria-label="Preview">
      {project && <ProjectCover project={project} size="small" />}
      {!project && (
        <div className="previewIcon">
          <AppIcon app={iconFor(node)} size={72} />
        </div>
      )}
      <h3 className="previewName">{node.label}</h3>
      <p className="faint previewKind">{kindOf(node)}</p>
      {project && isFilled(project.tagline) && <p className="previewText">{project.tagline}</p>}
      {project && (
        <ul className="tagList">
          {project.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      )}
      {excerpt && <pre className="previewExcerpt">{excerpt}</pre>}
      {!project && !excerpt && <p className="previewText muted">{detailOf(node)}</p>}
      <button type="button" className="btn btnPrimary" onClick={onOpen}>
        Open
      </button>
    </section>
  );
}
