import { useCallback } from "react";
import { profile } from "../../data/content";
import portrait from "../../images/profile-256.jpg";
import { titleOf } from "../apps/registry";
import type { AppId } from "../apps/meta";
import { useNow } from "../lib/hooks";
import { cx } from "../lib/util";
import Launcher from "../shell/Launcher";
import ContextMenu from "../shell/Menu";
import { Toasts } from "../shell/Notifications";
import { AppHost } from "../shell/Window";
import { useOS } from "../state/os";
import type { WindowState } from "../state/windows";
import AppIcon, { type IconKind } from "../ui/AppIcon";
import { ChevronLeftIcon, MoonIcon, SearchIcon, SunIcon, XIcon } from "../ui/Glyphs";

type Tile = { label: string; icon: IconKind; appId: AppId; route?: string };

const grid: Tile[] = [
  { label: "Projects", icon: "folder", appId: "finder", route: "projects" },
  { label: "Experience", icon: "experience", appId: "experience" },
  { label: "About Me", icon: "about", appId: "about" },
  { label: "Résumé", icon: "resume", appId: "resume" },
  { label: "Contact", icon: "contact", appId: "contact" },
  { label: "Files", icon: "finder", appId: "finder" },
  { label: "Terminal", icon: "terminal", appId: "terminal" },
  { label: "Code", icon: "editor", appId: "editor" },
  { label: "Browser", icon: "browser", appId: "browser" },
  { label: "Settings", icon: "settings", appId: "settings" },
];

const dock: Tile[] = [
  { label: "Projects", icon: "folder", appId: "finder", route: "projects" },
  { label: "Experience", icon: "experience", appId: "experience" },
  { label: "Résumé", icon: "resume", appId: "resume" },
  { label: "Contact", icon: "contact", appId: "contact" },
];

function MobileScreen({ win, visible }: { win: WindowState; visible: boolean }) {
  const { showDesktop, closeWindow, setWindowRoute } = useOS();
  const appId = win.appId as AppId;
  const setRoute = useCallback(
    (route: string) => setWindowRoute(win.id, route, titleOf(appId, route)),
    [setWindowRoute, win.id, appId],
  );

  return (
    <section
      className={cx("mScreen", visible && "isVisible", win.closing && "isClosing")}
      aria-label={win.title}
      aria-hidden={!visible || undefined}
      hidden={!visible && !win.closing}
    >
      <header className="mScreenBar">
        <button type="button" className="mBarBtn" onClick={showDesktop} aria-label="Back to home screen">
          <ChevronLeftIcon width={20} height={20} />
          <span>Home</span>
        </button>
        <h1 className="mScreenTitle">{win.title}</h1>
        <button type="button" className="mBarBtn mBarClose" onClick={() => closeWindow(win.id)} aria-label={`Close ${win.title}`}>
          <XIcon width={18} height={18} />
        </button>
      </header>
      <div className="mScreenBody">
        <AppHost appId={appId} route={win.route} windowId={win.id} active={visible} setRoute={setRoute} />
      </div>
    </section>
  );
}

export default function MobileShell() {
  const os = useOS();
  const { wm, theme } = os;
  const now = useNow();
  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const windows = wm.order.map((id) => wm.windows[id]);
  const running = windows.filter((w) => !w.closing);
  const onHome = !wm.focused;

  const launch = (t: Tile) => os.openApp(t.appId, t.route || "");

  let ThemeGlyph = SunIcon;
  let nextTheme: "light" | "dark" = "light";
  if (theme === "light") {
    ThemeGlyph = MoonIcon;
    nextTheme = "dark";
  }

  return (
    <div className="mobileShell">
      <header className={cx("mStatus", !onHome && "onApp")}>
        <span className="mTime">{time}</span>
        <span className="mStatusRight">
          <button
            type="button"
            className="mStatusBtn"
            onClick={() => os.updateSettings({ theme: nextTheme })}
            aria-label={`Switch to ${nextTheme} appearance`}
          >
            <ThemeGlyph width={16} height={16} />
          </button>
          <button type="button" className="mStatusBtn" onClick={() => os.setLauncherOpen(true)} aria-label="Search">
            <SearchIcon width={16} height={16} />
          </button>
        </span>
      </header>

      <main className="mHome" aria-hidden={!onHome || undefined} inert={!onHome}>
        <p className="mDate">{date}</p>

        <section className="mWidget glass" aria-labelledby="m-name">
          <div className="mWidgetId">
            <img className="mAvatar" src={portrait} alt="" width={52} height={52} />
            <div>
              <h1 id="m-name" className="mName">
                {profile.name}
              </h1>
              <p className="mRole">{profile.role}</p>
            </div>
          </div>
          <p className="mHeadline">{profile.headline}</p>
          <p className="statusPill">
            <span className="statusDot" aria-hidden="true" />
            {profile.status}
          </p>
          <div className="mWidgetActions">
            <button type="button" className="btn btnPrimary" onClick={() => os.openApp("resume")}>
              Résumé
            </button>
            <button type="button" className="btn" onClick={() => os.openApp("contact")}>
              Contact
            </button>
            <button type="button" className="btn" onClick={() => os.openApp("finder", "projects")}>
              Projects
            </button>
          </div>
        </section>

        {running.length > 0 && (
          <section className="mRecents" aria-label="Open apps">
            <p className="mSectionLabel">Open</p>
            <ul className="mRecentList">
              {running.map((w) => (
                <li key={w.id}>
                  <button type="button" className="mRecent glass" onClick={() => os.focusWindow(w.id)}>
                    <AppIcon app={w.appId as AppId} size={24} />
                    <span>{w.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ul className="mGrid" aria-label="Apps">
          {grid.map((t) => (
            <li key={t.label}>
              <button type="button" className="mApp" onClick={() => launch(t)}>
                <AppIcon app={t.icon} size={60} className="mAppIcon" />
                <span className="mAppLabel">{t.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <nav className="mDock glass" aria-label="Dock">
          {dock.map((t) => (
            <button key={t.label} type="button" className="mDockItem" onClick={() => launch(t)} aria-label={t.label}>
              <AppIcon app={t.icon} size={54} />
            </button>
          ))}
        </nav>
      </main>

      {windows.map((w) => (
        <MobileScreen key={w.id} win={w} visible={wm.focused === w.id} />
      ))}

      <Toasts hidden={false} />
      <Launcher />
      <ContextMenu />
    </div>
  );
}
