import { metrics, profile } from "../../data/content";
import portrait from "../../images/profile.jpg";
import { ArrowRightIcon, DownloadIcon, GitHubIcon, LinkedInIcon } from "./Icons";

export default function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <div className="container heroGrid">
        <div className="heroText">
          <h1 id="hero-heading">
            <span className="heroName">{profile.name}</span>
            <span className="heroHeadline">{profile.headline}</span>
          </h1>

          <p className="heroIntro">{profile.intro}</p>

          <div className="heroActions">
            <a className="btn btnPrimary" href="#projects">
              View my work <ArrowRightIcon />
            </a>
            <a className="btn btnSecondary" href="#contact">
              Get in touch
            </a>
          </div>

          <ul className="heroLinks" aria-label="Profiles">
            <li>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                <GitHubIcon /> GitHub
              </a>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedInIcon /> LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.resume} download>
                <DownloadIcon /> Résumé (PDF)
              </a>
            </li>
          </ul>
        </div>

        <aside className="heroCard" aria-label="Snapshot">
          <img
            className="portrait"
            src={portrait}
            alt={`Portrait of ${profile.name}`}
            width={800}
            height={800}
            fetchPriority="high"
          />
          <dl className="snapshot">
            <div>
              <dt>Currently</dt>
              <dd>Load Planner, Amazon Air</dd>
            </div>
            <div>
              <dt>Education</dt>
              <dd>B.S. Computer Science, UF</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="container">
        <ul className="metrics" aria-label="Selected impact">
          {metrics.map((m) => (
            <li key={m.label} className="metric" data-reveal>
              <span className="metricValue">{m.value}</span>
              <span className="metricLabel">{m.label}</span>
              <span className="metricDetail">{m.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
