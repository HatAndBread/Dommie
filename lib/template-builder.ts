import type { Templater } from "./types.ts";
import { allEventListeners } from "./all-event-listeners.ts";
import { toSnakeCase } from "./strings.ts";
import { allHtmlElements } from "./html-elements.ts";
import { DiffDOM } from "diff-dom";

type Context = {
  element: Element;
  parent: Element;
  tag: string;
  key: string;
  value: any;
  optionsOrCb: any;
  cb: Function | String | undefined;
  shouldAppend: boolean;
  functionSubscribersMap: FuncSubscriberMap;
  listenerList: ListenerList;
  text: string | undefined;
  $: (
    tag: string,
    optionsOrCb: any,
    cb?: Function | String,
    shouldAppend?: boolean,
  ) => Comment | HTMLElement;
};

let componentId = 0;
export function templateBuilder(root: Element) {
  const allElements = <Templater>{};
  for (const elementName of allHtmlElements) {
    // @ts-ignore
    allElements[elementName] = (
      optionsOrCb?: { [key: string]: any } | Function | String,
      cb?: Function,
    ) => {
      optionsOrCb;
      $(elementName, optionsOrCb, cb);
    };
  }

  setRef(allElements);
  const { functionSubscribersMap, listenerList } = setStateUpdater(allElements);
  const messages: { event: string; callback: Function }[] = [];
  setOn(allElements, messages);
  const nesting = [root];
  function $(tag: string, optionsOrCb: any, cb?: Function, shouldAppend = true) {
    const parent = nesting[nesting.length - 1];
    if (tag === "text") {
      const textNode = document.createTextNode(optionsOrCb);
      if (shouldAppend) parent.appendChild(textNode);
      return textNode;
    }
    if (tag === "comment") {
      const comment = document.createComment(optionsOrCb);
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
    if (tag === "component") {
      optionsOrCb = { style: "display: contents;" };
      if (shouldAppend) {
        componentId++;
        const id = `ghost-component-${componentId}`;
        element.id = id;
      }
    }
    if (!optionsOrCb) optionsOrCb = {};
    for (let key in optionsOrCb) {
      const context: Context = {
        element,
        parent,
        tag,
        key,
        value: optionsOrCb[key],
        optionsOrCb,
        cb,
        shouldAppend,
        functionSubscribersMap,
        listenerList,
        $,
      };
      if (key === "style" && typeof optionsOrCb[key] !== "string") {
        handleStyle(context);
      } else if (key === "text") {
        console.log(optionsOrCb, key);
        element.appendChild(document.createTextNode(optionsOrCb[key]));
      } else if (key === "subscribe") {
        handleSubscription(context);
      } else if (allEventListeners.includes(key)) {
        handleEventListeners(context);
      } else if (key === "ref") {
        handleRefs(context);
      } else {
        element.setAttribute(
          key,
          typeof optionsOrCb[key] === "function" ? optionsOrCb[key]() : optionsOrCb[key],
        );
      }
    }
    if (typeof cb === "function") {
      nesting.push(element);
      cb();
      nesting.pop();
      if (shouldAppend) {
        parent.appendChild(element);
      }
    } else if (cb) {
      throw new Error(`Callback must be a function! Recieved: ${cb}`);
    } else {
      if (shouldAppend) {
        parent.appendChild(element);
      }
    }
    return element;
  }
  return allElements;
}

const handleStyle = (context: Context) => {
  const style = Object.entries(context.value)
    .map(([styleKey, styleValue]) => {
      return `${toSnakeCase(styleKey)}: ${typeof styleValue === "function" ? styleValue() : styleValue};`;
    })
    .join(" ");
  context.element.setAttribute(context.key, style);
};

const handleSubscription = (context: Context) => {
  const { shouldAppend, value } = context;
  if (shouldAppend) {
    const funcs: Function[] = [];
    if (typeof value === "function") {
      funcs.push(value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => {
        if (typeof v === "function") {
          funcs.push(v);
        } else {
          throw new Error("Subscription array must contain only functions");
        }
      });
    }
    funcs.forEach((f) => {
      const regenerator = () => context.$(context.tag, context.optionsOrCb, context.cb, false);
      if (context.functionSubscribersMap.get(f)) {
        context.functionSubscribersMap.get(f)?.push([context.element, regenerator]);
      } else {
        context.functionSubscribersMap.set(f, [[context.element, regenerator]]);
      }
    });
  }
};

const handleEventListeners = (context: Context) => {
  const { listenerList, element, value, shouldAppend, key } = context;
  const eventDefinition = value;
  const isArray = Array.isArray(eventDefinition);
  let func: Function;
  let args: any[] = [];
  if (!isArray) {
    func = eventDefinition;
  } else if (
    isArray &&
    eventDefinition.length < 3 &&
    typeof eventDefinition[0] === "function" &&
    (Array.isArray(eventDefinition[1]) || eventDefinition[1] === undefined)
  ) {
    func = eventDefinition[0];
    if (eventDefinition[1]) args = eventDefinition[1];
  } else {
    throw new Error(`Event listener given a bad value. Recieved ${key}, ${eventDefinition}`);
  }
  const funcIndex = listenerList.findIndex((l) => l?.originalCallback === func);
  // @ts-ignore
  element.dataset.listenerIndex = (funcIndex === -1 ? listenerList.length : funcIndex).toString();
  if (funcIndex === -1) {
    listenerList.push({
      eventType: key,
      callback: async (e: Event) => await func(e, args),
      originalCallback: func,
    });
  }
  if (shouldAppend) {
    element.addEventListener(key, async (e) => await func(e, args));
  }
};

const handleRefs = ({ value, element }: Context) => {
  if (typeof value !== "function") {
    throw new Error("Ref must be a function");
  }
  value(element);
};

const setOn = (templater: Templater, messages: { event: string; callback: Function }[]) => {
  templater.on = (event: string, callback: Function) => {
    const updater = templater.stateUpdater(() => {});
    const wrapper = (...args: any[]) => {
      callback(...args);
      updater();
    };
    messages.push({ event, callback: wrapper });
    return updater;
  };
  templater.send = (event: string, data: any) => {
    messages.forEach((message) => {
      if (message.event === event) {
        message.callback(data);
      }
    });
  };
};

const setRef = (templater: Templater) => {
  templater._refs = [];
  const funcElementMap = new Map<Function, Element>();
  templater.ref = () => {
    const func = (el?: Element) => {
      if (el) {
        funcElementMap.set(func, el);
        templater._refs.push(el);
        return el;
      } else {
        return funcElementMap.get(func) || null;
      }
    };
    return func;
  };
};

type FuncSubscriberMap = Map<Function, [Element, () => HTMLElement | Comment][]>;
type ListenerList = ({
  eventType: string;
  callback: (e: Event) => any;
  originalCallback: Function;
} | null)[];

const setStateUpdater = (templater: Templater) => {
  const functionSubscribersMap: FuncSubscriberMap = new Map();
  const listenerList: ListenerList = [];
  templater.stateUpdater = (callback: Function) => {
    const getFuncWrapper = () => {
      const funcWrapper = async (e: Event, args: any[] = []) => {
        const needListeners: string[] = [];

        // Create a new instance of the diffDOM library
        const domDiffer = new DiffDOM({
          postVirtualDiffApply: function (d) {
            const listenerIndex = d.diff?.element?.attributes?.["data-listener-index"];
            if (d.diff?.action === "addElement" && listenerIndex) {
              // When an element is replaced, we need to reapply the event listener
              needListeners.push(listenerIndex);
            } else if (d.diff?.action === "removeElement" && listenerIndex) {
            }
          },
        });

        // ** This is the function that will be called when the state is updated
        await callback(e, ...args);
        // *********************************************************************

        const subscribers = functionSubscribersMap.get(funcWrapper);
        subscribers?.forEach((subscriber) => {
          const newEl = subscriber[1]();
          const oldEl = subscriber[0];
          const diff = domDiffer.diff(oldEl, newEl as HTMLElement);
          domDiffer.apply(oldEl, diff);
          newEl.remove();
          needListeners.forEach((index) => {
            const listener = listenerList[parseInt(index)];
            if (listener) {
              const elToApplyListenerTo = oldEl.querySelector(
                "[data-listener-index='" + index + "']",
              );
              if (elToApplyListenerTo) {
                elToApplyListenerTo.addEventListener(listener.eventType, listener.callback);
              }
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
  return { functionSubscribersMap, listenerList };
};

export class ComponentBase {
  public id: string;
  constructor(id: string) {
    this.id = id;
  }
}
/*
  String templater
*/

// export function templater() {
//   let template = "";
//   let whitespace = "";
//   const allElements = <AllElements>{};
//   for (const elementName of allHtmlElements) {
//     // @ts-ignore
//     allElements[elementName] = (optionsOrCb: any = {}, cb?: Function) =>
//       $(elementName, optionsOrCb, cb);
//   }
//   allElements.generate = () => {
//     const copy = template;
//     template = "";
//     return copy;
//   };
//   function $(
//     tag: string,
//     optionsOrCb: { [key: string]: string | number | Function[] | Function } | Function = {},
//     cb?: Function,
//   ) {
//     if (tag === "text") {
//       template += `${whitespace}${optionsOrCb}\n`;
//       return;
//     }
//     if (tag === "comment") {
//       template += `${whitespace}<!--${optionsOrCb}-->\n`;
//       return;
//     }
//     if (tag === "custom") {
//       // todo: add custom element
//       return;
//     }
//     if (typeof optionsOrCb === "function") {
//       cb = optionsOrCb;
//       optionsOrCb = {};
//     }
//     let options = "";
//     for (let key in optionsOrCb) {
//       if (key === "subscribes") {
//         const funcs = optionsOrCb[key] as Function[];
//         funcs.forEach((f) => (options += ` subscribes-${f.name}`));
//       } else if (key === "clicks") {
//         const func = optionsOrCb[key] as Function;
//         options += ` ${key}="${func.name}"`;
//       } else {
//         options += ` ${key}="${optionsOrCb[key]}"`;
//       }
//     }
//     if (typeof cb === "function") {
//       template += `${whitespace}<${tag}${options}>\n`;
//       whitespace += "  ";
//       cb();
//       whitespace = whitespace.slice(0, -2);
//       template += `${whitespace}</${tag}>\n`;
//     } else if (cb) {
//       throw new Error("Callback must be a function!");
//     } else {
//       if (isSelfClosing(tag)) {
//         template += `${whitespace}<${tag}${options} />\n`;
//       } else {
//         template += `${whitespace}<${tag}${options}></${tag}>\n`;
//       }
//     }
//     return allElements;
//   }
//   return allElements;
// }
