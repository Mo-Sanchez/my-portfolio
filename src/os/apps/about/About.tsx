import { useEffect, useRef } from "react";
import { about, experience, metrics, profile, skills } from "../../../data/content";
import portrait from "../../../images/profile-480.jpg";
import { cx } from "../../lib/util";
import { useOS } from "../../state/os";
import { GitHubIcon, LinkedInIcon, MailIcon, PinIcon } from "../../ui/Glyphs";
import AppIcon from "../../ui/AppIcon";
import type { AppProps } from "../registry";
import "./about.css";

const sections = [
  { id: "", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
];

export default function About({ route, setRoute }: AppProps) {
  const { openApp, motion } = useOS();
  const scrollRef = useRef<HTMLDivElement>(null);
  const role = experience[0];

  // Deep links (#/about/skills) and the section tabs scroll to their section.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let behavior: ScrollBehavior = "smooth";
    if (motion === "reduced") behavior = "auto";
    if (!route) {
      el.scrollTo({ top: 0, behavior });
      return;
    }
    el.querySelector(`[data-section="${route}"]`)?.scrollIntoView({ behavior, block: "start" });
  }, [route, motion]);

  return (
    <div className="app about">
      <nav className="aboutTabs" aria-label="About sections">
        {sections.map((s) => (
          <button
            key={s.label}
            type="button"
            className={cx("aboutTab", route === s.id && "isActive")}
            aria-current={(route === s.id && "true") || undefined}
            onClick={() => setRoute(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="appScroll" ref={scrollRef}>
        <div className="page aboutPage">
          <header className="aboutHero">
            <img className="aboutPortrait" src={portrait} alt={`Portrait of ${profile.name}`} width={120} height={120} />
            <div className="aboutIdentity">
              <h1 className="pageTitle">{profile.name}</h1>
              <p className="aboutRole">{profile.role}</p>
              <p className="aboutLocation">
                <PinIcon width={14} height={14} /> {profile.location}
              </p>
            </div>
          </header>

          <div className="aboutActions">
            <button type="button" className="btn btnPrimary" onClick={() => openApp("resume")}>
              <AppIcon app="resume" size={18} /> Résumé
            </button>
            <button type="button" className="btn" onClick={() => openApp("contact")}>
              <MailIcon width={15} height={15} /> Contact
            </button>
            <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedInIcon width={15} height={15} /> LinkedIn
            </a>
            <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">
              <GitHubIcon width={15} height={15} /> GitHub
            </a>
          </div>

          <p className="aboutHeadline">{profile.headline}</p>
          <p className="pageLead">{profile.intro}</p>

          <section className="pageSection" data-section="overview">
            <h2 className="sectionTitle">Engineer by training, operator by experience</h2>
            <div className="aboutProse">
              {about.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <ul className="focusGrid">
              {about.focus.map((f, i) => (
                <li key={f.title} className="card focusCard">
                  <span className="focusIndex">0{i + 1}</span>
                  <h3>{f.title}</h3>
                  <p className="muted">{f.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="pageSection">
            <h2 className="sectionTitle">Impact at a glance</h2>
            <ul className="metricGrid">
              {metrics.map((m) => (
                <li key={m.label} className="metricCard">
                  <span className="metricValue">{m.value}</span>
                  <span className="metricLabel">{m.label}</span>
                  <span className="metricDetail">{m.detail}</span>
                </li>
              ))}
            </ul>
            {role && (
              <button type="button" className="aboutCurrent" onClick={() => openApp("experience")}>
                <AppIcon app="experience" size={34} />
                <span>
                  <span className="aboutCurrentLabel">Currently</span>
                  <span className="aboutCurrentRole">
                    {role.title} · {role.company}
                  </span>
                </span>
                <span className="aboutCurrentLink">See experience →</span>
              </button>
            )}
          </section>

          <section className="pageSection" data-section="skills" aria-labelledby="about-skills">
            <h2 className="sectionTitle" id="about-skills">
              Skills
            </h2>
            <dl className="skillGroups">
              {skills.map((g) => (
                <div key={g.group} className="skillGroup">
                  <dt>{g.group}</dt>
                  <dd>
                    <ul className="tagList">
                      {g.items.map((item) => (
                        <li key={item} className="chip">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="pageSection" data-section="education" aria-labelledby="about-education">
            <h2 className="sectionTitle" id="about-education">
              Education &amp; certifications
            </h2>
            <ol className="timeline">
              {about.certifications.map((c) => (
                <li key={c.name} className="timelineItem">
                  <p className="timelineDate">{c.date}</p>
                  <p className="timelineTitle">{c.name}</p>
                  <p className="timelineMeta">Certification</p>
                </li>
              ))}
              {about.education.map((e) => (
                <li key={e.school} className="timelineItem">
                  <p className="timelineDate">{e.date}</p>
                  <p className="timelineTitle">{e.credential}</p>
                  <p className="timelineMeta">{e.school}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
