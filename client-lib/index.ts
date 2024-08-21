// lib
const getClickArgs = (el: Element, targets: Element[], event: Event) => {
  return {
    replaceInner: (replaceText: string | number) => {
      el.innerHTML = String(replaceText);
    },
    replaceOuter: (replaceText: string | number) => {
      el.outerHTML = String(replaceText);
    },
    // TODO: Check for listeners, remove them, and add new ones
    replaceTargetInner: (replaceText: string | number) => {
      targets.forEach((t) => {
        t.innerHTML = String(replaceText);
      });
    },
    replaceTargetOuter: (replaceText: string | number) => {
      targets.forEach((t) => {
        t.outerHTML = String(replaceText);
      });
    },
    getReplace: () => {},
    postReplace: () => {},
    targets,
    el,
    event,
  };
};

export type ClicksArgs = ReturnType<typeof getClickArgs>;

const getClient = async () => {
  const path = window.location.pathname;
  const { client }: { client: any } = await import(
    "./public/pages" + path + "hello.js"
  );
  if (!client) {
    console.warn("No client found!");
  } else {
    document.querySelectorAll("[clicks]").forEach((el) => {
      const closestRoot = el.closest("[root]");
      if (!closestRoot) {
        throw new Error("Root not found!");
      }
      const descendentRoots = Array.from(
        closestRoot.querySelectorAll("[root]"),
      );
      el.addEventListener("click", (e) => {
        const c = el.getAttribute("clicks");
        const subscribers = Array.from(
          closestRoot.querySelectorAll(`[subscribes-${c}]`),
        ).filter((s) => {
          return descendentRoots.every((dr) => !dr.contains(s));
        });

        console.log("HEY subscribers!");
        console.log(subscribers);
        if (!client[c as string]) {
          throw new Error("Click handler not found!");
        }
        client[c as string](getClickArgs(el, subscribers, e));
      });
    });
  }
};
getClient();
