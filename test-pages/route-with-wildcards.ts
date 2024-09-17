import type { Template } from "../lib/app";

export const routeWithWildcards = (h: Template) => {
  return h.component(({ r }) => {
    console.log(r.pathVariables);
    const { div, text, h1, ul, li } = h;
    div(() => {
      h1(() => {
        text("This is a route with wildcards");
      });
      ul(() => {
        r.pathVariables.forEach((p: string, i) => {
          li({ text: p, id: `path-variable-${i}` });
        });
      });
    });
  });
};
