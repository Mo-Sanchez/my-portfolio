import { about } from "../../data/content";
import Section from "./Section";

export default function About() {
  return (
    <Section id="about" eyebrow="About" title="Engineer by training, operator by experience.">
      <div className="aboutGrid">
        <div className="aboutBody" data-reveal>
          {about.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}

          <ul className="focusList">
            {about.focus.map((f) => (
              <li key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="credentials" aria-label="Education and certifications" data-reveal>
          <h3 className="credHeading">Education</h3>
          <ul className="credList">
            {about.education.map((e) => (
              <li key={e.school}>
                <span className="credTitle">{e.credential}</span>
                <span className="credMeta">
                  {e.school} · {e.date}
                </span>
              </li>
            ))}
          </ul>

          <h3 className="credHeading">Certifications</h3>
          <ul className="credList">
            {about.certifications.map((c) => (
              <li key={c.name}>
                <span className="credTitle">{c.name}</span>
                <span className="credMeta">{c.date}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Section>
  );
}
