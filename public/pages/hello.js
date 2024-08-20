// lib/templater.ts
function templater() {
  let template = "";
  function $(tag, optionsOrCb = {}, cb) {
    if (Array.isArray(tag)) {
      template += tag.join("\n");
      return template;
    }
    if (typeof optionsOrCb === "function") {
      cb = optionsOrCb;
      optionsOrCb = {};
    }
    let options = "";
    for (let key in optionsOrCb) {
      options += ` ${key}="${optionsOrCb[key]}"`;
    }
    if (typeof cb === "function") {
      template += `<${tag}${options}>`;
      cb();
      template += `</${tag}>`;
    } else if (cb) {
      throw new Error("Callback must be a function!");
    } else {
      template += `<${tag}${options}></${tag}>`;
    }
    return template;
  }
  return $;
}

// components/button.ts
function button_default(h) {
  h("button", {
    style: "background-color: green;",
    clicks: "increment",
    targets: "#counter"
  }, () => {
    h(["Increment"]);
  });
  h("button", {
    style: "background-color: orange;",
    clicks: "decrement",
    targets: "#counter"
  }, () => {
    h(["Decrement"]);
  });
}

// pages/hello.ts
var init = () => {
  return t(templater());
};
var client = {
  increment: ({ replaceTargetInner, target }) => {
    replaceTargetInner(parseInt(target.innerHTML) + 1);
  },
  decrement: ({ replaceTargetOuter, target }) => {
    replaceTargetOuter(parseInt(target.innerHTML) - 1);
  }
};
var t = (h) => {
  return h("div", { style: "background-color: red;" }, () => {
    h("a", () => {
      h("div");
    });
    h(["I am some text"]);
    h("br");
    h(["I am some more text"]);
    h("small", () => {
      button_default(h);
    });
    h("div", { id: "counter" }, () => {
      h(["0"]);
    });
    h("script", { src: "/public/index.js", type: "text/javascript" });
  });
};
export {
  t,
  init,
  client
};
