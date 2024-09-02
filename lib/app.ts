import type { Templater } from "./types";
import { templateBuilder, ComponentBase } from "./template-builder";

export type Component = (h: Templater) => ComponentBase;
export default (i: Component, el: string | HTMLElement) => {
  const element = typeof el === "string" ? document.querySelector(el) : el;
  if (!element && typeof el === "string") {
    console.error("No element found with css selector: " + el);
    return;
  } else if (!element) {
    console.error("No element found: " + el);
    return;
  }
  i(templateBuilder(element));
};
