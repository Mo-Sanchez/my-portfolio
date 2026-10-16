import { useEffect, useLayoutEffect, useRef } from "react";
import { cx } from "../lib/util";
import { useOS, type MenuItem } from "../state/os";
import { CheckIcon } from "../ui/Glyphs";

type MenuProps = {
  x: number;
  y: number;
  items: MenuItem[];
  label: string;
  onClose: () => void;
  // Elements that shouldn't count as "outside" (e.g. the menu bar button that toggles it).
  ignore?: HTMLElement | null;
};

// A keyboard-navigable menu, positioned at a point and kept on screen.
export function Menu({ x, y, items, label, onClose, ignore }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const nx = Math.max(6, Math.min(x, window.innerWidth - width - 6));
    let ny = y;
    if (y + height > window.innerHeight - 6) ny = Math.max(6, y - height);
    // Adjusted directly so the menu never renders off-screen for a frame.
    el.style.left = `${nx}px`;
    el.style.top = `${ny}px`;
    el.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus({ preventScroll: true });
  }, [x, y]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (ignore?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    const onBlur = () => onClose();
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onBlur);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onBlur);
    };
  }, [onClose, ignore]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || []);
    const i = nodes.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (i + 1) % nodes.length;
    if (e.key === "ArrowUp") next = (i - 1 + nodes.length) % nodes.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = nodes.length - 1;
    if (next >= 0) {
      e.preventDefault();
      nodes[next]?.focus();
    }
    if (e.key === "Tab") onClose();
  };

  return (
    <div
      ref={ref}
      className="menu glass"
      role="menu"
      aria-label={label}
      style={{ left: x, top: y }}
      onKeyDown={onKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        if (item === "separator") return <div key={`sep${i}`} className="menuSep" role="separator" />;
        return (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className={cx("menuItem", item.danger && "isDanger")}
            onClick={() => {
              onClose();
              item.onSelect();
            }}
          >
            <span className="menuCheck" aria-hidden="true">
              {item.checked && <CheckIcon width={13} height={13} />}
            </span>
            <span className="menuLabel">
              {item.label}
              {item.detail && <span className="menuDetail">{item.detail}</span>}
            </span>
            {item.shortcut && <span className="menuShortcut">{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}

// The single global context menu (desktop, icons, dock, title bars).
export default function ContextMenu() {
  const { contextMenu, closeContextMenu } = useOS();
  if (!contextMenu) return null;
  return (
    <Menu
      key={`${contextMenu.x},${contextMenu.y},${contextMenu.label}`}
      x={contextMenu.x}
      y={contextMenu.y}
      items={contextMenu.items}
      label={contextMenu.label}
      onClose={closeContextMenu}
    />
  );
}
