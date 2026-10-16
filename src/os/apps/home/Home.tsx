import { allProjects, experience, featuredProjects, isFilled, metrics, profile, projectCategories } from "../../../data/content";
import portrait from "../../../images/profile-256.jpg";
import { classicHref } from "../../lib/platform";
import { plural } from "../../lib/util";
import { useOS } from "../../state/os";
import AppIcon, { type IconKind } from "../../ui/AppIcon";
import { ChevronRightIcon, CopyIcon, DownloadIcon, LayoutIcon, XIcon } from "../../ui/Glyphs";
import { ProjectCover } from "../project/ProjectDetails";
import type { AppId } from "../meta";
import "./home.css";

type Destination = { title: string; detail: string; icon: IconKind; appId: AppId; route?: string };

const role = experience[0];
const caseCount = role.cases.length;

const destinations: Destination[] = [
  {
    title: "Projects",
    detail: `${plural(allProjects.length, "project")}: ${projectCategories.map((c) => c.label).join(", ")}`,
    icon: "folder",
    appId: "finder",
    route: "projects",
  },
  {
    title: "Experience",
    detail: `${role.title} at ${role.company}, with ${plural(caseCount, "case study", "case studies")}`,
    icon: "experience",
    appId: "experience",
  },
  { title: "Résumé", detail: "View, print, or download the PDF", icon: "resume", appId: "resume" },
  { title: "Contact", detail: "Email, LinkedIn, and GitHub", icon: "contact", appId: "contact" },
];

// Projects with real write-ups; placeholders are never shown in MoOS.
const highlights = featuredProjects.filter((p) => isFilled(p.tagline)).slice(0, 3);

// The landing window: who this is, where to look, and how MoOS works, in
// plain language for visitors who have never used a desktop-style site.
export default function Home() {
  const os = useOS();

  return (
    <div className="app home">
      <div className="appScroll">
        <div className="page homePage">
          <header className="homeHero">
            <img className="homeAvatar" src={portrait} alt={`Portrait of ${profile.name}`} width={88} height={88} />
            <div className="homeIdentity">
              <p className="eyebrow">Start here</p>
              <h1 className="pageTitle">{profile.name}</h1>
              <p className="homeRole">{profile.role}</p>
            </div>
          </header>
          <p className="pageLead homeLead">{profile.headline}</p>
          <div className="homeActions">
            <button type="button" className="btn btnPrimary btnLarge" onClick={() => os.run({ type: "downloadResume" })}>
              <DownloadIcon width={16} height={16} /> Download résumé
            </button>
            <button type="button" className="btn btnLarge" onClick={() => os.run({ type: "copyEmail" })}>
              <CopyIcon width={16} height={16} /> Copy email
            </button>
          </div>

          <section className="pageSection" aria-labelledby="home-go">
            <h2 className="sectionTitle" id="home-go">
              Where would you like to go?
            </h2>
            <ul className="homeDestinations">
              {destinations.map((d) => (
                <li key={d.title}>
                  <button type="button" className="homeCard" onClick={() => os.openApp(d.appId, d.route || "")}>
                    <AppIcon app={d.icon} size={46} />
                    <span className="homeCardText">
                      <span className="homeCardTitle">{d.title}</span>
                      <span className="homeCardDetail">{d.detail}</span>
                    </span>
                    <ChevronRightIcon width={18} height={18} className="homeCardArrow" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="pageSection" aria-labelledby="home-impact">
            <h2 className="sectionTitle" id="home-impact">
              Impact at a glance
            </h2>
            <ul className="metricGrid">
              {metrics.map((m) => (
                <li key={m.label} className="metricCard">
                  <p className="metricValue">{m.value}</p>
                  <p className="metricLabel">{m.label}</p>
                  <p className="metricDetail">{m.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          {highlights.length > 0 && (
            <section className="pageSection" aria-labelledby="home-featured">
              <h2 className="sectionTitle" id="home-featured">
                Featured projects
              </h2>
              <ul className="homeFeatured">
                {highlights.map((p) => (
                  <li key={p.slug}>
                    <button type="button" className="homeProject" onClick={() => os.openApp("project", p.slug)}>
                      <ProjectCover project={p} size="small" />
                      <span className="homeProjectName">{p.name}</span>
                      <span className="homeProjectTagline">{p.tagline}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn homeAll" onClick={() => os.openApp("finder", "projects")}>
                See all {plural(allProjects.length, "project")}
                <ChevronRightIcon width={14} height={14} />
              </button>
            </section>
          )}

          <section className="pageSection" aria-labelledby="home-help">
            <h2 className="sectionTitle" id="home-help">
              Getting around
            </h2>
            <ul className="homeTips">
              <li>
                <AppIcon app="home" size={30} />
                <span>
                  <strong>Everything is in the dock</strong> at the bottom of the screen. Click any icon to open it.
                </span>
              </li>
              <li>
                <span className="homeTipGlyph" aria-hidden="true">
                  <XIcon width={16} height={16} />
                </span>
                <span>
                  <strong>Close a window</strong> with the × in its top-right corner to go back to where you were.
                  Home is always in the dock.
                </span>
              </li>
              <li>
                <span className="homeTipGlyph" aria-hidden="true">
                  <LayoutIcon width={16} height={16} />
                </span>
                <span>
                  <strong>Prefer a regular website?</strong> <a href={classicHref}>Switch to the simple view</a>, the same
                  portfolio as one scrolling page.
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
