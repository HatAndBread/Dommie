import type { Templater } from "./types";
import { templateBuilder, ComponentBase } from "./template-builder";

export type Component = (h: Templater, ...args: any) => ComponentBase;
export type Template = Templater;
export default (i: Component, el: string | HTMLElement) => {
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
