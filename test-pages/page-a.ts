import type { Template, State } from "../lib/app.ts";

export const pageA = (h: Template) => {
  return h.component(({ afterMounted, afterDestroyed, ref, state, subscribe }) => {
    const { div, text, h1, input, button } = h;
    afterDestroyed(() => {
      console.log("Page A destroyed");
    });
    const thing = state("Change me!");
    const updateThing = () => {
      thing.update("I was changed!");
    };
    div(() => {
      h1(() => {
        text("Hello, This is page A!");
      });
      h.h3({ subscribe: thing, text: () => thing.value, id: "thing-text" });
      button({ click: updateThing, text: "Change the text", id: "change-text-btn" });
    });
  });
};
