import { useState } from "react";
import { profile } from "../../../data/content";
import { copyText } from "../../lib/util";
import { useOS } from "../../state/os";
import { ArrowUpRightIcon, CheckIcon, CopyIcon, DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from "../../ui/Glyphs";
import "./contact.css";

type Draft = { name: string; replyTo: string; subject: string; message: string };
type Errors = Partial<Record<keyof Draft, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(d: Draft): Errors {
  const errors: Errors = {};
  if (!d.name.trim()) errors.name = "Please add your name.";
  if (d.replyTo.trim() && !EMAIL_RE.test(d.replyTo.trim())) errors.replyTo = "That email address doesn't look right.";
  if (d.message.trim().length < 10) errors.message = "Write at least a sentence so I know how to help.";
  return errors;
}

function buildMailto(d: Draft) {
  const lines = [d.message.trim(), "", `— ${d.name.trim()}`];
  if (d.replyTo.trim()) lines.push(d.replyTo.trim());
  const subject = d.subject.trim() || `Hello from ${d.name.trim()}`;
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export default function Contact() {
  const { notify } = useOS();
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<Draft>({ name: "", replyTo: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const copyEmail = async () => {
    const ok = await copyText(profile.email);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      notify({ title: "Couldn't copy", body: `The address is ${profile.email}.`, appId: "contact" });
    }
  };

  const update = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    setSent(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    window.location.href = buildMailto(draft);
    setSent(true);
    notify({ title: "Opening your email app", body: "Your message is ready to send.", appId: "contact" });
  };

  let CopyGlyph = CopyIcon;
  let copyLabel = "Copy";
  if (copied) {
    CopyGlyph = CheckIcon;
    copyLabel = "Copied";
  }

  return (
    <div className="app">
      <div className="appScroll">
        <div className="page contactPage">
          <header className="pageHeader">
            <p className="eyebrow">Contact</p>
            <h1 className="pageTitle">Let's build something useful.</h1>
            <p className="pageLead">
              I'm interested in software engineering, technical program management, and operations technology roles. If
              you're hiring, collaborating, or have a problem worth automating, I'd like to hear about it.
            </p>
          </header>

          <section className="emailCard card" aria-label="Email">
            <div className="emailIcon" aria-hidden="true">
              <MailIcon width={22} height={22} />
            </div>
            <div className="emailText">
              <span className="eyebrow">Email</span>
              <a className="emailAddress" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </div>
            <div className="emailActions">
              <button type="button" className="btn" onClick={copyEmail} aria-live="polite">
                <CopyGlyph width={15} height={15} /> {copyLabel}
              </button>
              <a className="btn btnPrimary" href={`mailto:${profile.email}`}>
                Write email
              </a>
            </div>
          </section>

          <ul className="contactLinks">
            <li>
              <a className="contactLink" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedInIcon width={20} height={20} />
                <span>
                  <span className="contactLinkTitle">LinkedIn</span>
                  <span className="contactLinkSub">Professional profile</span>
                </span>
                <ArrowUpRightIcon width={15} height={15} className="contactExt" />
              </a>
            </li>
            <li>
              <a className="contactLink" href={profile.github} target="_blank" rel="noopener noreferrer">
                <GitHubIcon width={20} height={20} />
                <span>
                  <span className="contactLinkTitle">GitHub</span>
                  <span className="contactLinkSub">@Mo-Sanchez</span>
                </span>
                <ArrowUpRightIcon width={15} height={15} className="contactExt" />
              </a>
            </li>
            <li>
              <a className="contactLink" href={profile.resume} download>
                <DownloadIcon width={20} height={20} />
                <span>
                  <span className="contactLinkTitle">Résumé</span>
                  <span className="contactLinkSub">PDF download</span>
                </span>
              </a>
            </li>
          </ul>

          <section className="pageSection" aria-labelledby="compose-heading">
            <h2 className="sectionTitle" id="compose-heading">
              Send a message
            </h2>
            <form className="composeForm" onSubmit={submit} noValidate>
              <div className="formRow">
                <Field id="name" label="Your name" error={errors.name}>
                  <input id="contact-name" className="input" value={draft.name} onChange={update("name")} autoComplete="name" />
                </Field>
                <Field id="replyTo" label="Your email (optional)" error={errors.replyTo}>
                  <input
                    id="contact-replyTo"
                    className="input"
                    type="email"
                    value={draft.replyTo}
                    onChange={update("replyTo")}
                    autoComplete="email"
                  />
                </Field>
              </div>
              <Field id="subject" label="Subject (optional)">
                <input id="contact-subject" className="input" value={draft.subject} onChange={update("subject")} />
              </Field>
              <Field id="message" label="Message" error={errors.message}>
                <textarea id="contact-message" className="textarea" rows={6} value={draft.message} onChange={update("message")} />
              </Field>
              <div className="composeFooter">
                <p className="faint composeNote">
                  This opens your email app with the message filled in. Nothing is sent from this site.
                </p>
                <button type="submit" className="btn btnPrimary btnLarge">
                  <MailIcon width={16} height={16} /> Open in email app
                </button>
              </div>
              {sent && (
                <p className="composeSent" role="status">
                  <CheckIcon width={15} height={15} /> Your email app should open with the draft. If it didn't, use Copy
                  above and write to {profile.email}.
                </p>
              )}
            </form>
          </section>

          <p className="contactMeta faint">
            Based in {profile.location}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="field" data-invalid={Boolean(error) || undefined}>
      <label htmlFor={`contact-${id}`}>{label}</label>
      {children}
      {error && (
        <p className="fieldError" id={`contact-${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

