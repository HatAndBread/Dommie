export const getDomDiffConfig = (afterDestroyCallbacks: { [key: string]: Function }) => {
  const needListeners: string[] = []; // Elements that need event listeners re-applied
  const needListenersRemoved: [string, string][] = []; // Elements that need event listeners removed
  const afterDestroys: Function[] = []; // After Destroy callbacks to be executed after the diff is applied
  let removedComponents: string[] = [];

  const config = {
    postVirtualDiffApply: function (d: any) {
      const findListenersIndex = (el: any) => {
        const index = el?.attributes?.["data-listener-index"];
        if (index) {
          needListeners.push(index);
        }
        el?.childNodes?.forEach((child: any) => {
          findListenersIndex(child);
        });
      };
      const handleRemove = (el: any) => {
        const elId = el?.attributes?.id;
        // Get After Destroy callbacks for any components that are removed
        if (afterDestroyCallbacks[elId]) {
          afterDestroys.push(afterDestroyCallbacks[elId]);
        }
        if (el?.nodeName === "COMPONENT" && elId) {
          removedComponents.push(elId);
        }
        el?.childNodes?.forEach((child: any) => {
          handleRemove(child);
        });
      };
      if (d.diff?.action === "addElement") {
        // Find all elements that need event listeners re-applied
        findListenersIndex(d.diff?.element);
      } else if (d.diff?.action === "modifyAttribute" && d.diff?.name === "data-listener-index") {
        const addIndex = d.diff?.newValue;
        const removeIndex = d.diff?.oldValue;
        needListenersRemoved.push([removeIndex, addIndex]);
        needListeners.push(addIndex);
      } else if (d.diff?.action === "removeElement") {
        handleRemove(d.node);
      } else if (d.diff?.action === "replaceElement") {
        findListenersIndex(d.diff?.newValue);
        handleRemove(d.diff?.oldValue);
      }
    },
  };
  return { config, afterDestroys, needListeners, needListenersRemoved, removedComponents };
};
