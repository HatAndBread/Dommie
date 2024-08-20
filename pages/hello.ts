import type { Template } from "../index.ts";
import type { ClicksArgs } from "../client/index.ts";
import { templater } from "../lib/templater.ts";
import button from "../components/button.ts";

export const init = () => {
  return t(templater());
};

export const client = {
  increment: ({ replaceTargetInner, target }: ClicksArgs) => {
    replaceTargetInner(parseInt(target.innerHTML) + 1);
  },
  decrement: ({ replaceTargetOuter, target }: ClicksArgs) => {
    replaceTargetOuter(parseInt(target.innerHTML) - 1);
  },
};

export const t = (h: Template) => {
  return h("div", { style: "background-color: red;" }, () => {
    h("a", () => {
      h("div");
    });
    h(["I am some text"]);
    h("br");
    h(["I am some more text"]);
    h("small", () => {
      button(h);
    });
    h("div", { id: "counter" }, () => {
      h(["0"]);
    });
    h("script", { src: "/public/index.js", type: "text/javascript" });
  });
};
