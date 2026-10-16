// Plain metadata for every MoOS application. Components are attached in
// registry.tsx; keeping this file component-free lets pure modules (the
// virtual filesystem, search, terminal) reference apps without cycles.

export type AppId =
  | "home"
  | "finder"
  | "about"
  | "experience"
  | "resume"
  | "contact"
  | "terminal"
  | "editor"
  | "browser"
  | "settings"
  | "project"
  | "reader";

export type AppMeta = {
  id: AppId;
  title: string;
  description: string;
  keywords: string;
  size: { w: number; h: number };
  minSize: { w: number; h: number };
  // Where the app lives in the dock: "core" apps are always shown, in this
  // order; "more" apps sit behind the dock's More button.
  dockGroup?: "core" | "more";
  // Route used when the app is opened without one.
  defaultRoute?: string;
  // One window per route (e.g. one window per project) instead of one per app.
  perRoute?: boolean;
  // Internal viewers that only open from files, not from the launcher.
  internal?: boolean;
};

export const appList: AppMeta[] = [
  {
    id: "home",
    title: "Home",
    description: "Start here: who I am and where to look",
    keywords: "home start welcome overview intro introduction",
    size: { w: 940, h: 680 },
    minSize: { w: 360, h: 360 },
    dockGroup: "core",
  },
  {
    id: "finder",
    title: "Projects",
    description: "Browse every project, plus documents",
    keywords: "finder explorer folders projects documents files work portfolio",
    defaultRoute: "projects",
    size: { w: 920, h: 600 },
    minSize: { w: 480, h: 340 },
    dockGroup: "core",
  },
  {
    id: "about",
    title: "About Me",
    description: "Background, skills, and education",
    keywords: "about bio profile skills education certifications who",
    size: { w: 860, h: 660 },
    minSize: { w: 360, h: 360 },
    dockGroup: "core",
  },
  {
    id: "experience",
    title: "Experience",
    description: "Career timeline and measurable impact",
    keywords: "experience work career amazon air timeline impact jobs",
    size: { w: 900, h: 680 },
    minSize: { w: 380, h: 380 },
    dockGroup: "core",
  },
  {
    id: "resume",
    title: "Résumé",
    description: "View, print, or download the PDF",
    keywords: "resume cv pdf download print",
    size: { w: 820, h: 780 },
    minSize: { w: 380, h: 380 },
    dockGroup: "core",
  },
  {
    id: "contact",
    title: "Contact",
    description: "Email, LinkedIn, and GitHub",
    keywords: "contact email mail linkedin github hire reach message",
    size: { w: 640, h: 620 },
    minSize: { w: 340, h: 400 },
    dockGroup: "core",
  },
  {
    id: "terminal",
    title: "Terminal",
    description: "Explore the portfolio from a shell",
    keywords: "terminal shell console command line cli bash",
    size: { w: 740, h: 480 },
    minSize: { w: 380, h: 240 },
    dockGroup: "more",
  },
  {
    id: "editor",
    title: "Code",
    description: "Read the source behind MoOS",
    keywords: "code editor source ide typescript react programming",
    size: { w: 1000, h: 660 },
    minSize: { w: 520, h: 340 },
    dockGroup: "more",
  },
  {
    id: "browser",
    title: "Browser",
    description: "Portfolio pages and curated links",
    keywords: "browser web internet links pages navigate",
    size: { w: 1000, h: 680 },
    minSize: { w: 480, h: 360 },
    dockGroup: "more",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Theme, wallpaper, and personalization",
    keywords: "settings preferences theme dark light wallpaper accent dock motion",
    size: { w: 780, h: 580 },
    minSize: { w: 480, h: 400 },
    dockGroup: "more",
  },
  {
    id: "project",
    title: "Project",
    description: "Project details",
    keywords: "project",
    size: { w: 820, h: 680 },
    minSize: { w: 360, h: 360 },
    perRoute: true,
    internal: true,
  },
  {
    id: "reader",
    title: "Reader",
    description: "Text documents",
    keywords: "reader text document",
    size: { w: 640, h: 560 },
    minSize: { w: 340, h: 280 },
    perRoute: true,
    internal: true,
  },
];

export const appMeta = Object.fromEntries(appList.map((a) => [a.id, a])) as Record<AppId, AppMeta>;

export function isAppId(id: string): id is AppId {
  return Object.prototype.hasOwnProperty.call(appMeta, id);
}

export function windowIdFor(appId: AppId, route: string) {
  if (appMeta[appId].perRoute) return `${appId}:${route}`;
  return appId;
}
