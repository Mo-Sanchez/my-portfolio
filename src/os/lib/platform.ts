export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

function getModKey() {
  if (isMac) return "⌘";
  return "Ctrl";
}

// Label for the platform's primary shortcut modifier.
export const modKey = getModKey();

export const classicHref = `${import.meta.env.BASE_URL}?view=classic`;
