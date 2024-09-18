import { getDomDiffConfig } from "./dom-diff-config";
import { DiffDOM } from "diff-dom";
import type { StateUpdater, FuncSubscriberMap, ListenerList } from "./template-builder";
import type { StateSubscriptions } from "./types";

export const getStateUpdater = () => {
  const functionSubscribersMap: FuncSubscriberMap = new Map();
  const listenerList: ListenerList = new Map();
  const afterMountCallbacks: { [key: string]: Function } = {};
  const afterDestroyCallbacks: { [key: string]: Function } = {};
  const stateSubscriptions: StateSubscriptions = new Map();
  const stateUpdater: StateUpdater = () => {
    const getFuncWrapper = () => {
      const funcWrapper = async (e?: Event, args?: any[]) => {
        if (!args) args = [];
        // This function wraps all subscriber functions

        // Create a new instance of the diffDOM library
        const { config, afterDestroys, needListeners, needListenersRemoved, removedComponents } =
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
          needListenersRemoved.forEach(([oldValue, newValue]: [any, any]) => {
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
          needListeners.forEach((index: string) => {
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
        afterDestroys.forEach((cb: Function) => setTimeout(cb));
        // Remove "subscriptions" (state effects) from removed components
        removedComponents.forEach((id: string) => {
          stateSubscriptions.forEach((subs) => {
            if (subs[id]) {
              delete subs[id];
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
  return {
    functionSubscribersMap,
    stateSubscriptions,
    listenerList,
    stateUpdater,
    afterMountCallbacks,
    afterDestroyCallbacks,
  };
};
