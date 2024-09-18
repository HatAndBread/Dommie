import type { Context } from "./template-builder";

let uniqueRefId = 0;

export const ref = () => {
  const id = uniqueRefId.toString();
  uniqueRefId++;
  return function (): HTMLElement | null {
    const el = arguments[0];
    if (el) {
      el.dataset.uniqueRefId = id;
      return null;
    } else {
      return document.querySelector('[data-unique-ref-id="' + id + '"]');
    }
  };
};

export const handleRefs = ({ value, element }: Context) => {
  // value here is the closure in the ref function declared above 👆
  if (typeof value !== "function") {
    throw new Error("Ref must be a function");
  }
  value(element);
};
