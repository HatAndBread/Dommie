// client-lib/index.ts
var toPascalCase = (str) => (str.match(/[a-zA-Z0-9]+/g) || []).map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join("");
var camelize = (str) => {
  const pascaled = toPascalCase(str);
  return pascaled.charAt(0).toLowerCase() + pascaled.slice(1);
};

class ElementWrapper {
  el;
  constructor(el) {
    this.el = el;
    this.el = el;
  }
  insertInner(newEl) {
    const str = typeof newEl === "string" ? newEl : newEl.generate();
    this.el.innerHTML = str;
  }
  insertBefore(newEl) {
    const str = typeof newEl === "string" ? newEl : newEl.generate();
    this.el.insertAdjacentHTML("beforebegin", str);
  }
  insertAfter(newEl) {
    const str = typeof newEl === "string" ? newEl : newEl.generate();
    this.el.insertAdjacentHTML("afterend", str);
  }
  insertOuter(newEl) {
    const str = typeof newEl === "string" ? newEl : newEl.generate();
    this.el.outerHTML = str;
  }
  get id() {
    return this.el.id;
  }
}
var getClickArgs = (targets) => {
  const obj = {};
  targets.forEach((t) => {
    if (t?.id)
      obj[camelize(t.id)] = new ElementWrapper(t);
  });
  return obj;
};
var getClient = async () => {
  const path = window.location.pathname;
  const { client } = await import("./public/pages" + path + "hello.js");
  if (!client) {
    console.warn("No client found!");
  } else {
    document.querySelectorAll("[clicks]").forEach((el) => {
      const closestRoot = el.closest("[root]");
      if (!closestRoot) {
        throw new Error("Root not found!");
      }
      const descendentRoots = Array.from(closestRoot.querySelectorAll("[root]"));
      el.addEventListener("click", (e) => {
        const c = el.getAttribute("clicks");
        const subscribers = Array.from(closestRoot.querySelectorAll(`[subscribes-${c}]`)).filter((s) => {
          return descendentRoots.every((dr) => !dr.contains(s));
        });
        console.log("HEY subscribers!");
        console.log(subscribers);
        if (!client[c]) {
          throw new Error("Click handler not found!");
        }
        client[c](getClickArgs(subscribers), e, subscribers);
      });
    });
  }
};
getClient();
