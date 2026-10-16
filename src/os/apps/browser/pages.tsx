import { useState, type ReactNode } from "react";
import { about, allProjects, isFilled, profile, projectCategories, skills, type Project } from "../../../data/content";
import { useOS } from "../../state/os";
import AppIcon from "../../ui/AppIcon";
import { ArrowUpRightIcon, DownloadIcon, GitHubIcon, LinkedInIcon, SearchIcon } from "../../ui/Glyphs";
import ProjectDetails, { ProjectCover } from "../project/ProjectDetails";
import { hostOf, normalize, searchContent, toRoute } from "./url";

export type Go = (address: string) => void;

// In-page link: navigates inside the Browser. Modifier-clicks keep their
// native behavior, so internal pages can open in a real tab via deep link.
export function Link({ to, go, className, children }: { to: string; go: Go; className?: string; children: ReactNode }) {
  const location = normalize(to);
  let href = to;
  if (location.kind !== "external") href = `#/browser/${toRoute(location) || ""}`;
  return (
    <a
      className={className}
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        go(to);
      }}
    >
      {children}
    </a>
  );
}

function SearchBox({ go, autoFocus }: { go: Go; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  return (
    <form
      className="bSearch"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) go(q);
      }}
    >
      <SearchIcon width={17} height={17} />
      <input
        className="bSearchInput"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search projects and skills, or enter an address"
        aria-label="Search or enter address"
        autoFocus={autoFocus}
      />
    </form>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function ProjectTile({ project, go }: { project: Project; go: Go }) {
  return (
    <Link to={`moos://projects/${project.slug}`} go={go} className="bTile">
      <ProjectCover project={project} size="small" />
      <span className="srOnly">{project.name}</span>
      <span className="bTileMeta">{project.stack.join(" · ")}</span>
    </Link>
  );
}

export function HomePage({ go }: { go: Go }) {
  const projectLinks = allProjects.flatMap((p) => {
    const links: { label: string; url: string }[] = [];
    if (p.github) links.push({ label: `${p.name}: source`, url: p.github });
    if (p.demo) links.push({ label: `${p.name}: live demo`, url: p.demo });
    return links;
  });

  return (
    <div className="bPage bHome">
      <header className="bHero">
        <p className="eyebrow">{greeting()}</p>
        <h1 className="bHeroTitle">{profile.name}</h1>
        <p className="bHeroRole">{profile.role}</p>
        <SearchBox go={go} />
      </header>

      <section className="pageSection">
        <h2 className="sectionTitle">Projects</h2>
        <div className="bTiles">
          {allProjects.map((p) => (
            <ProjectTile key={p.slug} project={p} go={go} />
          ))}
        </div>
      </section>

      <section className="pageSection">
        <h2 className="sectionTitle">Curated links</h2>
        <ul className="bLinks">
          <li>
            <Link to={profile.github} go={go} className="bLink">
              <GitHubIcon width={18} height={18} />
              <span>
                <span className="bLinkTitle">GitHub</span>
                <span className="bLinkUrl">{hostOf(profile.github)}</span>
              </span>
            </Link>
          </li>
          <li>
            <Link to={profile.linkedin} go={go} className="bLink">
              <LinkedInIcon width={18} height={18} />
              <span>
                <span className="bLinkTitle">LinkedIn</span>
                <span className="bLinkUrl">{hostOf(profile.linkedin)}</span>
              </span>
            </Link>
          </li>
          <li>
            <Link to="moos://resume" go={go} className="bLink">
              <AppIcon app="resume" size={20} />
              <span>
                <span className="bLinkTitle">Résumé (PDF)</span>
                <span className="bLinkUrl">moos://resume</span>
              </span>
            </Link>
          </li>
          {projectLinks.map((l) => (
            <li key={l.url}>
              <Link to={l.url} go={go} className="bLink">
                <ArrowUpRightIcon width={18} height={18} />
                <span>
                  <span className="bLinkTitle">{l.label}</span>
                  <span className="bLinkUrl">{hostOf(l.url)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ProjectsPage({ go }: { go: Go }) {
  return (
    <div className="bPage">
      <header className="pageHeader">
        <p className="eyebrow">moos://projects</p>
        <h1 className="pageTitle">Projects</h1>
        <p className="pageLead">Selected work, from internal tools used in live operations to products in progress.</p>
      </header>
      {projectCategories.map((c) => {
        const list = allProjects.filter((p) => p.category === c.id);
        if (list.length === 0) return null;
        return (
          <section key={c.id} className="pageSection">
            <h2 className="sectionTitle">{c.label}</h2>
            <div className="bCards">
              {list.map((p) => (
                <Link key={p.slug} to={`moos://projects/${p.slug}`} go={go} className="bCard">
                  <ProjectCover project={p} size="small" />
                  <span className="bCardBody">
                    <span className="srOnly">{p.name}</span>
                    {isFilled(p.tagline) && <span className="bCardText">{p.tagline}</span>}
                    <span className="bTileMeta">{p.stack.join(" · ")}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function ProjectPage({ slug, go }: { slug: string; go: Go }) {
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) return <NotFoundPage path={`projects/${slug}`} go={go} />;
  return (
    <div className="bPage">
      <nav className="bCrumbs" aria-label="Breadcrumb">
        <Link to="moos://projects" go={go}>
          Projects
        </Link>
        <span aria-hidden="true">/</span>
        <span>{project.name}</span>
      </nav>
      <ProjectDetails project={project} />
    </div>
  );
}

export function AboutPage({ go }: { go: Go }) {
  const { openApp } = useOS();
  return (
    <div className="bPage">
      <header className="pageHeader">
        <p className="eyebrow">moos://about</p>
        <h1 className="pageTitle">{profile.name}</h1>
        <p className="pageLead">{profile.intro}</p>
      </header>
      {about.paragraphs.map((p) => (
        <p key={p.slice(0, 24)} className="bProse">
          {p}
        </p>
      ))}
      <section className="pageSection">
        <h2 className="sectionTitle">Focus</h2>
        <div className="cardGrid">
          {about.focus.map((f) => (
            <div key={f.title} className="card">
              <h3 className="bCardTitle">{f.title}</h3>
              <p className="muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="pageSection">
        <h2 className="sectionTitle">Skills</h2>
        <ul className="tagList">
          {skills.flatMap((g) => g.items).map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </section>
      <div className="linkRow bActions">
        <button type="button" className="btn btnPrimary" onClick={() => openApp("about")}>
          Open About Me
        </button>
        <Link to="moos://projects" go={go} className="btn">
          See projects
        </Link>
      </div>
    </div>
  );
}

export function ResumePage() {
  const { openApp } = useOS();
  return (
    <div className="bPage bCenter">
      <AppIcon app="resume" size={64} />
      <h1 className="pageTitle">Résumé</h1>
      <p className="pageLead">{profile.name}'s résumé is a PDF. View it in the Résumé app or download a copy.</p>
      <div className="linkRow">
        <button type="button" className="btn btnPrimary" onClick={() => openApp("resume")}>
          Open résumé
        </button>
        <a className="btn" href={profile.resume} download>
          <DownloadIcon width={15} height={15} /> Download PDF
        </a>
      </div>
    </div>
  );
}

export function ExternalPage({ url, onBack, canGoBack }: { url: string; onBack: () => void; canGoBack: boolean }) {
  return (
    <div className="bPage bCenter">
      <div className="bExternal card">
        <span className="bExternalHost">{hostOf(url)}</span>
        <p className="bExternalUrl">{url}</p>
        <p className="muted">
          This is an external site. Most sites don't allow being embedded inside other pages, so MoOS opens them in a
          real browser tab instead.
        </p>
        <div className="linkRow">
          <a className="btn btnPrimary" href={url} target="_blank" rel="noopener noreferrer">
            <ArrowUpRightIcon width={15} height={15} /> Open in new tab
          </a>
          {canGoBack && (
            <button type="button" className="btn" onClick={onBack}>
              Go back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchPage({ query, go }: { query: string; go: Go }) {
  const { projects, skills: skillHits, pages } = searchContent(query);
  const empty = projects.length === 0 && skillHits.length === 0 && pages.length === 0;
  return (
    <div className="bPage">
      <header className="pageHeader">
        <p className="eyebrow">Search</p>
        <h1 className="pageTitle">“{query}”</h1>
      </header>
      {empty && (
        <div className="emptyState">
          <p>No matches in this portfolio.</p>
          <p className="faint">Try a technology like “C#”, or a project name.</p>
          <Link to="moos://projects" go={go} className="btn">
            Browse all projects
          </Link>
        </div>
      )}
      {pages.length > 0 && (
        <section className="pageSection">
          <h2 className="sectionTitle">Pages</h2>
          <ul className="bResults">
            {pages.map((p) => (
              <li key={p.path}>
                <Link to={`moos://${p.path}`} go={go} className="bResult">
                  <span className="bResultTitle">{p.title}</span>
                  <span className="bLinkUrl">moos://{p.path}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {projects.length > 0 && (
        <section className="pageSection">
          <h2 className="sectionTitle">Projects</h2>
          <ul className="bResults">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link to={`moos://projects/${p.slug}`} go={go} className="bResult">
                  <span className="bResultTitle">{p.name}</span>
                  <span className="bLinkUrl">moos://projects/{p.slug}</span>
                  <span className="muted">{p.stack.join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {skillHits.length > 0 && (
        <section className="pageSection">
          <h2 className="sectionTitle">Skills</h2>
          <ul className="tagList">
            {skillHits.map((s) => (
              <li key={s.skill} className="chip" title={s.group}>
                {s.skill} <span className="faint">· {s.group}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function NotFoundPage({ path, go }: { path: string; go: Go }) {
  return (
    <div className="bPage bCenter">
      <p className="bCode">404</p>
      <h1 className="pageTitle">Page not found</h1>
      <p className="pageLead">There's nothing at moos://{path}. It may have moved into the fog.</p>
      <div className="linkRow">
        <Link to="moos://home" go={go} className="btn btnPrimary">
          Start page
        </Link>
        <Link to="moos://projects" go={go} className="btn">
          Projects
        </Link>
      </div>
    </div>
  );
}
