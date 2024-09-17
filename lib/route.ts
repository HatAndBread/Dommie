import type { ComponentBase } from "../lib/template-builder";
import type { Templater } from "../lib/types";

type Component = (h: Templater, ...args: any) => ComponentBase;
export type Routes = {
  [key: string]: (h: Templater, ...args: any) => ComponentBase;
};

export const r = {
  go: (path: string) => {
    console.error("Dommie router.go() was called before the router was initialized.");
  },
  pathVariables: [] as string[],
};

export type R = typeof r;

const useRoutes = (routes: Routes, h: Templater, notFound?: Component) => {
  r.pathVariables = [];
  let found = false;

  // Exact route
  for (const key in routes) {
    if (window.location.pathname === key) {
      routes[key](h);
      found = true;
      break;
    }
  }
  if (found) return;

  // Wildcard route
  const urlParts = window.location.pathname.split("/");
  urlParts.shift();
  const wildcard = "*";
  const pathVariables = [];
  keysLoop: for (const key in routes) {
    const parts = key.split("/");
    parts.shift();
    if (parts.length !== urlParts.length) continue;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === wildcard) pathVariables.push(urlParts[i]);
      if (parts[i] !== urlParts[i] && parts[i] !== wildcard) {
        continue keysLoop;
      }
    }
    found = true;
    r.pathVariables = pathVariables;
    routes[key](h);
    break;
  }
  if (found) return;

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

export const router = (routes: Routes, h: Templater, notFound?: Component) => {
  if (routerUses > 0) {
    throw new Error("Dommie router can only be called once");
  }
  routerUses++;
  h.component(({ state, afterDestroyed }) => {
    const path = state(window.location.pathname);
    const popstate = () => {
      path.update(window.location.pathname);
    };
    window.addEventListener("popstate", popstate);
    afterDestroyed(() => {
      window.removeEventListener("popstate", popstate);
    });
    r.go = (newPath: string) => {
      window.history.pushState({}, "", newPath);
      path.update(newPath);
    };
    h.custom({ subscribe: path, style: { display: "contents" }, nodeName: "dommie-router" }, () => {
      useRoutes(routes, h, notFound);
    });
  });
};
