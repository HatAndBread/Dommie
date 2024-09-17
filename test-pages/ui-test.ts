import app, { router } from "../lib/app.ts";
import type { Template } from "../lib/app.ts";
import { pageA } from "./page-a.ts";
import { stateTest } from "./state-test.ts";
import { main } from "./main";

const t = (h: Template) => {
  return h.component(() => {
    const routes = {
      "/": main,
      "/state": stateTest,
      "/page-a": pageA,
    };
    router(routes, h);
  });
};

app(t, "#app");
