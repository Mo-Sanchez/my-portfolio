import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { allProjects } from "../../data/content";
import { getNode, labelPath, splitPath } from "../fs";
import { appMeta, type AppId } from "./meta";

// Props every application receives from the window (or mobile screen) hosting it.
export type AppProps = {
  windowId: string;
  // App-specific location, mirrored into the URL hash for deep linking.
  route: string;
  setRoute: (route: string) => void;
  // True while the hosting window is focused and visible.
  active: boolean;
};

type AppComponent = LazyExoticComponent<ComponentType<AppProps>>;

// Each app is code-split and only downloaded the first time it opens.
export const appComponents: Record<AppId, AppComponent> = {
  finder: lazy(() => import("./finder/Finder")),
  about: lazy(() => import("./about/About")),
  experience: lazy(() => import("./experience/Experience")),
  resume: lazy(() => import("./resume/Resume")),
  contact: lazy(() => import("./contact/Contact")),
  terminal: lazy(() => import("./terminal/Terminal")),
  editor: lazy(() => import("./editor/CodeEditor")),
  browser: lazy(() => import("./browser/Browser")),
  settings: lazy(() => import("./settings/Settings")),
  project: lazy(() => import("./project/ProjectView")),
  reader: lazy(() => import("./reader/Reader")),
};

// Window titles depend on what the app is showing.
export function titleOf(appId: AppId, route: string) {
  if (appId === "project") {
    const project = allProjects.find((p) => p.slug === route);
    if (project) return project.name;
    return "Project not found";
  }
  if (appId === "reader") {
    const node = getNode(splitPath(route));
    if (node) return node.label;
    return "Reader";
  }
  if (appId === "finder") {
    const labels = labelPath(splitPath(route));
    if (labels.length) return labels[labels.length - 1];
    return "Home";
  }
  return appMeta[appId].title;
}
