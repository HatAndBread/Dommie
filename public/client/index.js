// client/index.ts
var getClickArgs = (el, target) => {
  return {
    replaceInner: (replaceText) => {
      el.innerHTML = String(replaceText);
    },
    replaceOuter: (replaceText) => {
      el.outerHTML = String(replaceText);
    },
    replaceTargetInner: (replaceText) => {
      target.innerHTML = String(replaceText);
    },
    replaceTargetOuter: (replaceText) => {
      target.outerHTML = String(replaceText);
    },
    getReplace: () => {
    },
    postReplace: () => {
    },
    target,
    el
  };
};
var getClient = async () => {
  const path = window.location.pathname;
  const { client } = await import("public" + path);
  if (!client) {
    console.warn("No client found!");
  } else {
    document.querySelectorAll("[clicks]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const c = el.getAttribute("clicks");
        const targets = el.getAttribute("targets");
        const t = document.querySelector(targets);
        if (!t) {
          throw new Error("Target not found!");
        }
        if (!client[c]) {
          throw new Error("Click handler not found!");
        }
        client[c](getClickArgs(el, t));
      });
    });
  }
};
getClient();
