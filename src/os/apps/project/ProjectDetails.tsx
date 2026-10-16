import { allProjects, isFilled, projectCategories, type Project } from "../../../data/content";
import { cx } from "../../lib/util";
import { useOS } from "../../state/os";
import AppIcon from "../../ui/AppIcon";
import { ArrowUpRightIcon, GitHubIcon, LockIcon } from "../../ui/Glyphs";
import "./project.css";

function categoryOf(project: Project) {
  return projectCategories.find((c) => c.id === project.category);
}

// A designed cover for projects without screenshots. It's clearly a cover,
// not a fabricated screenshot: name, category, and real stack only.
export function ProjectCover({ project, size = "large" }: { project: Project; size?: "large" | "small" }) {
  if (project.image) {
    return (
      <img
        className={cx("projectCover", size === "small" && "isSmall")}
        src={project.image}
        alt={`Screenshot of ${project.name}`}
        loading="lazy"
        decoding="async"
      />
    );
  }
  const category = categoryOf(project);
  return (
    <div className={cx("projectCover", `cover-${project.category}`, size === "small" && "isSmall")} aria-hidden="true">
      <div className="coverRidge" />
      {size === "large" && (
        <span className="coverMonogram">
          {project.name
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join("")}
        </span>
      )}
      <div className="coverContent">
        <span className="coverCategory">{category?.label}</span>
        {size === "small" && <span className="coverName">{project.name}</span>}
        {size === "large" && <span className="coverStack">{project.stack.join("  ·  ")}</span>}
      </div>
    </div>
  );
}

export function ProjectLinks({ project }: { project: Project }) {
  if (!project.github && !project.demo && !project.note) return null;
  return (
    <div className="linkRow">
      {project.github && (
        <a className="btn btnPrimary" href={project.github} target="_blank" rel="noopener noreferrer">
          <GitHubIcon width={15} height={15} /> View source
          <span className="srOnly"> for {project.name} (opens in a new tab)</span>
        </a>
      )}
      {project.demo && (
        <a className="btn" href={project.demo} target="_blank" rel="noopener noreferrer">
          <ArrowUpRightIcon width={15} height={15} /> Live demo
          <span className="srOnly"> of {project.name} (opens in a new tab)</span>
        </a>
      )}
      {project.note && (
        <span className="notePill">
          <LockIcon width={14} height={14} /> {project.note}
        </span>
      )}
    </div>
  );
}

export default function ProjectDetails({ project }: { project: Project }) {
  const { openApp } = useOS();
  const category = categoryOf(project);
  const related = allProjects.filter((p) => p.category === project.category && p.slug !== project.slug);
  const facts = [
    { label: "Problem", text: project.problem },
    { label: "Key challenge", text: project.challenge },
  ].filter((f) => isFilled(f.text));
  const hasTagline = isFilled(project.tagline);

  return (
    <article className="projectDetails">
      <ProjectCover project={project} />

      <header className="projectHead">
        <div className="projectMeta">
          {category && (
            <button type="button" className="chip" onClick={() => openApp("finder", `projects/${category.id}`)}>
              {category.label}
            </button>
          )}
          {project.status && <span className="chip chipAccent">{project.status}</span>}
        </div>
        <h1 className="projectTitle">{project.name}</h1>
        {hasTagline && <p className="pageLead">{project.tagline}</p>}
        {!hasTagline && (
          <p className="pageLead">
            Details are on the way. This project is in active development, and its write-up will be published here once
            it's ready.
          </p>
        )}
      </header>

      <ProjectLinks project={project} />

      {facts.length > 0 && (
        <div className="projectFacts">
          {facts.map((f) => (
            <section key={f.label} className="card">
              <h2 className="eyebrow">{f.label}</h2>
              <p>{f.text}</p>
            </section>
          ))}
        </div>
      )}

      <section className="pageSection">
        <h2 className="sectionTitle">Built with</h2>
        <ul className="tagList" aria-label="Technologies">
          {project.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 && category && (
        <section className="pageSection">
          <h2 className="sectionTitle">More in {category.label}</h2>
          <ul className="relatedList">
            {related.map((p) => (
              <li key={p.slug}>
                <button type="button" className="relatedItem" onClick={() => openApp("project", p.slug)}>
                  <AppIcon app="project" size={30} />
                  <span>
                    <span className="relatedName">{p.name}</span>
                    <span className="relatedStack">{p.stack.join(" · ")}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
