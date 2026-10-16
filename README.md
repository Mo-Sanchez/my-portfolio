# Moises Sanchez — Portfolio (MoOS)

Personal portfolio built with React 19, TypeScript, and Vite. It's presented as **MoOS**, a small
desktop operating system in the browser, with windows, a dock, a launcher, a terminal, and a file
explorer, all filled with real portfolio content. Deployed to GitHub Pages at
https://mo-sanchez.github.io/my-portfolio/

MoOS is designed so a first-time visitor doesn't need to know how it works:

- It opens on a **Home** window ("Start here") with the essentials and four big buttons: Projects,
  Experience, Résumé, and Contact.
- The dock shows only the portfolio sections, with labels. Terminal, Code, Browser, and Settings sit
  behind **More**.
- Desktop icons and project files open with a single click.
- **One window at a time** (on by default, under Settings › Dock & Windows): opening something hides
  the other windows, and closing it brings back the one before, much like a Back button.
- A **Simple view** link in the menu bar switches to a regular scrolling page.

The original single-page portfolio is still available at
[`?view=classic`](https://mo-sanchez.github.io/my-portfolio/?view=classic).

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build
npm run lint
npm test          # unit tests (Vitest)
npm run deploy    # build and publish dist/ to gh-pages
```

## Editing content

All copy lives in [`src/data/content.ts`](src/data/content.ts): profile, impact metrics, experience
case studies, projects, and skills. MoOS apps, the terminal's virtual filesystem, and the launcher's
search index are all generated from it, so editing that one file updates everywhere.
Search for `PLACEHOLDER` to find details that still need filling in. MoOS hides any text that starts
with `[Placeholder`, but the classic view still shows it.

- **Projects:** each project has a `slug` (used in links like `#/project/phantom-sky`) and a
  `category` (`operations-tools`, `automation-ai`, or `apps-games`), which decides its folder in the Projects app.
- **Project screenshots:** put an image in `src/images/`, import it in `content.ts`, and set the
  project's `image` field. Projects without one show a designed cover with their name and stack.
- **Résumé:** replace `public/Moises_Sanchez_Resume.pdf` (keep the filename).
- **Social preview:** add `public/og-image.png` (1200×630) and uncomment the `og:image` tag in `index.html`.

## Wallpaper

The default wallpaper should be the misty mountain forest photograph. **That photo isn't in the
repository yet**, so MoOS currently uses a generated stand-in in the same palette
(`src/assets/wallpapers/generated/`, made by `node scripts/generate-wallpapers.mjs`).

To use the real photo, save it as `src/assets/wallpapers/misty-forest.jpg` (or `.webp`/`.png`,
ideally 2560px wide or larger and compressed to roughly 300–600 KB). It's picked up at build time and
replaces the stand-in automatically. Any other image you add to that folder appears as an extra
choice in Settings › Wallpaper.

## Deep links

The URL hash mirrors the focused window, so links can point straight at content and the browser's
Back/Forward buttons move between windows:

| Link                         | Opens                                   |
| ---------------------------- | --------------------------------------- |
| (no hash)                    | Home (on phones, the home screen)       |
| `#/finder/projects`          | Projects, showing every project         |
| `#/project/<slug>`           | A project's detail window               |
| `#/experience/<case-study>`  | Experience, with a case study selected  |
| `#/about/skills`             | About Me, scrolled to Skills            |
| `#/resume`                   | Résumé viewer                           |
| `#/contact`                  | Contact                                 |
| `#/settings/wallpaper`       | Settings › Wallpaper                    |

Old single-page anchors (`#projects`, `#experience`, `#skills`, `#contact`, ...) still work. An
unknown link lands on Home.

## Keyboard shortcuts

| Keys                     | Action                                     |
| ------------------------ | ------------------------------------------ |
| Ctrl/⌘ + K               | Search apps, projects, skills, and actions |
| Ctrl/⌘ + ,               | Settings                                   |
| Alt + Shift + W / M      | Close / minimize the focused window        |
| Alt + Shift + ↑          | Maximize or restore                        |
| Alt + Shift + ← / →      | Snap left / right                          |
| Alt + Shift + ↓          | Unsnap, restore, or minimize               |
| Alt + Shift + `          | Cycle windows                              |

## Structure

```
index.html                SEO metadata, Open Graph, JSON-LD
public/                   favicon, robots.txt, résumé PDF
scripts/                  wallpaper generator
src/main.tsx              picks MoOS or the classic view
src/data/content.ts       all site content (single source of truth)
src/classic/              the original single-page portfolio (?view=classic)
src/os/
  MoOS.tsx                root: providers, wallpaper, desktop or mobile shell
  state/                  window manager reducer, settings, hash router, OS context
  shell/                  menu bar, dock, desktop icons, windows, launcher, menus, notifications
  mobile/                 phone home screen with full-screen apps
  apps/                   one folder per app (code-split; each loads its own CSS)
    meta.ts, registry.tsx app metadata and lazy components
  fs.ts                   virtual filesystem shared by Projects, Terminal, and Reader
  search.ts               launcher search index
  styles/                 design tokens (base.css), shell, shared app layout, mobile
```

Conventions: MoOS code doesn't use the ternary operator (`no-ternary` is enforced by ESLint for
`src/os`). User preferences are stored in `localStorage` under `moos:*` keys; nothing requires an
account or a backend. The contact form opens the visitor's email app (a `mailto:` link) because
there's no server to send mail from.
