import type { Template } from "../lib/app";

export const routeWithWildcards = (h: Template) => {
  return h.component(({ r }) => {
    console.log(r.pathVariables);
    console.log(r.pathVariablesMap);
    const { div, text, h1, ul, li } = h;
    div(() => {
      h1(() => {
        text("This is a route with wildcards");
      });
      ul(() => {
        r.pathVariables.value.forEach((p: string, i) => {
          li({ text: p, id: `path-variable-${i}` });
        });
      });
    });
  });
};
