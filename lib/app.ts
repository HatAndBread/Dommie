import type { Templater } from "./types";
import { templateBuilder, ComponentBase } from "./template-builder";

export type Component<T> = (h: Templater, props?: T) => ComponentBase;
export default (i: Component<undefined>, el: string | HTMLElement) => {
  const element = typeof el === "string" ? document.querySelector(el) : el;
  if (!element && typeof el === "string") {
    const err = "No element found with css selector: " + el;
    throw new Error(err);
  } else if (!element) {
    const err = "No element found: " + el;
    throw new Error(err);
  }
  i(templateBuilder(element as HTMLElement));
};
