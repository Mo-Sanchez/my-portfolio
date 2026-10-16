import { profile } from "../../data/content";
import { ArrowUpRightIcon, DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";

export default function Contact() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-heading">
      <div className="container">
        <div className="contactPanel" data-reveal>
          <p className="eyebrow">Contact</p>
          <h2 id="contact-heading">Let's build something useful.</h2>
          <p className="sectionIntro">
            I'm interested in software engineering, technical program management, and operations technology roles.
            If you're hiring, collaborating, or have a problem worth automating, I'd like to hear about it.
          </p>

          <a className="btn btnPrimary btnLarge" href={`mailto:${profile.email}`}>
            <MailIcon /> {profile.email}
          </a>

          <ul className="contactLinks">
            <li>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedInIcon /> LinkedIn <ArrowUpRightIcon className="ext" />
              </a>
            </li>
            <li>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                <GitHubIcon /> GitHub <ArrowUpRightIcon className="ext" />
              </a>
            </li>
            <li>
              <a href={profile.resume} download>
                <DownloadIcon /> Résumé
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
