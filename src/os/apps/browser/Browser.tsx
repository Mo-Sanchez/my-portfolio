import { useRef, useState } from "react";
import { cx } from "../../lib/util";
import AppIcon, { type IconKind } from "../../ui/AppIcon";
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, LockIcon, PlusIcon, RefreshIcon, XIcon } from "../../ui/Glyphs";
import type { AppProps } from "../registry";
import {
  AboutPage,
  ExternalPage,
  HomePage,
  NotFoundPage,
  ProjectPage,
  ProjectsPage,
  ResumePage,
  SearchPage,
  type Go,
} from "./pages";
import { displayUrl, fromRoute, HOME, normalize, resolve, sameLocation, titleFor, toRoute, type Location } from "./url";
import "./browser.css";

type Tab = { id: number; history: Location[]; index: number; reload: number };

function updateTab(tabs: Tab[], id: number, change: (tab: Tab) => Tab) {
  return tabs.map((t) => {
    if (t.id === id) return change(t);
    return t;
  });
}

function iconFor(location: Location): IconKind {
  if (location.kind === "external") return "browser";
  if (location.kind === "search") return "browser";
  if (location.path.startsWith("projects/")) return "project";
  if (location.path === "projects") return "folder";
  if (location.path === "about") return "about";
  if (location.path === "resume") return "resume";
  return "browser";
}

function Page({ location, go, back, canGoBack }: { location: Location; go: Go; back: () => void; canGoBack: boolean }) {
  if (location.kind === "external") return <ExternalPage url={location.url} onBack={back} canGoBack={canGoBack} />;
  if (location.kind === "search") return <SearchPage query={location.query} go={go} />;
  const path = location.path;
  if (path === "home") return <HomePage go={go} />;
  if (path === "projects") return <ProjectsPage go={go} />;
  if (path === "about") return <AboutPage go={go} />;
  if (path === "resume") return <ResumePage />;
  if (path.startsWith("projects/") && path.split("/").length === 2) {
    return <ProjectPage slug={path.slice("projects/".length)} go={go} />;
  }
  return <NotFoundPage path={path} go={go} />;
}

export default function Browser({ route, setRoute }: AppProps) {
  const [tabs, setTabs] = useState<Tab[]>(() => [{ id: 1, history: [resolve(fromRoute(route))], index: 0, reload: 0 }]);
  const [activeId, setActiveId] = useState(1);
  const [synced, setSynced] = useState(route);
  const [draft, setDraft] = useState<string | null>(null);
  const nextId = useRef(2);
  const addressRef = useRef<HTMLInputElement>(null);
  // Click-to-focus should select the whole address; the mouseup that follows
  // the focus would otherwise collapse the selection.
  const justFocused = useRef(false);

  const active = tabs.find((t) => t.id === activeId) || tabs[0];
  const current = active.history[active.index];

  const pushInto = (list: Tab[], tabId: number, location: Location) =>
    updateTab(list, tabId, (t) => {
      const history = [...t.history.slice(0, t.index + 1), location];
      return { ...t, history, index: history.length - 1 };
    });

  // The window route changed from outside (deep link, Back/Forward, launcher):
  // follow it in the active tab.
  if (route !== synced) {
    setSynced(route);
    const target = resolve(fromRoute(route));
    if (!sameLocation(target, current)) setTabs(pushInto(tabs, active.id, target));
  }

  const syncRoute = (location: Location) => {
    const r = toRoute(location);
    if (r === null) return;
    setSynced(r);
    setRoute(r);
  };

  const navigate = (location: Location) => {
    const target = resolve(location);
    setDraft(null);
    if (sameLocation(target, current)) {
      reload();
      return;
    }
    setTabs(pushInto(tabs, active.id, target));
    syncRoute(target);
  };

  const go: Go = (address) => navigate(normalize(address));

  const step = (delta: number) => {
    const index = active.index + delta;
    if (index < 0 || index >= active.history.length) return;
    setTabs(updateTab(tabs, active.id, (t) => ({ ...t, index })));
    syncRoute(active.history[index]);
  };

  const reload = () => setTabs(updateTab(tabs, active.id, (t) => ({ ...t, reload: t.reload + 1 })));

  const switchTab = (tab: Tab) => {
    setActiveId(tab.id);
    setDraft(null);
    syncRoute(tab.history[tab.index]);
  };

  const newTab = () => {
    const tab: Tab = { id: nextId.current++, history: [HOME], index: 0, reload: 0 };
    setTabs([...tabs, tab]);
    switchTab(tab);
    window.requestAnimationFrame(() => addressRef.current?.focus());
  };

  const closeTab = (id: number) => {
    if (tabs.length === 1) return;
    const i = tabs.findIndex((t) => t.id === id);
    const rest = tabs.filter((t) => t.id !== id);
    setTabs(rest);
    if (id === activeId) switchTab(rest[Math.min(i, rest.length - 1)]);
  };

  let address = displayUrl(current);
  if (draft !== null) address = draft;
  const canBack = active.index > 0;
  const canForward = active.index < active.history.length - 1;
  const pageKey = `${active.id}-${active.index}-${active.reload}`;

  return (
    <div className="app browser">
      <div className="bChrome">
        <div className="bTabs" role="group" aria-label="Browser tabs">
          {tabs.map((t) => {
            const loc = t.history[t.index];
            const title = titleFor(loc);
            const selected = t.id === active.id;
            return (
              <div key={t.id} className={cx("bTab", selected && "isActive")}>
                <button
                  type="button"
                  aria-current={(selected && "true") || undefined}
                  className="bTabMain"
                  onClick={() => switchTab(t)}
                  onAuxClick={(e) => e.button === 1 && closeTab(t.id)}
                  title={title}
                >
                  <AppIcon app={iconFor(loc)} size={15} />
                  <span className="bTabTitle">{title}</span>
                </button>
                {tabs.length > 1 && (
                  <button type="button" className="bTabClose" aria-label={`Close ${title} tab`} onClick={() => closeTab(t.id)}>
                    <XIcon width={12} height={12} />
                  </button>
                )}
              </div>
            );
          })}
          <button type="button" className="iconBtn bNewTab" aria-label="New tab" title="New tab" onClick={newTab}>
            <PlusIcon width={15} height={15} />
          </button>
        </div>

        <div className="bToolbar">
          <div className="toolbarGroup">
            <button type="button" className="iconBtn" aria-label="Back" title="Back" disabled={!canBack} onClick={() => step(-1)}>
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="iconBtn"
              aria-label="Forward"
              title="Forward"
              disabled={!canForward}
              onClick={() => step(1)}
            >
              <ChevronRightIcon />
            </button>
            <button type="button" className="iconBtn" aria-label="Reload" title="Reload" onClick={reload}>
              <RefreshIcon />
            </button>
            <button type="button" className="iconBtn bHomeBtn" aria-label="Start page" title="Start page" onClick={() => navigate(HOME)}>
              <HomeIcon />
            </button>
          </div>
          <form
            className="bAddress"
            onSubmit={(e) => {
              e.preventDefault();
              go(address);
              addressRef.current?.blur();
            }}
          >
            <span className={cx("bAddressIcon", current.kind === "external" && "isExternal")} aria-hidden="true">
              <LockIcon width={13} height={13} />
            </span>
            <input
              ref={addressRef}
              className="bAddressInput"
              value={address}
              aria-label="Address"
              spellCheck={false}
              autoComplete="off"
              onFocus={(e) => {
                setDraft(displayUrl(current));
                e.currentTarget.select();
                justFocused.current = true;
              }}
              onMouseUp={(e) => {
                if (justFocused.current) e.preventDefault();
                justFocused.current = false;
              }}
              onBlur={() => setDraft(null)}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDraft(null);
                  e.currentTarget.blur();
                }
              }}
            />
          </form>
        </div>
      </div>

      <div className="appScroll bViewport" key={pageKey}>
        <div className="bProgress" aria-hidden="true" />
        <Page location={current} go={go} back={() => step(-1)} canGoBack={canBack} />
      </div>
    </div>
  );
}
