import type { Templater } from "./types.ts";
import { allEventListeners } from "./all-event-listeners.ts";
import { toSnakeCase } from "./strings.ts";
import { allHtmlElements } from "./html-elements.ts";
import { DiffDOM } from "diff-dom";

const COMPONENT_TAG = "component";
const COMPONENT_ID_PREFIX = "ghost-component-";

type Context = {
  element: HTMLElement;
  parent: HTMLElement;
  tag: string;
  key: string;
  value: any;
  optionsOrCb: any;
  cb: Function | String | undefined;
  shouldAppend: boolean;
  functionSubscribersMap: FuncSubscriberMap;
  listenerList: ListenerList;
  $: (tag: string, optionsOrCb: any, cb?: any, shouldAppend?: boolean) => Comment | HTMLElement;
};

type MessagesList = { event: string; callback: Function; componentId: string }[];

let componentId = 0;
export function templateBuilder(root: HTMLElement) {
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

  const {
    functionSubscribersMap,
    listenerList,
    stateUpdater,
    messagesList,
    afterMountCallbacks,
    afterDestroyCallbacks,
  } = getStateUpdater();
  const nesting = [root];
  function $(tag: string, optionsOrCb: any, cb?: any, shouldAppend = true) {
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
    if (tag === COMPONENT_TAG) {
      optionsOrCb = { style: "display: contents;" };
      if (shouldAppend) {
        componentId++;
        const id = `${COMPONENT_ID_PREFIX}${componentId}`;
        element.id = id;
      }
    }
    const handleAppend = () => {
      if (!shouldAppend) return;
      parent.appendChild(element);
      if (tag === COMPONENT_TAG) {
        if (afterMountCallbacks[element.id]) {
          setTimeout(afterMountCallbacks[element.id]);
        }
      }
    };
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
      if (tag === COMPONENT_TAG) {
        const on = getOn(stateUpdater, element.id, messagesList);
        const send = getSend(messagesList);
        const afterMounted = (cb: () => void) => {
          afterMountCallbacks[element.id] = cb;
        };
        const afterDestroyed = (cb: () => void) => {
          afterDestroyCallbacks[element.id] = cb;
        };
        cb({ on, send, stateUpdater, afterMounted, afterDestroyed, ref });
      } else {
        cb();
      }
      nesting.pop();
      handleAppend();
    } else if (cb) {
      throw new Error(`Callback must be a function! Recieved: ${cb}`);
    } else {
      handleAppend();
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

let uniqueRefId = 0;
const ref = () => {
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

const handleRefs = ({ value, element }: Context) => {
  // value here is the closure in the ref function declared above 👆
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
  const afterMountCallbacks: { [key: string]: Function } = {};
  const afterDestroyCallbacks: { [key: string]: Function } = {};
  const stateUpdater = (callback: Function) => {
    const getFuncWrapper = () => {
      const funcWrapper = async (e?: Event, args?: any[]) => {
        if (!args) args = [];
        // This function wraps all subscriber functions

        // Create a new instance of the diffDOM library
        const { config, afterDestroys, needListeners } = getDomDiffConfig(
          afterDestroyCallbacks,
          messagesList,
        );
        const domDiffer = new DiffDOM(config);

        // ** This is the function that will be called when the state is updated
        await callback(e, ...args);
        // *********************************************************************

        const subscribers = functionSubscribersMap.get(funcWrapper);
        subscribers?.forEach((subscriber) => {
          const newEl = subscriber[1]();
          let oldEl = subscriber[0] as HTMLElement;
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
              oldEl = result as HTMLElement;
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
        // Exectute destroy callbacks
        afterDestroys.forEach((cb) => setTimeout(cb));
      };
      return funcWrapper;
    };
    const wrapper = getFuncWrapper();
    functionSubscribersMap.set(wrapper, []);
    return wrapper;
  };
  return {
    functionSubscribersMap,
    listenerList,
    stateUpdater,
    messagesList,
    afterMountCallbacks,
    afterDestroyCallbacks,
  };
};

const getDomDiffConfig = (
  afterDestroyCallbacks: { [key: string]: Function },
  messagesList: MessagesList,
) => {
  const needListeners: string[] = []; // Elements that need event listeners re-applied
  const afterDestroys: Function[] = []; // After Destroy callbacks to be executed after the diff is applied

  const config = {
    postVirtualDiffApply: function (d: any) {
      if (d.diff?.action === "addElement") {
        // Find all elements that need event listeners re-applied
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
        const isComponent = d.node?.nodeName === COMPONENT_TAG.toUpperCase();
        const elId = d.node?.attributes?.id;
        // Get After Destroy callbacks for any components that are removed
        if (afterDestroyCallbacks[elId]) {
          afterDestroys.push(afterDestroyCallbacks[elId]);
        }
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
  };
  return { config, afterDestroys, needListeners };
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
