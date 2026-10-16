import { useRef, useState, type ReactNode } from "react";
import { profile } from "../../../data/content";
import { classicHref } from "../../lib/platform";
import { cx } from "../../lib/util";
import { useOS } from "../../state/os";
import { accents, DEFAULT_WALLPAPER, type Settings as Prefs } from "../../state/settings";
import AppIcon from "../../ui/AppIcon";
import { hasDefaultPhoto, wallpapers } from "../../wallpapers";
import type { AppProps } from "../registry";
import "./settings.css";

type PaneId = "appearance" | "wallpaper" | "dock" | "motion" | "about";

const panes: { id: PaneId; label: string; short: string }[] = [
  { id: "appearance", label: "Appearance", short: "Appearance" },
  { id: "wallpaper", label: "Wallpaper", short: "Wallpaper" },
  { id: "dock", label: "Dock", short: "Dock" },
  { id: "motion", label: "Motion & Accessibility", short: "Motion" },
  { id: "about", label: "About MoOS", short: "About" },
];

function paneFrom(route: string): PaneId {
  const found = panes.find((p) => p.id === route);
  if (found) return found.id;
  return "appearance";
}

// ---------------------------------------------------------------------------
// Accessible controls
// ---------------------------------------------------------------------------

type Option<T extends string> = { value: T; label: string; render?: ReactNode; hint?: string };

// Radio group with roving focus: Tab enters once, arrow keys move and select.
function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  variant = "segmented",
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  variant?: "segmented" | "cards" | "swatches" | "thumbs";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % options.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + options.length) % options.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = options.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(options[next].value);
    ref.current?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  };
  return (
    <div ref={ref} className={cx("radioGroup", `rg-${variant}`)} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((o) => {
        const checked = o.value === value;
        let tabIndex = -1;
        if (checked) tabIndex = 0;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={tabIndex}
            className={cx("radioOption", checked && "isChecked")}
            onClick={() => onChange(o.value)}
            title={o.hint}
          >
            {o.render}
            <span className="radioLabel">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cx("switch", checked && "isOn")}
      onClick={() => onChange(!checked)}
    >
      <span className="switchThumb" />
    </button>
  );
}

function Row({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="setRow">
      <div className="setRowText">
        <h3 className="setRowTitle">{title}</h3>
        {description && <p className="setRowDesc">{description}</p>}
      </div>
      <div className="setRowControl">{children}</div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="setGroup">
      <h2 className="setGroupTitle">{title}</h2>
      <div className="setGroupBody">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Panes
// ---------------------------------------------------------------------------

function ThemePreview({ kind }: { kind: "dark" | "light" | "system" }) {
  return (
    <span className={cx("themePreview", `tp-${kind}`)} aria-hidden="true">
      <span className="tpBar" />
      <span className="tpWindow">
        <span className="tpTitle" />
        <span className="tpLine w70" />
        <span className="tpLine w50" />
      </span>
      <span className="tpDock" />
    </span>
  );
}

function AppearancePane() {
  const { settings, updateSettings, theme } = useOS();
  return (
    <>
      <Group title="Theme">
        <RadioGroup<Prefs["theme"]>
          label="Theme"
          variant="cards"
          value={settings.theme}
          onChange={(v) => updateSettings({ theme: v })}
          options={[
            { value: "dark", label: "Dark", render: <ThemePreview kind="dark" /> },
            { value: "light", label: "Light", render: <ThemePreview kind="light" /> },
            { value: "system", label: "System", render: <ThemePreview kind="system" /> },
          ]}
        />
        {settings.theme === "system" && <p className="setNote">Following your device: currently {theme}.</p>}
      </Group>

      <Group title="Accent color">
        <RadioGroup<Prefs["accent"]>
          label="Accent color"
          variant="swatches"
          value={settings.accent}
          onChange={(v) => updateSettings({ accent: v })}
          options={accents.map((a) => {
            let color = a.dark;
            if (theme === "light") color = a.light;
            return { value: a.id, label: a.label, render: <span className="swatch" style={{ background: color }} /> };
          })}
        />
      </Group>

      <Group title="Transparency">
        <Row title="Window and menu transparency" description="Solid surfaces maximize contrast and readability.">
          <RadioGroup<Prefs["transparency"]>
            label="Transparency"
            value={settings.transparency}
            onChange={(v) => updateSettings({ transparency: v })}
            options={[
              { value: "glass", label: "Glass" },
              { value: "subtle", label: "Subtle" },
              { value: "solid", label: "Solid" },
            ]}
          />
        </Row>
      </Group>
    </>
  );
}

function WallpaperPane() {
  const { settings, updateSettings } = useOS();
  return (
    <Group title="Desktop wallpaper">
      <div className="wpHeader">
        <p className="setRowDesc">Pick a backdrop for the desktop. Changes apply instantly.</p>
        {settings.wallpaper !== DEFAULT_WALLPAPER && (
          <button type="button" className="btn" onClick={() => updateSettings({ wallpaper: DEFAULT_WALLPAPER })}>
            Restore default
          </button>
        )}
      </div>
      <RadioGroup<string>
        label="Wallpaper"
        variant="thumbs"
        value={settings.wallpaper}
        onChange={(v) => updateSettings({ wallpaper: v })}
        options={wallpapers.map((w) => {
          let label = w.label;
          if (w.id === DEFAULT_WALLPAPER) label = `${w.label} (default)`;
          return {
            value: w.id,
            label,
            render: <img className="wpThumb" src={w.src} alt="" loading="lazy" decoding="async" />,
          };
        })}
      />
      {!hasDefaultPhoto && (
        <p className="setNote">
          “Misty Forest” is a generated stand-in. To use the original photograph, add it as{" "}
          <code>src/assets/wallpapers/misty-forest.jpg</code> and rebuild.
        </p>
      )}
    </Group>
  );
}

function DockPane() {
  const { settings, updateSettings } = useOS();
  return (
    <Group title="Dock">
      <Row title="Icon size">
        <RadioGroup<Prefs["dockSize"]>
          label="Dock icon size"
          value={settings.dockSize}
          onChange={(v) => updateSettings({ dockSize: v })}
          options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]}
        />
      </Row>
      <Row title="Magnification" description="Enlarge icons as the pointer moves across the dock.">
        <Switch checked={settings.dockMagnify} onChange={(v) => updateSettings({ dockMagnify: v })} label="Dock magnification" />
      </Row>
    </Group>
  );
}

function MotionPane() {
  const { settings, updateSettings, motion } = useOS();
  let resolved = "full animations";
  if (motion === "reduced") resolved = "reduced motion";
  return (
    <>
      <Group title="Animation">
        <Row
          title="Interface motion"
          description={
            <>
              System follows your device's reduce-motion setting. Right now MoOS is using <strong>{resolved}</strong>.
            </>
          }
        >
          <RadioGroup<Prefs["motion"]>
            label="Interface motion"
            value={settings.motion}
            onChange={(v) => updateSettings({ motion: v })}
            options={[
              { value: "system", label: "System" },
              { value: "full", label: "Full" },
              { value: "reduced", label: "Reduced" },
            ]}
          />
        </Row>
      </Group>
      <Group title="Desktop">
        <Row title="Welcome widget" description="Show the introduction card with quick links on the desktop.">
          <Switch checked={settings.showWelcome} onChange={(v) => updateSettings({ showWelcome: v })} label="Show welcome widget" />
        </Row>
      </Group>
    </>
  );
}

function AboutPane() {
  const { resetSettings } = useOS();
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <div className="aboutMoos">
        <AppIcon app="settings" size={64} />
        <div>
          <h2 className="aboutMoosTitle">MoOS 1.0</h2>
          <p className="muted">
            A portfolio operating system by {profile.name}, {profile.role}.
          </p>
          <p className="faint">Built with React, TypeScript, and Vite.</p>
        </div>
      </div>

      <Group title="Privacy">
        <p className="setRowDesc setPad">
          Preferences are stored only in this browser (localStorage). There's no account, and nothing is sent anywhere.
        </p>
      </Group>

      <Group title="Classic view">
        <Row title="Prefer a simple page?" description="The single-page version of this portfolio has the same content.">
          <a className="btn" href={classicHref}>
            Open classic view
          </a>
        </Row>
      </Group>

      <Group title="Reset">
        <Row title="Reset all settings" description="Restore the default theme, wallpaper, dock, and motion settings.">
          {!confirming && (
            <button type="button" className="btn" onClick={() => setConfirming(true)}>
              Reset…
            </button>
          )}
          {confirming && (
            <div className="confirmRow" role="group" aria-label="Confirm reset">
              <button type="button" className="btn btnGhost" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btnDanger"
                autoFocus
                onClick={() => {
                  setConfirming(false);
                  resetSettings();
                }}
              >
                Reset settings
              </button>
            </div>
          )}
        </Row>
      </Group>
    </>
  );
}

const paneComponents: Record<PaneId, () => ReactNode> = {
  appearance: AppearancePane,
  wallpaper: WallpaperPane,
  dock: DockPane,
  motion: MotionPane,
  about: AboutPane,
};

export default function Settings({ route, setRoute }: AppProps) {
  const pane = paneFrom(route);
  const Pane = paneComponents[pane];
  const current = panes.find((p) => p.id === pane)!;

  return (
    <div className="app settingsApp">
      <div className="appRow">
        <nav className="appSidebar" aria-label="Settings sections">
          {panes.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cx("sideItem", p.id === pane && "isActive")}
              aria-current={p.id === pane || undefined}
              onClick={() => setRoute(p.id)}
            >
              {p.label}
            </button>
          ))}
        </nav>
        <div className="appScroll">
          <div className="setTabs" role="tablist" aria-label="Settings sections">
            {panes.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={p.id === pane}
                className={cx("setTab", p.id === pane && "isActive")}
                onClick={() => setRoute(p.id)}
              >
                {p.short}
              </button>
            ))}
          </div>
          <div className="setPage">
            <h1 className="setTitle">{current.label}</h1>
            <Pane key={pane} />
          </div>
        </div>
      </div>
    </div>
  );
}
