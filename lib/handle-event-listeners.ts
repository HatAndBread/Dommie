import type { Context } from "./template-builder";
let listenerId = 0;

export const handleEventListeners = (context: Context) => {
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
