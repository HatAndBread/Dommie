import type { Template } from "../lib/app";

export const routeWithWildcards2 = (h: Template) => {
  return h.component(({ r }) => {
    console.log(r.pathVariables);
    const { div, text, h1, ul, li } = h;
    div(() => {
      h1(() => {
        text("This is the second route with wildcards");
      });
      ul(() => {
        r.pathVariables.forEach((p: string) => {
          li({ text: p });
        });
      });
    });
  });
};
