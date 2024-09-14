import type { Templater } from "./types";
import { allEventListeners } from "./all-event-listeners";
import { toSnakeCase } from "./strings";
import { allHtmlElements, booleanAttributes } from "./html-elements";
import { DiffDOM } from "diff-dom";

const COMPONENT_TAG = "component";
const COMPONENT_ID_PREFIX = "dommie-component-";

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
      if (typeof optionsOrCb === "object" && optionsOrCb["nodeName"]) {
        tag = optionsOrCb["nodeName"];
        delete optionsOrCb["nodeName"];
      } else {
        throw new Error("Custom tag must have a nodeName property");
      }
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
      } else if (booleanAttributes.includes(key)) {
        if (optionsOrCb[key]) {
          element.setAttribute(key, "");
        }
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
        const state = getState(stateUpdater);
        const afterMounted = (cb: () => void) => {
          afterMountCallbacks[element.id] = cb;
        };
        const afterDestroyed = (cb: () => void) => {
          afterDestroyCallbacks[element.id] = cb;
        };
        cb({ afterMounted, afterDestroyed, ref, state });
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

let listenerId = 0;
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
  const myListenerId = listenerId.toString();
  element.dataset.listenerIndex = myListenerId;
  listenerId++;
  const callback = async (e: Event) => await func(e, ...args);
  const listener = {
    eventType: key,
    callback,
    originalCallback: func,
  };
  listenerList.set(myListenerId, listener);
  if (shouldAppend) {
    element.addEventListener(key, callback);
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

type FuncSubscriberMap = Map<Function, [Element, () => HTMLElement | Comment][]>;
type ListenerList = Map<
  string,
  {
    eventType: string;
    callback: (e: Event) => any;
    originalCallback: Function;
  } | null
>;

const getState = (stateUpdater: StateUpdater) => {
  const state = <T>(value: T) => {
    const updater = stateUpdater();
    const stateObject = {
      get value() {
        return value;
      },
      update(newValue: T) {
        value = newValue;
        updater();
      },
      get _updater() {
        return updater;
      },
    };
    return stateObject as StateObject<T>;
  };
  return state;
};

export type State = ReturnType<typeof getState>;
export interface StateObject<T> {
  value: T;
  update: (newValue: T) => void;
}
type StateUpdater = () => (e?: Event, args?: any[]) => void;
const getStateUpdater = () => {
  const functionSubscribersMap: FuncSubscriberMap = new Map();
  const listenerList: ListenerList = new Map();
  const afterMountCallbacks: { [key: string]: Function } = {};
  const afterDestroyCallbacks: { [key: string]: Function } = {};
  const stateUpdater: StateUpdater = () => {
    const getFuncWrapper = () => {
      const funcWrapper = async (e?: Event, args?: any[]) => {
        if (!args) args = [];
        // This function wraps all subscriber functions

        // Create a new instance of the diffDOM library
        const { config, afterDestroys, needListeners, needListenersRemoved } =
          getDomDiffConfig(afterDestroyCallbacks);
        const domDiffer = new DiffDOM(config);

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
          needListenersRemoved.forEach(([oldValue, newValue]) => {
            const listenerToRemove = listenerList.get(oldValue);
            let elToRemoveListenerFrom = oldEl.querySelector(
              "[data-listener-index='" + newValue + "']",
            );
            if (elToRemoveListenerFrom && listenerToRemove) {
              elToRemoveListenerFrom.removeEventListener(
                listenerToRemove.eventType,
                listenerToRemove.callback,
              );
            }
            listenerList.delete(oldValue);
          });
          needListeners.forEach((index) => {
            const listener = listenerList.get(index);
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
    afterMountCallbacks,
    afterDestroyCallbacks,
  };
};

const getDomDiffConfig = (afterDestroyCallbacks: { [key: string]: Function }) => {
  const needListeners: string[] = []; // Elements that need event listeners re-applied
  const needListenersRemoved: [string, string][] = []; // Elements that need event listeners removed
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
      } else if (d.diff?.action === "modifyAttribute" && d.diff?.name === "data-listener-index") {
        const addIndex = d.diff?.newValue;
        const removeIndex = d.diff?.oldValue;
        needListenersRemoved.push([removeIndex, addIndex]);
        needListeners.push(addIndex);
      } else if (d.diff?.action === "removeElement") {
        const elId = d.node?.attributes?.id;
        // Get After Destroy callbacks for any components that are removed
        if (afterDestroyCallbacks[elId]) {
          afterDestroys.push(afterDestroyCallbacks[elId]);
        }
      }
    },
  };
  return { config, afterDestroys, needListeners, needListenersRemoved };
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
