import { experience } from "../../data/content";
import Section from "./Section";

export default function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Impact at operational scale."
      intro="Each project below started as a recurring operational problem and ended with a tool or process change that paid for itself."
    >
      {experience.map((role) => (
        <article key={role.company + role.title} className="role">
          <header className="roleHeader" data-reveal>
            <div>
              <h3 className="roleTitle">
                {role.title} <span className="roleCompany">· {role.company}</span>
              </h3>
              <p className="roleMeta">
                {role.period} · {role.location}
              </p>
            </div>
            <p className="roleSummary">{role.summary}</p>
            <ul className="tagList" aria-label="Scope">
              {role.scope.map((s) => (
                <li key={s} className="tag">
                  {s}
                </li>
              ))}
            </ul>
          </header>

          <ol className="cases">
            {role.cases.map((c) => (
              <li key={c.title} className="case" data-reveal>
                <div className="caseHead">
                  <h4>{c.title}</h4>
                  <p className="caseMetric">{c.metric}</p>
                </div>
                <dl className="par">
                  <div>
                    <dt>Problem</dt>
                    <dd>{c.problem}</dd>
                  </div>
                  <div>
                    <dt>Action</dt>
                    <dd>{c.action}</dd>
                  </div>
                  <div>
                    <dt>Result</dt>
                    <dd>{c.result}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </Section>
  );
}
