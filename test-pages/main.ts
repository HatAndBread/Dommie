import type { Template } from "../lib/app";
import { childWithAfterDestroy1 } from "./child-with-after-destroy-1";

export const main = (h: Template) => {
  return h.component(({ r, state }) => {
    const showAfterDestroy = state(false);
    const timesAfterDestroyCallbacksCalled = state(0);

    h.svg(
      {
        width: "100",
        height: "100",
        xmlns: "http://www.w3.org/2000/svg",
      },
      () => {
        h.circle({
          cx: "50",
          cy: "50",
          r: "40",
          stroke: "black",
          "stroke-width": "3",
          fill: "red",
        });
      },
    );
    h.h1({ text: "This is the main page." });
    h.button({ text: "Go to page A", id: "go-to-a-btn", click: () => r.go("/page-a") });
    h.br();
    h.button({
      text: "Go to the state test page",
      id: "go-to-state-btn",
      click: () => r.go("/state"),
    });
    h.br();
    h.button({
      text: "Go to the nested route",
      id: "go-to-nested-btn",
      click: () => r.go("/nested/route"),
    });
    h.br();
    h.button({
      text: "Go to test with wildcards",
      id: "go-to-wildcards-btn",
      click: () => r.go("/this/123/is/456/a/789/test"),
    });
    h.br();
    h.button({
      text: "Go to test with wildcards 2",
      id: "go-to-wildcards-2-btn",
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
    h.h1("A string as an arg.", () => {
      h.p("A string as a child.");
    });
    h.h1("A string with an option", {
      style: "color: red;",
    });
    h.h1({ style: "color: pink" }, "Another string with an option");
  });
};
