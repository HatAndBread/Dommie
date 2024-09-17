import type { Template } from "../lib/app";

export const main = (h: Template) => {
  return h.component(({ r }) => {
    h.h1({ text: "This is the main page." });
    h.button({ text: "Go to page A", click: () => r.go("/page-a") });
    h.br();
    h.button({ text: "Go to the state test page", click: () => r.go("/state") });
  });
};
