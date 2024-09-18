import type { Context } from "./template-builder";

let uniqueSubId = 0;

export const handleSubscription = (context: Context) => {
  const { shouldAppend, value } = context;
  if (shouldAppend) {
    const funcs: Function[] = [];
    if (typeof value === "function") {
      funcs.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => {
        if (typeof v === "function") {
          funcs.push(v);
        } else if (typeof v === "object" && typeof v._updater === "function") {
          funcs.push(v._updater);
        } else {
          throw new Error("Subscription array must contain only functions");
        }
      });
    } else if (typeof value === "object" && typeof value._updater === "function") {
      funcs.push(value._updater);
    }
    funcs.forEach((f) => {
      const regenerator = () => context.$(context.tag, context.optionsOrCb, context.cb, false);
      uniqueSubId++;
      context.element.dataset.uniqueSubId = `${uniqueSubId}`;
      if (context.functionSubscribersMap.get(f)) {
        context.functionSubscribersMap.get(f)?.push([context.element, regenerator]);
      } else {
        context.functionSubscribersMap.set(f, [[context.element, regenerator]]);
      }
    });
  }
};
