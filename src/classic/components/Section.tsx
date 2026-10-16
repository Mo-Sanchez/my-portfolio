import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
};

export default function Section({ id, eyebrow, title, intro, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} className="section" aria-labelledby={headingId}>
      <div className="container">
        <header className="sectionHeader" data-reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={headingId}>{title}</h2>
          {intro && <p className="sectionIntro">{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
