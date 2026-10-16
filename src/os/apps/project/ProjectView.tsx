import { allProjects } from "../../../data/content";
import { useOS } from "../../state/os";
import type { AppProps } from "../registry";
import ProjectDetails from "./ProjectDetails";

export default function ProjectView({ route }: AppProps) {
  const { openApp } = useOS();
  const project = allProjects.find((p) => p.slug === route);

  if (!project) {
    return (
      <div className="appState">
        <p className="appStateTitle">That project couldn't be found.</p>
        <p className="muted">The link may be out of date.</p>
        <button type="button" className="btn btnPrimary" onClick={() => openApp("finder", "projects")}>
          Browse all projects
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="appScroll">
        <div className="page">
          <ProjectDetails project={project} />
        </div>
      </div>
    </div>
  );
}
