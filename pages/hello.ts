import type { Template } from "../index.ts";
import { templater } from "../lib/templater.ts";
import button from "../components/button.ts";
import type { ClicksArgs } from "../client-lib/index.ts";

export const init = (request: Request) => {
  console.log("Here is the request!");
  console.log(request);
  return t(templater());
};

const state = {
  value: 0,
};

export const client = {
  increment: ({ replaceTargetInner, targets }: ClicksArgs) => {
    state.value++;
    replaceTargetInner(state.value);
  },
  decrement: ({ replaceTargetInner, targets }: ClicksArgs) => {
    state.value--;
    replaceTargetInner(state.value);
  },
  showSomething: ({ replaceTargetInner, targets }: ClicksArgs) => {
    const h = templater();
    console.log(targets);
    h.div(() => {
      h.text("Hello" + Math.random());
      h.div({ subscribes: [client.showSomething] }, () => {
        h.text("I am a div");
      });
    });
    replaceTargetInner(h.generate());
  },
};

export const t = (h: Template) => {
  h.div({ style: "background-color: red;", root: true }, () => {
    h.a({ href: "https://www.google.com" }, () => {
      h.text("I am a link");
    });
    h.text("I am some text");
    h.br();
    h.text("I am some more text");
    h.div({ subscribes: [client.decrement] }, () => {
      h.text(0);
    });
    h.small(() => {
      button(h, client.increment, client.decrement);
    });
    h.div(
      { id: "counter", subscribes: [client.increment, client.decrement] },
      () => {
        h.text("0");
      },
    );
    h.div({ subscribes: [client.showSomething] });
    h.comment("This is a comment!");
    h.button({ clicks: client.showSomething }, () => {
      h.text("show something");
    });
    h.script({
      src: "./index.js",
      type: "text/javascript",
    });
  });
  return h.generate();
};
