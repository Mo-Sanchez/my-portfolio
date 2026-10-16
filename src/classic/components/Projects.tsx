import { featuredProjects, otherProjects, type Project } from "../../data/content";
import { ArrowUpRightIcon, GitHubIcon, LockIcon } from "./Icons";
import Section from "./Section";

function ProjectLinks({ project }: { project: Project }) {
  if (!project.github && !project.demo && !project.note) return null;
  return (
    <div className="projectLinks">
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer">
          <GitHubIcon /> Source<span className="srOnly"> for {project.name}</span>
        </a>
      )}
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noopener noreferrer">
          <ArrowUpRightIcon /> Live demo<span className="srOnly"> of {project.name}</span>
        </a>
      )}
      {project.note && (
        <span className="projectNote">
          <LockIcon /> {project.note}
        </span>
      )}
    </div>
  );
}

// Shown when no screenshot exists yet: a quiet, on-brand preview instead of a broken image.
function Preview({ project, index }: { project: Project; index: number }) {
  if (project.image) {
    return (
      <img
        className="previewImg"
        src={project.image}
        alt={`Screenshot of ${project.name}`}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <div className={`previewMock previewMock${index % 3}`} aria-hidden="true">
      <div className="mockBar">
        <span />
        <span />
        <span />
      </div>
      <div className="mockBody">
        <div className="mockSide" />
        <div className="mockMain">
          <div className="mockLine w60" />
          <div className="mockLine w40" />
          <div className="mockCards">
            <div />
            <div />
            <div />
          </div>
          <div className="mockLine w80" />
          <div className="mockLine w50" />
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Things I've built."
      intro="Selected work, from internal tools used in live operations to products I'm building now."
    >
      <div className="featured">
        {featuredProjects.map((p, i) => (
          <article key={p.name} className="project" data-reveal>
            <div className="projectPreview">
              <Preview project={p} index={i} />
            </div>
            <div className="projectBody">
              <div className="projectTop">
                <h3>{p.name}</h3>
                {p.status && <span className="badge">{p.status}</span>}
              </div>
              <p className="projectTagline">{p.tagline}</p>
              <dl className="projectFacts">
                <div>
                  <dt>Problem</dt>
                  <dd>{p.problem}</dd>
                </div>
                <div>
                  <dt>Key challenge</dt>
                  <dd>{p.challenge}</dd>
                </div>
              </dl>
              <ul className="stack" aria-label="Technologies">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <ProjectLinks project={p} />
            </div>
          </article>
        ))}
      </div>

      <h3 className="subheading" data-reveal>
        More projects
      </h3>
      <ul className="otherProjects">
        {otherProjects.map((p) => (
          <li key={p.name} className="miniProject" data-reveal>
            <h4>{p.name}</h4>
            <p>{p.tagline}</p>
            <ul className="stack" aria-label="Technologies">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <ProjectLinks project={p} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
