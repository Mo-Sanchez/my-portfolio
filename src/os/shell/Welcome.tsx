import { profile } from "../../data/content";
import portrait from "../../images/profile-256.jpg";
import { modKey } from "../lib/platform";
import { useOS } from "../state/os";
import AppIcon from "../ui/AppIcon";
import { XIcon } from "../ui/Glyphs";

// A small, dismissible introduction so visitors know whose computer this is
// and can reach the most important content in one click.
export default function Welcome() {
  const os = useOS();
  if (!os.settings.showWelcome) return null;

  const quick = [
    { label: "Projects", icon: "folder" as const, run: () => os.openApp("finder", "projects") },
    { label: "Experience", icon: "experience" as const, run: () => os.openApp("experience") },
    { label: "Résumé", icon: "resume" as const, run: () => os.openApp("resume") },
    { label: "Contact", icon: "contact" as const, run: () => os.openApp("contact") },
  ];

  return (
    <aside className="welcome glass" aria-labelledby="welcome-title">
      <button
        type="button"
        className="iconBtn welcomeClose"
        aria-label="Dismiss welcome"
        title="Dismiss"
        onClick={() => os.updateSettings({ showWelcome: false })}
      >
        <XIcon />
      </button>
      <p className="eyebrow">Welcome to MoOS</p>
      <div className="welcomeId">
        <img className="welcomeAvatar" src={portrait} alt="" width={56} height={56} />
        <div>
          <h1 id="welcome-title" className="welcomeName">
            {profile.name}
          </h1>
          <p className="welcomeRole">{profile.role}</p>
        </div>
      </div>
      <p className="welcomeLead">{profile.headline}</p>
      <p className="statusPill">
        <span className="statusDot" aria-hidden="true" />
        {profile.status}
      </p>
      <div className="welcomeActions">
        {quick.map((q) => (
          <button key={q.label} type="button" className="welcomeAction" onClick={q.run}>
            <AppIcon app={q.icon} size={30} />
            <span>{q.label}</span>
          </button>
        ))}
      </div>
      <p className="welcomeHint">
        <kbd className="kbd">{modKey}</kbd> <kbd className="kbd">K</kbd> searches everything · double-click icons to open
      </p>
    </aside>
  );
}
