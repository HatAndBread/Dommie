import type { Template, State } from "../lib/app";

const child = (h: Template, catData: State<string>) => {
  return h.component(({ afterMounted, afterDestroyed, ref, state, subscribe }) => {
    const { div, text, h1, input, button } = h;
    div(() => {});
  });
};

export { child };
