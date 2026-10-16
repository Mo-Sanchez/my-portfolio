// Single source of truth for site copy. Edit text here, not in components.
// Anything marked PLACEHOLDER still needs real details before publishing.

export const profile = {
  name: "Moises Sanchez",
  role: "Software Engineer · Operations & Automation",
  location: "Lakeland, Florida",
  email: "Moisessanchez6100@gmail.com",
  github: "https://github.com/Mo-Sanchez",
  linkedin: "https://www.linkedin.com/in/moises-sanchez-/",
  resume: `${import.meta.env.BASE_URL}Moises_Sanchez_Resume.pdf`,
  headline: "I build software that makes large-scale operations faster, cheaper, and easier to run.",
  intro:
    "Computer Science graduate from the University of Florida with five years inside Amazon Air's operations. " +
    "I find the manual, error-prone parts of a workflow, measure them, and replace them with tools people actually use.",
  status: "Open to software engineering, TPM, and technical program roles",
};

export type Metric = { value: string; label: string; detail: string };

export const metrics: Metric[] = [
  { value: "~$900K", label: "annual savings", detail: "Trailer loading process redesign" },
  { value: "94%", label: "less reporting time", detail: "Automated daily operations reports" },
  { value: "23%", label: "fewer shift labor hours", detail: "Headcount & labor optimization tool" },
  { value: "75%", label: "fewer ad-hoc shipments", detail: "From 64 to 16 per week" },
];

export const about = {
  paragraphs: [
    "I sit between engineering and operations. My degree is in Computer Science, and I've spent the last five years at Amazon Air planning aircraft loads under strict weight, balance, and timing constraints.",
    "That work taught me where software earns its keep: in the reports built by hand every shift, the staffing decisions made without data, and the processes that quietly cost money. I build internal tools and automation for those problems, then standardize the process so the improvement sticks.",
  ],
  focus: [
    { title: "Software & automation", text: "Internal tools in Java, C#, and Python that remove manual work." },
    { title: "Data-driven decisions", text: "Turning operational data into metrics, reports, and staffing plans." },
    { title: "Operations leadership", text: "Improving processes on the floor and getting teams to adopt them." },
  ],
  education: [
    { school: "University of Florida", credential: "B.S. Computer Science", date: "Dec 2025" },
    { school: "Polk State College", credential: "Associate of Arts", date: "Dec 2023" },
  ],
  certifications: [{ name: "AWS Certified Cloud Practitioner", date: "2026" }],
};

export type CaseStudy = {
  title: string;
  problem: string;
  action: string;
  result: string;
  metric: string;
};

export type Role = {
  company: string;
  title: string;
  location: string;
  period: string;
  summary: string;
  scope: string[];
  cases: CaseStudy[];
};

export const experience: Role[] = [
  {
    company: "Amazon Air",
    title: "Load Planner",
    location: "Lakeland, FL",
    period: "2021 — Present",
    summary:
      "Plan aircraft load configurations for an Amazon Air hub, balancing package dimensions, container types, and flight constraints to keep every departure within center-of-gravity limits and on schedule.",
    scope: [
      "Aircraft weight & balance planning",
      "Internal logistics simulation software",
      "Cross-shift process ownership",
      // PLACEHOLDER: add team leadership scope, e.g. "Led a team of N associates per shift"
      "[Placeholder: team size / leadership scope]",
    ],
    cases: [
      {
        title: "Trailer loading process",
        problem: "Inefficient trailer loading was forcing 64 ad-hoc shipments every week, each one an unplanned cost.",
        action: "Analyzed load and departure data to find the root causes, then redesigned and standardized the loading process across shifts.",
        result: "Ad-hoc shipments dropped from 64 to 16 per week.",
        metric: "~$900K saved annually",
      },
      {
        title: "Daily operations reporting",
        problem: "Daily operations reports were compiled by hand every shift, consuming hours of analyst time.",
        action: "Built a Java tool that ingests trailer load data from CSV, calculates on-time departure and cost metrics, and generates a formatted Excel report.",
        result: "Report time cut by 94%, freeing staff for operational work.",
        metric: "$1,200 / week in labor",
      },
      {
        title: "Labor planning",
        problem: "Shift staffing wasn't tied to actual volume, leading to overstaffed hours.",
        action: "Used operational data to build a headcount tracking and labor optimization tool that aligned staffing with workload.",
        result: "Shift labor hours reduced by nearly a quarter.",
        metric: "23% fewer labor hours",
      },
    ],
  },
];

export type ProjectCategory = "operations-tools" | "automation-ai" | "apps-games";

export const projectCategories: { id: ProjectCategory; label: string; description: string }[] = [
  { id: "operations-tools", label: "Operations Tools", description: "Internal tools used in live operations." },
  { id: "automation-ai", label: "Automation & AI", description: "Scrapers, pipelines, and assistants." },
  { id: "apps-games", label: "Apps & Games", description: "Products and team-built games." },
];

export type Project = {
  slug: string;
  category: ProjectCategory;
  name: string;
  tagline: string;
  problem: string;
  challenge: string;
  stack: string[];
  status?: string;
  image?: string;
  github?: string;
  demo?: string;
  note?: string;
};

export const featuredProjects: Project[] = [
  {
    slug: "mymedia",
    category: "apps-games",
    name: "MyMedia",
    status: "In development",
    // PLACEHOLDER: replace tagline/problem/challenge with MyMedia specifics
    tagline: "[Placeholder: one-sentence description of what MyMedia does and who it's for.]",
    problem: "[Placeholder: the problem MyMedia solves.]",
    challenge: "[Placeholder: the hardest technical or product decision so far, e.g. data model, sync, or search.]",
    stack: ["C#", "PostgreSQL"],
    // PLACEHOLDER: add github / demo / image once public
  },
  {
    slug: "aircraft-milestone-dashboard",
    category: "operations-tools",
    name: "Aircraft Milestone Dashboard",
    tagline: "A real-time operations dashboard that tracks each aircraft's critical milestones and counts down to departure.",
    problem: "Milestone status for each departing aircraft was spread across people and systems, so at-risk flights were hard to spot early.",
    challenge: "Keeping countdowns and milestone status consistent for every viewer in real time, while keeping the interface readable at a glance on a busy floor.",
    stack: ["C#", "Blazor", "Supabase", "PostgreSQL"],
    note: "Internal tool: source not public",
  },
  {
    slug: "trailer-delay-report",
    category: "operations-tools",
    name: "Trailer Delay Report Automation",
    tagline: "A desktop tool that turns raw trailer load data into a formatted, decision-ready Excel report in seconds.",
    problem: "Delay and on-time reporting was assembled manually every shift, which was slow and inconsistent.",
    challenge: "Handling messy CSV exports reliably and producing Excel output that matched the format leadership already used, so adoption required no retraining.",
    stack: ["Java", "Swing", "Apache POI"],
    note: "Internal tool: source not public",
  },
];

export const otherProjects: Project[] = [
  {
    slug: "flight-info-scraper",
    category: "automation-ai",
    name: "Flight Info Scraper & Webhook",
    tagline: "Scrapes flight information and posts formatted updates to a team chat via webhook, with modular timing, parsing, and delivery components.",
    problem: "",
    challenge: "",
    stack: ["Java", "Selenium"],
  },
  {
    slug: "phantom-sky",
    category: "apps-games",
    name: "Phantom Sky",
    tagline: "2D samurai-inspired action platformer with fast movement and precision combat, built with a student team.",
    problem: "",
    challenge: "",
    stack: ["Unity", "C#"],
    github: "https://github.com/Gator-Code-Studio/Phantom-Sky",
    demo: "https://play.unity.com/en/games/eeb6d377-a0eb-4fdb-98dc-824a55133886/phantom-sky",
  },
  {
    slug: "ai-voice-assistant",
    category: "automation-ai",
    name: "AI Voice Assistant",
    tagline: "Voice-driven assistant combining speech recognition, LLM text generation, and text-to-speech in one pipeline.",
    problem: "",
    challenge: "",
    stack: ["Python", "LLM APIs"],
  },
];

export const allProjects: Project[] = [...featuredProjects, ...otherProjects];

// Copy that still starts with "[Placeholder" is hidden in MoOS instead of shown raw.
export function isFilled(text: string | undefined): text is string {
  return Boolean(text && text.trim() && !text.trim().startsWith("[Placeholder"));
}

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["C#", "Java", "Python", "TypeScript / JavaScript", "SQL", "C++"] },
  { group: "Web & Applications", items: ["React", "Blazor", "HTML / CSS", "REST APIs", "Flask", "Java Swing"] },
  { group: "Data & Backend", items: ["PostgreSQL", "Supabase", "MongoDB", "Apache POI", "Selenium"] },
  { group: "Tools & Platforms", items: ["Git / GitHub", "AWS (EC2)", "Docker", "Linux", "JetBrains Rider", "Unity"] },
  {
    group: "Professional",
    items: ["Process Improvement", "Automation", "Data Analysis", "Technical Leadership", "Program Management"],
  },
];

export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
