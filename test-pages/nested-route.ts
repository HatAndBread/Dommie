import type { Template } from "../build/app";

export const nestedRoute = (h: Template) => {
  return h.component(() => {
    const { div, text, h1 } = h;
    div(() => {
      h1(() => {
        text("This is a nested route");
      });
    });
  });
};
