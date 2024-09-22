import type { Template } from "../lib/app";

export const nestedRoute = (h: Template) => {
  return h.component(() => {
    const { div, text, h1 } = h;
    div(() => {
      h1({ id: "nested-route-h1" }, () => {
        text("This is a nested route");
      });
    });
  });
};
