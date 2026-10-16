import { useEffect, useRef } from "react";
import { useOS, type Notice } from "../state/os";
import AppIcon from "../ui/AppIcon";
import { XIcon } from "../ui/Glyphs";

function timeAgo(time: number) {
  const s = Math.round((Date.now() - time) / 1000);
  if (s < 45) return "now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return new Date(time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function NoticeCard({ notice, onDismiss }: { notice: Notice; onDismiss?: () => void }) {
  const { run, openApp } = useOS();
  const activate = () => {
    if (notice.action) run(notice.action.run);
    else if (notice.appId) openApp(notice.appId);
    onDismiss?.();
  };
  return (
    <div className="notice glass">
      <button type="button" className="noticeMain" onClick={activate}>
        <AppIcon app={notice.appId || "settings"} size={30} />
        <span className="noticeText">
          <span className="noticeTitle">{notice.title}</span>
          {notice.body && <span className="noticeBody">{notice.body}</span>}
        </span>
        <span className="noticeTime">{timeAgo(notice.time)}</span>
      </button>
      {onDismiss && (
        <button type="button" className="iconBtn noticeClose" aria-label="Dismiss notification" onClick={onDismiss}>
          <XIcon width={13} height={13} />
        </button>
      )}
    </div>
  );
}

export function Toasts({ hidden }: { hidden: boolean }) {
  const { toasts, dismissToast } = useOS();
  if (hidden) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((n) => (
        <NoticeCard key={n.id} notice={n} onDismiss={() => dismissToast(n.id)} />
      ))}
    </div>
  );
}

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const { notices, clearNotices } = useOS();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (ref.current?.contains(target) || target.closest("[data-center-toggle]")) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="center glass" role="dialog" aria-label="Notifications">
      <header className="centerHead">
        <h2>Notifications</h2>
        {notices.length > 0 && (
          <button type="button" className="btn btnGhost" onClick={clearNotices}>
            Clear all
          </button>
        )}
      </header>
      {notices.length === 0 && <p className="centerEmpty">You're all caught up.</p>}
      <div className="centerList">
        {notices.map((n) => (
          <NoticeCard key={n.id} notice={n} />
        ))}
      </div>
    </div>
  );
}
