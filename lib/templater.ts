import type { AllElements } from "./types.ts";
import { allEventListeners } from "./all-event-listeners.ts";
import { toSnakeCase } from "./strings.ts";
import { allHtmlElements, isSelfClosing } from "./html-elements.ts";

export function templater() {
  let template = "";
  let whitespace = "";
  const allElements = <AllElements>{};
  for (const elementName of allHtmlElements) {
    // @ts-ignore
    allElements[elementName] = (optionsOrCb: any = {}, cb?: Function) =>
      $(elementName, optionsOrCb, cb);
  }
  allElements.generate = () => {
    const copy = template;
    template = "";
    return copy;
  };
  function $(
    tag: string,
    optionsOrCb:
      | { [key: string]: string | number | Function[] | Function }
      | Function = {},
    cb?: Function,
  ) {
    if (tag === "text") {
      template += `${whitespace}${optionsOrCb}\n`;
      return;
    }
    if (tag === "comment") {
      template += `${whitespace}<!--${optionsOrCb}-->\n`;
      return;
    }
    if (tag === "custom") {
      // todo: add custom element
      return;
    }
    if (typeof optionsOrCb === "function") {
      cb = optionsOrCb;
      optionsOrCb = {};
    }
    let options = "";
    for (let key in optionsOrCb) {
      if (key === "subscribes") {
        const funcs = optionsOrCb[key] as Function[];
        funcs.forEach((f) => (options += ` subscribes-${f.name}`));
      } else if (key === "clicks") {
        const func = optionsOrCb[key] as Function;
        options += ` ${key}="${func.name}"`;
      } else {
        options += ` ${key}="${optionsOrCb[key]}"`;
      }
    }
    if (typeof cb === "function") {
      template += `${whitespace}<${tag}${options}>\n`;
      whitespace += "  ";
      cb();
      whitespace = whitespace.slice(0, -2);
      template += `${whitespace}</${tag}>\n`;
    } else if (cb) {
      throw new Error("Callback must be a function!");
    } else {
      if (isSelfClosing(tag)) {
        template += `${whitespace}<${tag}${options} />\n`;
      } else {
        template += `${whitespace}<${tag}${options}></${tag}>\n`;
      }
    }
    return allElements;
  }
  return allElements;
}

export function templater2(root: Element) {
  const allElements = <AllElements>{};
  for (const elementName of allHtmlElements) {
    // @ts-ignore
    allElements[elementName] = (optionsOrCb: any = {}, cb?: Function) =>
      $(elementName, optionsOrCb, cb);
  }
  const functionSubscribersMap = new Map<
    Function,
    [Element, () => HTMLElement | Comment][]
  >();
  const nesting = [root];
  function $(
    tag: string,
    optionsOrCb: any,
    cb?: Function,
    shouldAppend = true,
  ) {
    const parent = nesting[nesting.length - 1];
    if (tag === "text") {
      const node = document.createTextNode(optionsOrCb as string);
      if (shouldAppend) parent.appendChild(node);
      return node;
    }
    if (tag === "comment") {
      const comment = document.createComment("My comments");
      if (shouldAppend) parent.appendChild(comment);
      return comment;
    }
    if (tag === "custom") {
      // todo: add custom element
      //return allElements;
    }
    if (typeof optionsOrCb === "function") {
      cb = optionsOrCb;
      optionsOrCb = {};
    }
    const element = document.createElement(tag);
    for (let key in optionsOrCb) {
      if (key === "style" && typeof optionsOrCb[key] !== "string") {
        const style = Object.entries(optionsOrCb[key])
          .map(([styleKey, styleValue]) => {
            return `${toSnakeCase(styleKey)}: ${typeof styleValue === "function" ? styleValue() : styleValue};`;
          })
          .join(" ");
        element.setAttribute(key, style);
      } else if (key === "subscribe") {
        if (shouldAppend) {
          const funcs = optionsOrCb[key] as Function[];
          funcs.forEach((f) => {
            const regenerator = () => $(tag, optionsOrCb, cb, false);
            if (functionSubscribersMap.get(f)) {
              functionSubscribersMap.get(f)?.push([element, regenerator]);
            } else {
              functionSubscribersMap.set(f, [[element, regenerator]]);
            }
          });
        }
      } else if (allEventListeners.includes(key)) {
        let func: Function | undefined;
        let args: any[] = [];
        const eventDefinition = optionsOrCb[key];
        if (typeof eventDefinition === "function") {
          func = eventDefinition;
        } else if (
          Array.isArray(eventDefinition) &&
          typeof eventDefinition[0] === "function" &&
          (typeof eventDefinition[1] === "undefined" ||
            Array.isArray(eventDefinition[1]))
        ) {
          func = eventDefinition[0];
          if (eventDefinition[1]) {
            args = eventDefinition[1];
          }
        } else {
          throw new Error(
            `Listeners must be a function or an array of function and arguments. Recieved ${key}, ${eventDefinition}`,
          );
        }
        const funcWrapper = (e: Event) => {
          if (!func) {
            throw new Error("What??? 🤔");
          } else {
            func(e, ...args);
          }
          const subscribers = functionSubscribersMap.get(func);
          subscribers?.forEach((subscriber) => {
            const newEl = subscriber[1]();
            const oldEl = subscriber[0];
            Array.from(functionSubscribersMap.values()).forEach((subs) => {
              subs.forEach((sub) => {
                if (sub[0] === oldEl) {
                  sub[0] = newEl;
                }
              });
            });
            console.log(newEl);
            oldEl.replaceWith(newEl);
          });
        };
        element.addEventListener(key, funcWrapper);
      } else {
        element.setAttribute(
          key,
          typeof optionsOrCb[key] === "function"
            ? optionsOrCb[key]()
            : optionsOrCb[key],
        );
      }
    }
    if (typeof cb === "function") {
      nesting.push(element);
      cb();
      nesting.pop();
      if (shouldAppend) parent.appendChild(element);
    } else if (cb) {
      throw new Error("Callback must be a function!");
    } else {
      if (shouldAppend) parent.appendChild(element);
    }
    return element;
  }
  return allElements;
}
