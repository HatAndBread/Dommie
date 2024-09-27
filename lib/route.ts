import type { ComponentBase } from "../lib/template-builder";
import type { State, Template } from "./app";
import type { Templater } from "../lib/types";

type Component = (h: Templater, ...args: any) => ComponentBase;
export type Routes = {
  [key: string]: (h: Templater, ...args: any) => ComponentBase;
};

export const r = {
  go: (path: string) => {
    console.error("Dommie router.go() was called before the router was initialized.");
  },
  pathVariables: {} as State<string[]>,
  pathVariablesMap: {} as State<{ [key: string]: string }>,
  path: {} as State<string>,
};

let rInitialized = false;

export const initR = (
  pathState: State<string>,
  pathVariableState: State<string[]>,
  pathVariableMapState: State<{ [key: string]: string }>,
) => {
  r.path = pathState;
  r.pathVariables = pathVariableState;
  r.pathVariablesMap = pathVariableMapState;
  r.go = (newPath: string) => {
    window.history.pushState({}, "", newPath);
    r.path.update(newPath);
  };
  rInitialized = true;
};

export type R = typeof r;

const useRoutes = (routes: Routes, h: Templater, notFound?: Component) => {
  let found = false;

  // Exact route
  for (const key in routes) {
    if (window.location.pathname === key) {
      routes[key](h);
      found = true;
      break;
    }
  }
  r.pathVariables.update([]);
  r.pathVariablesMap.update({});
  if (found) return;

  // Wildcard route
  const urlParts = window.location.pathname.split("/");
  urlParts.shift();
  const wildcard = "*";
  const pathVariables = [];
  const pathVariablesMap: { [key: string]: string } = {};
  keysLoop: for (const key in routes) {
    const parts = key.split("/");
    parts.shift();
    if (parts.length !== urlParts.length) continue;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === wildcard) {
        pathVariables.push(urlParts[i]);
        pathVariablesMap[parts[i - 1]] = urlParts[i];
      }
      if (parts[i] !== urlParts[i] && parts[i] !== wildcard) {
        continue keysLoop;
      }
    }
    found = true;
    r.pathVariables.update(pathVariables);
    r.pathVariablesMap.update(pathVariablesMap);
    routes[key](h);
    break;
  }
  if (found) return;

  r.pathVariables.update([]);
  r.pathVariablesMap.update({});
  // Not found
  if (notFound) {
    notFound(h);
    return;
  } else {
    h.div(() => {
      h.h1(() => {
        h.text("404 Not Found");
      });
    });
  }
};

let routerUses = 0;

export const router = (routes: Routes, h: Template, notFound?: Component) => {
  if (routerUses > 0) {
    throw new Error("Dommie router can only be called once");
  }
  routerUses++;
  if (!rInitialized) {
    throw new Error(
      `Dommie router used without being initialized. Did you forget to add the spa option? app(MyApp, "#app", {spa: true})`,
    );
  }
  h.component(({ r, afterDestroyed }) => {
    const popstate = () => {
      r.path.update(window.location.pathname);
    };
    window.addEventListener("popstate", popstate);
    afterDestroyed(() => {
      window.removeEventListener("popstate", popstate);
    });
    h.custom(
      { subscribe: r.path, style: { display: "contents" }, nodeName: "dommie-router" },
      () => {
        useRoutes(routes, h, notFound);
      },
    );
  });
};
