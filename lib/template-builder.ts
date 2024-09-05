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

type MessagesList = { event: string; callback: Function; componentId: string }[];

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

  const refs: Element[] = [];
  const ref = getRef(refs);
  const { functionSubscribersMap, listenerList, stateUpdater, messagesList } = getStateUpdater();
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
        element.appendChild(
          document.createTextNode(
            typeof optionsOrCb[key] === "function" ? optionsOrCb[key]() : optionsOrCb[key],
          ),
        );
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
      if (tag === "component") {
        const on = getOn(stateUpdater, element.id, messagesList);
        const send = getSend(messagesList);
        cb({ on, send, stateUpdater, ref });
      } else {
        cb();
      }
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

let uniqueSubId = 0;
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

const getOn = (
  stateUpdater: Function,
  componentId: string,
  messages: { event: string; callback: Function; componentId: string }[],
) => {
  return (event: string, callback: Function) => {
    const updater = stateUpdater(() => {});
    const wrapper = (...args: any[]) => {
      callback(...args);
      updater();
    };
    messages.push({ componentId, event, callback: wrapper });
    return updater;
  };
};

const getSend = (messages: { event: string; callback: Function }[]) => {
  return (event: string, data: any) => {
    messages.forEach((message) => {
      if (message.event === event) {
        message.callback(data);
      }
    });
  };
};

const getRef = (refs: Element[]) => {
  const funcElementMap = new Map<Function, Element>();
  return () => {
    const func = (el?: Element) => {
      if (el) {
        funcElementMap.set(func, el);
        refs.push(el);
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

const getStateUpdater = () => {
  const messagesList: MessagesList = [];
  const functionSubscribersMap: FuncSubscriberMap = new Map();
  const listenerList: ListenerList = [];
  const stateUpdater = (callback: Function) => {
    const getFuncWrapper = () => {
      const funcWrapper = async (e: Event, args: any[] = []) => {
        const needListeners: string[] = [];

        // Create a new instance of the diffDOM library
        const domDiffer = new DiffDOM({
          postVirtualDiffApply: function (d) {
            if (d.diff?.action === "addElement") {
              const findListenersIndex = (el: any) => {
                const index = el?.attributes?.["data-listener-index"];
                if (index) {
                  needListeners.push(index);
                }
                el?.childNodes?.forEach((child: any) => {
                  findListenersIndex(child);
                });
              };
              findListenersIndex(d.diff?.element);
            } else if (d.diff?.action === "removeElement") {
              const elId = d.node?.attributes?.id;
              const isComponent = d.node?.nodeName === "COMPONENT";
              // Clean up after component is removed from the dom
              if (elId && isComponent) {
                // remove all messages for this component
                messagesList.forEach((message, i) => {
                  if (message.componentId === elId) {
                    messagesList.splice(i, 1);
                  }
                });
              }
            }
          },
        });

        // ** This is the function that will be called when the state is updated
        await callback(e, ...args);
        // *********************************************************************

        const subscribers = functionSubscribersMap.get(funcWrapper);
        subscribers?.forEach((subscriber) => {
          const newEl = subscriber[1]();
          let oldEl = subscriber[0];
          const diff = domDiffer.diff(oldEl, newEl as HTMLElement);
          if (!document.body.contains(oldEl)) {
            // If the element is not in the dom yet, we need to add it.
            // This happens when a component is rendered after the initial render
            // e.g. a subscribe inside a conditional that is added and removed
            const uniqueId = oldEl.dataset.uniqueSubId;
            // can we do this closer to the actual element?
            const result = document.body.querySelector(`[data-unique-sub-id="${uniqueId}"]`);
            if (result) {
              const diff = domDiffer.diff(result, newEl as HTMLElement);
              domDiffer.apply(result, diff);
              subscriber[0] = result;
              oldEl = result;
            }
          } else {
            domDiffer.apply(oldEl, diff);
          }
          newEl.remove();
          needListeners.forEach((index) => {
            const listener = listenerList[parseInt(index)];
            if (listener) {
              let elToApplyListenerTo = oldEl.querySelector(
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
  return { functionSubscribersMap, listenerList, stateUpdater, messagesList };
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
