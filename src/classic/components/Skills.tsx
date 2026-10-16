import { skills } from "../../data/content";
import Section from "./Section";

export default function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="Toolkit.">
      <dl className="skills" data-reveal>
        {skills.map(({ group, items }) => (
          <div key={group} className="skillRow">
            <dt>{group}</dt>
            <dd>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
