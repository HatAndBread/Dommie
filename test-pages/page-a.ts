import type { Template, State } from "../lib/app.ts";

export const pageA = (h: Template) => {
  return h.component(({ afterMounted, afterDestroyed, ref, state, subscribe }) => {
    const { div, text, h1, input, button } = h;
    div(() => {
      h1(() => {
        text("Hello, This is page A!");
      });
    });
  });
};
