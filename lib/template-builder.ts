import type { Templater, StateSubscriptions } from "./types";
import { allEventListeners } from "./all-event-listeners";
import { handleStyle } from "./handle-style";
import { handleSubscription } from "./handle-subscription";
import { handleEventListeners } from "./handle-event-listeners";
import { allHtmlElements, booleanAttributes } from "./html-elements";
import { r } from "./route";
import { getStateUpdater } from "./state-updater";
import { ref, handleRefs } from "./refs";

const COMPONENT_TAG = "component";
const COMPONENT_ID_PREFIX = "dommie-component-";

export type Context = {
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
    stateSubscriptions,
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
        const state = getState(stateUpdater, stateSubscriptions);
        const afterMounted = (cb: () => void) => {
          afterMountCallbacks[element.id] = cb;
        };
        const afterDestroyed = (cb: () => void) => {
          afterDestroyCallbacks[element.id] = cb;
        };
        const subscribe = getSubscribe(element.id, stateSubscriptions);
        cb({ afterMounted, afterDestroyed, ref, state, subscribe, r });
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

export type FuncSubscriberMap = Map<Function, [Element, () => HTMLElement | Comment][]>;
export type ListenerList = Map<
  string,
  {
    eventType: string;
    callback: (e: Event) => any;
    originalCallback: Function;
  } | null
>;

const getState = (stateUpdater: StateUpdater, stateSubscriptions: StateSubscriptions) => {
  const state = <T>(value: T) => {
    const updater = stateUpdater();
    const stateObject = {
      get value() {
        return value;
      },
      update(newValue: T) {
        value = newValue;
        updater();
        const subs = stateSubscriptions.get(updater);
        if (subs) {
          Object.values(subs).forEach((funcArray) => {
            funcArray.forEach((func) => func());
          });
        }
      },
      get _updater() {
        return updater;
      },
    };
    return stateObject as StateObject<T>;
  };
  return state;
};

const getSubscribe = (componentId: string, stateSubscriptions: StateSubscriptions) => {
  const subscribe = (callback: () => void, states: StateObject<any>[]) => {
    states.forEach((state) => {
      // @ts-ignore
      if (stateSubscriptions.get(state._updater)) {
        // @ts-ignore
        if (stateSubscriptions.get(state._updater)![componentId]) {
          // @ts-ignore
          stateSubscriptions.get(state._updater)![componentId].push(callback);
        } else {
          // @ts-ignore
          stateSubscriptions.get(state._updater)![componentId] = [callback];
        }
      } else {
        // @ts-ignore
        stateSubscriptions.set(state._updater, { [componentId]: [callback] });
      }
    });
  };
  return subscribe;
};
export type StateSubscriber = ReturnType<typeof getSubscribe>;

export type State = ReturnType<typeof getState>;
export interface StateObject<T> {
  value: T;
  update: (newValue: T) => void;
}
export type StateUpdater = () => (e?: Event, args?: any[]) => void;

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
