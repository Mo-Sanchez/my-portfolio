import { useEffect } from "react";
import About from "./components/About";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import { profile } from "../data/content";
import "./classic.css";

// Fade elements marked [data-reveal] in once as they scroll into view.
// CSS only hides them when the `reveal` class is present, so content stays
// visible without JS and for users who prefer reduced motion.
function useReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("isVisible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      root.classList.remove("reveal");
    };
  }, []);
}

// Sections render after the browser tries to resolve the URL hash,
// so deep links like /#projects need a nudge once the page exists.
function useInitialHashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);
}

export default function App() {
  useReveal();
  useInitialHashScroll();

  return (
    <>
      <a className="skipLink" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <footer className="footer">
        <div className="container footerInner">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p>
            Built with React, TypeScript &amp; Vite. <a href={import.meta.env.BASE_URL}>Open the MoOS desktop</a>
          </p>
        </div>
      </footer>
    </>
  );
}
