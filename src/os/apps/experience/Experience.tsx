import { about, experience, isFilled, metrics } from "../../../data/content";
import { cx } from "../../lib/util";
import { slugify } from "../../search";
import { useOS } from "../../state/os";
import type { AppProps } from "../registry";
import "./experience.css";

type Milestone = { date: string; sort: number; title: string; meta: string; kind: string };

// Career and education milestones in one chronological list, newest first.
function milestones(): Milestone[] {
  const year = (text: string) => Number(text.match(/\d{4}/)?.[0] || 0);
  const list: Milestone[] = [];
  for (const role of experience) {
    list.push({ date: role.period, sort: year(role.period) + 0.1, title: role.title, meta: role.company, kind: "Role" });
  }
  for (const e of about.education) {
    list.push({ date: e.date, sort: year(e.date) + 0.9, title: e.credential, meta: e.school, kind: "Education" });
  }
  for (const c of about.certifications) {
    list.push({ date: c.date, sort: year(c.date) + 0.5, title: c.name, meta: "Professional development", kind: "Certification" });
  }
  return list.sort((a, b) => b.sort - a.sort);
}

export default function Experience({ route, setRoute }: AppProps) {
  const { openApp } = useOS();

  return (
    <div className="app">
      <div className="appScroll">
        <div className="page experiencePage">
          <header className="pageHeader">
            <p className="eyebrow">Experience</p>
            <h1 className="pageTitle">Impact at operational scale.</h1>
            <p className="pageLead">
              Each project below started as a recurring operational problem and ended with a tool or process change that
              paid for itself.
            </p>
          </header>

          <ul className="metricGrid" aria-label="Selected impact">
            {metrics.map((m) => (
              <li key={m.label} className="metricCard">
                <span className="metricValue">{m.value}</span>
                <span className="metricLabel">{m.label}</span>
                <span className="metricDetail">{m.detail}</span>
              </li>
            ))}
          </ul>

          {experience.map((role) => {
            const caseIndex = Math.max(
              0,
              role.cases.findIndex((c) => slugify(c.title) === route),
            );
            const active = role.cases[caseIndex];
            const scope = role.scope.filter(isFilled);
            return (
              <article key={role.company + role.title} className="pageSection roleCard card">
                <header className="roleHead">
                  <div>
                    <h2 className="roleTitle">
                      {role.title} <span className="roleCompany">· {role.company}</span>
                    </h2>
                    <p className="faint">
                      {role.period} · {role.location}
                    </p>
                  </div>
                </header>
                <p className="roleSummary">{role.summary}</p>
                {scope.length > 0 && (
                  <ul className="tagList" aria-label="Scope">
                    {scope.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}

                <h3 className="caseHeading">Case studies</h3>
                <div className="cases">
                  <div className="caseTabs" role="tablist" aria-label="Case studies">
                    {role.cases.map((c, i) => (
                      <button
                        key={c.title}
                        type="button"
                        role="tab"
                        id={`case-tab-${slugify(c.title)}`}
                        aria-selected={i === caseIndex}
                        aria-controls="case-panel"
                        className={cx("caseTab", i === caseIndex && "isActive")}
                        onClick={() => setRoute(slugify(c.title))}
                      >
                        <span className="caseTabTitle">{c.title}</span>
                        <span className="caseTabMetric">{c.metric}</span>
                      </button>
                    ))}
                  </div>

                  {active && (
                    <div
                      key={active.title}
                      className="casePanel"
                      role="tabpanel"
                      id="case-panel"
                      aria-labelledby={`case-tab-${slugify(active.title)}`}
                    >
                      <p className="caseMetric">{active.metric}</p>
                      <ol className="caseSteps">
                        <li>
                          <span className="stepLabel">Problem</span>
                          <p>{active.problem}</p>
                        </li>
                        <li>
                          <span className="stepLabel">Action</span>
                          <p>{active.action}</p>
                        </li>
                        <li>
                          <span className="stepLabel">Result</span>
                          <p>{active.result}</p>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          <section className="pageSection">
            <h2 className="sectionTitle">Timeline</h2>
            <ol className="timeline">
              {milestones().map((m) => (
                <li key={m.title} className="timelineItem">
                  <p className="timelineDate">
                    {m.date} · {m.kind}
                  </p>
                  <p className="timelineTitle">{m.title}</p>
                  <p className="timelineMeta">{m.meta}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="experienceFooter">
            <button type="button" className="btn btnPrimary" onClick={() => openApp("resume")}>
              View full résumé
            </button>
            <button type="button" className="btn" onClick={() => openApp("finder", "projects")}>
              Browse projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
