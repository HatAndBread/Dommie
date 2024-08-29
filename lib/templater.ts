import type { AllElements, Templater } from "./types.ts";
import { allEventListeners } from "./all-event-listeners.ts";
import { toSnakeCase } from "./strings.ts";
import { allHtmlElements, isSelfClosing } from "./html-elements.ts";
import { DiffDOM } from "diff-dom";

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
  const allElements = <Templater>{};
  for (const elementName of allHtmlElements) {
    // @ts-ignore
    allElements[elementName] = (optionsOrCb: any = {}, cb?: Function) =>
      $(elementName, optionsOrCb, cb);
  }
  const functionSubscribersMap = new Map<
    Function,
    [Element, () => HTMLElement | Comment][]
  >();
  const elementToEventListeners = new Map<Element, Map<string, Function>>();
  const listenerList = [];
  allElements.stateUpdater = (callback: Function) => {
    const getFuncWrapper = () => {
      const funcWrapper = (e: Event, args: any[] = []) => {
        const needListeners: string[] = [];
        const domDiffer = new DiffDOM({
          postVirtualDiffApply: function (d) {
            console.log("postVirtualDiffApply");
            console.log(d);
            if (
              d.diff?.action === "addElement" &&
              d.diff?.element?.attributes?.["data-listener-index"]
            ) {
              needListeners.push(
                d.diff.element.attributes["data-listener-index"],
              );
            }
          },
        });
        callback(e, ...args);
        const subscribers = functionSubscribersMap.get(funcWrapper);
        subscribers?.forEach((subscriber) => {
          const newEl = subscriber[1]();
          const oldEl = subscriber[0];
          const diff = domDiffer.diff(oldEl, newEl);
          console.log("HERE is needListeners");
          domDiffer.apply(oldEl, diff);
          needListeners.forEach((index) => {
            const listener = listenerList[parseInt(index)];
            if (!listener) {
              throw new Error("Listener not found!");
            }
            const elToApplyListenerTo = oldEl.querySelector(
              "[data-listener-index='" + index + "']",
            );
            if (elToApplyListenerTo) {
              console.log("🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷");
              elToApplyListenerTo.addEventListener(listener[1], listener[0]);
            }
          });
        });
      };
      return funcWrapper;
    };
    const wrapper = getFuncWrapper();
    functionSubscribersMap.set(wrapper, []);
    return wrapper;
  };
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
        console.log("not inside subscribe!");
        if (shouldAppend) {
          console.log(" inside subscribe!");
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
        const eventDefinition = optionsOrCb[key];
        const isArray = Array.isArray(eventDefinition);
        let func: Function;
        let args: any[] = [];
        if (!isArray) {
          func = eventDefinition;
        } else if (
          isArray &&
          eventDefinition.length < 3 &&
          typeof eventDefinition[0] === "function" &&
          (Array.isArray(eventDefinition[1]) ||
            eventDefinition[1] === undefined)
        ) {
          func = eventDefinition[0];
          if (eventDefinition[1]) args = eventDefinition[1];
        } else {
          throw new Error(
            `Event listener given a bad value. Recieved ${key}, ${eventDefinition}`,
          );
        }
        console.log(listenerList.length);
        const funcIndex = listenerList.findIndex((f) => f[0] === func);
        element.dataset.listenerIndex = (
          funcIndex === -1 ? listenerList.length : funcIndex
        ).toString();
        elementToEventListeners.set(element, new Map([[key, func]]));
        if (funcIndex === -1) {
          listenerList.push([(e: Event) => func(e, args), key]);
        }
        element.addEventListener(key, (e) => func(e, args));
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
