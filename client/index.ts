// lib
const getClickArgs = (el: Element, target: Element) => {
  return {
    replaceInner: (replaceText: string | number) => {
      el.innerHTML = String(replaceText);
    },
    replaceOuter: (replaceText: string | number) => {
      el.outerHTML = String(replaceText);
    },
    replaceTargetInner: (replaceText: string | number) => {
      target.innerHTML = String(replaceText);
    },
    replaceTargetOuter: (replaceText: string | number) => {
      target.outerHTML = String(replaceText);
    },
    getReplace: () => {},
    postReplace: () => {},
    target,
    el,
  };
};

export type ClicksArgs = ReturnType<typeof getClickArgs>;

const getClient = async () => {
  const path = window.location.pathname;
  const { client }: { client: any } = await import("public" + path);
  if (!client) {
    console.warn("No client found!");
  } else {
    document.querySelectorAll("[clicks]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const c = el.getAttribute("clicks");
        const targets = el.getAttribute("targets");
        const t = document.querySelector(targets as string);
        if (!t) {
          throw new Error("Target not found!");
        }
        if (!client[c as string]) {
          throw new Error("Click handler not found!");
        }
        client[c as string](getClickArgs(el, t));
      });
    });
  }
};
getClient();
