import { useEffect, useRef, useState } from "react";
import { about, experience, profile } from "../../../data/content";
import { useOS } from "../../state/os";
import AppIcon from "../../ui/AppIcon";
import { ArrowUpRightIcon, DownloadIcon, PrintIcon, ZoomInIcon, ZoomOutIcon } from "../../ui/Glyphs";
import "./resume.css";

// 0 means "fit to width", the default.
const ZOOMS = [50, 75, 100, 125, 150, 200];
const FIT = 0;
type Status = "checking" | "loading" | "ready" | "missing";

// Browsers that can't show PDFs inline (most phones) get a summary card.
function canEmbedPdf() {
  const nav = navigator as Navigator & { pdfViewerEnabled?: boolean };
  if (nav.pdfViewerEnabled === false) return false;
  return !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export default function Resume() {
  const { run, isMobile } = useOS();
  const [zoom, setZoom] = useState(FIT);
  const [status, setStatus] = useState<Status>("checking");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const inline = canEmbedPdf() && !isMobile;

  // Confirm the PDF exists before embedding it, so a missing file shows a
  // clear message instead of the browser's generic error page.
  useEffect(() => {
    const controller = new AbortController();
    fetch(profile.resume, { method: "HEAD", signal: controller.signal })
      .then((res) => {
        const type = res.headers.get("content-type") || "";
        if (res.ok && !type.includes("text/html")) setStatus("loading");
        else setStatus("missing");
      })
      .catch((err: unknown) => {
        if ((err as Error).name !== "AbortError") setStatus("missing");
      });
    return () => controller.abort();
  }, []);

  const applyZoom = (next: number) => {
    if (next === zoom) return;
    setZoom(next);
    setStatus("loading");
  };

  const step = (dir: number) => {
    if (zoom === FIT) {
      if (dir > 0) applyZoom(125);
      else applyZoom(75);
      return;
    }
    const i = ZOOMS.indexOf(zoom);
    applyZoom(ZOOMS[Math.min(Math.max(i + dir, 0), ZOOMS.length - 1)]);
  };

  const print = () => {
    try {
      const win = frameRef.current?.contentWindow;
      if (!win) throw new Error("no frame");
      win.focus();
      win.print();
    } catch {
      window.open(profile.resume, "_blank", "noopener,noreferrer");
    }
  };

  let src = `${profile.resume}#toolbar=0&navpanes=0&view=FitH`;
  if (zoom !== FIT) src = `${profile.resume}#toolbar=0&navpanes=0&zoom=${zoom}`;
  let zoomLabel = `${zoom}%`;
  if (zoom === FIT) zoomLabel = "Fit";

  return (
    <div className="app resume">
      <div className="appToolbar">
        <AppIcon app="resume" size={20} />
        <span className="resumeName">Moises_Sanchez_Resume.pdf</span>
        <div className="toolbarSpacer" />
        {inline && status !== "missing" && (
          <div className="toolbarGroup" role="group" aria-label="Zoom">
            <button type="button" className="iconBtn" onClick={() => step(-1)} disabled={zoom === ZOOMS[0]} aria-label="Zoom out">
              <ZoomOutIcon />
            </button>
            <button
              type="button"
              className="zoomLevel"
              onClick={() => applyZoom(FIT)}
              aria-live="polite"
              title="Fit to width"
              aria-label={`Zoom ${zoomLabel}. Fit to width`}
            >
              {zoomLabel}
            </button>
            <button
              type="button"
              className="iconBtn"
              onClick={() => step(1)}
              disabled={zoom === ZOOMS[ZOOMS.length - 1]}
              aria-label="Zoom in"
            >
              <ZoomInIcon />
            </button>
          </div>
        )}
        {inline && status !== "missing" && <span className="toolbarDivider" />}
        {inline && status !== "missing" && (
          <button type="button" className="iconBtn" onClick={print} aria-label="Print" title="Print">
            <PrintIcon />
          </button>
        )}
        <a className="iconBtn" href={profile.resume} target="_blank" rel="noopener noreferrer" aria-label="Open in a new tab" title="Open in a new tab">
          <ArrowUpRightIcon width={16} height={16} />
        </a>
        <button type="button" className="btn btnPrimary resumeDownload" onClick={() => run({ type: "downloadResume" })}>
          <DownloadIcon width={15} height={15} /> Download
        </button>
      </div>

      <div className="resumeBody">
        {status === "missing" && (
          <div className="appState" role="alert">
            <p className="appStateTitle">The résumé file couldn't be loaded.</p>
            <p className="muted">Check your connection, or try opening it directly.</p>
            <a className="btn" href={profile.resume} target="_blank" rel="noopener noreferrer">
              Open PDF
            </a>
          </div>
        )}

        {status !== "missing" && !inline && <ResumeCard />}

        {status !== "missing" && status !== "checking" && inline && (
          <iframe
            key={zoom}
            ref={frameRef}
            className="resumeFrame"
            src={src}
            title={`${profile.name} résumé (PDF)`}
            onLoad={() => setStatus("ready")}
          />
        )}

        {inline && (status === "checking" || status === "loading") && (
          <div className="resumeLoading" aria-busy="true">
            <div className="spinner" />
            <span>Loading résumé…</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeCard() {
  const { run } = useOS();
  const role = experience[0];
  return (
    <div className="appScroll">
      <div className="page resumeCard">
        <div className="resumeDoc">
          <AppIcon app="resume" size={56} />
          <h1 className="pageTitle">{profile.name}</h1>
          <p className="muted">{profile.role}</p>
          <ul className="resumeFacts">
            {role && (
              <li>
                <span className="faint">Currently</span>
                {role.title}, {role.company}
              </li>
            )}
            {about.education[0] && (
              <li>
                <span className="faint">Education</span>
                {about.education[0].credential}, {about.education[0].school}
              </li>
            )}
            {about.certifications[0] && (
              <li>
                <span className="faint">Certified</span>
                {about.certifications[0].name}
              </li>
            )}
          </ul>
          <div className="linkRow">
            <a className="btn btnPrimary btnLarge" href={profile.resume} target="_blank" rel="noopener noreferrer">
              Open PDF
            </a>
            <button type="button" className="btn btnLarge" onClick={() => run({ type: "downloadResume" })}>
              <DownloadIcon width={16} height={16} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
