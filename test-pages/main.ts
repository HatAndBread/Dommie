import type { Template } from "../lib/app";
import { childWithAfterDestroy1 } from "./child-with-after-destroy-1";

export const main = (h: Template) => {
  return h.component(({ r, state }) => {
    const showAfterDestroy = state(false);
    const timesAfterDestroyCallbacksCalled = state(0);
    h.h1({ text: "This is the main page." });
    h.button({ text: "Go to page A", click: () => r.go("/page-a") });
    h.br();
    h.button({ text: "Go to the state test page", click: () => r.go("/state") });
    h.br();
    h.button({ text: "Go to the nested route", click: () => r.go("/nested/route") });
    h.br();
    h.button({
      text: "Go to test with wildcards",
      click: () => r.go("/this/123/is/456/a/789/test"),
    });
    h.br();
    h.button({
      text: "Go to test with wildcards 2",
      click: () => r.go("/this/123/is/456/a/789/test/abc"),
    });
    h.div({
      subscribe: timesAfterDestroyCallbacksCalled,
      id: "times-after-destroy-called-text",
      text: () => `Times afterDestroyed called: ${timesAfterDestroyCallbacksCalled.value}`,
    });
    h.div({ subscribe: showAfterDestroy }, () => {
      if (showAfterDestroy.value) {
        childWithAfterDestroy1(h, timesAfterDestroyCallbacksCalled);
      }
    });
    h.button({
      click: () => showAfterDestroy.update(!showAfterDestroy.value),
      text: "Toggle Show After Destroy",
      id: "toggle-show-after-destroy",
    });
  });
};
