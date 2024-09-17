import app, { router } from "../lib/app.ts";
import type { Template } from "../lib/app.ts";
import { pageA } from "./page-a.ts";
import { stateTest } from "./state-test.ts";
import { main } from "./main";
import { nestedRoute } from "./nested-route.ts";
import { routeWithWildcards } from "./route-with-wildcards.ts";
import { routeWithWildcards2 } from "./route-with-wildcards2.ts";

const t = (h: Template) => {
  return h.component(() => {
    const routes = {
      "/": main,
      "/state": stateTest,
      "/page-a": pageA,
      "/nested/route": nestedRoute,
      "/this/*/is/*/a/*/test": routeWithWildcards,
      "/this/*/is/*/a/*/test/*": routeWithWildcards2,
    };
    router(routes, h);
  });
};

app(t, "#app");
