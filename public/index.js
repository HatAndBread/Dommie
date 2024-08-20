var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);

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
var exports_hello = {};
__export(exports_hello, {
  t: () => t,
  init: () => init,
  client: () => client
});
var init = () => {
  return t(templater());
}, client, t = (h) => {
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
var init_hello = __esm(() => {
  client = {
    increment: ({ replaceWith, target }) => {
      console.log("Ben done clicked!");
      replaceWith(parseInt(target.innerHTML) + 1);
    },
    decrement: ({ replaceWith, target }) => {
      replaceWith(parseInt(target.innerHTML) - 1);
    }
  };
});

// client/index.ts
var getClickArgs = (el, target) => {
  return {
    replaceWith: (replaceText) => {
      target.innerHTML = String(replaceText);
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
  const { client: client2 } = await Promise.resolve().then(() => (init_hello(), exports_hello));
  if (!client2) {
    console.warn("No client found!");
  } else {
    document.querySelectorAll("[clicks]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const c = el.getAttribute("clicks");
        const targets = el.getAttribute("targets");
        const t2 = document.querySelector(targets);
        if (!t2) {
          throw new Error("Target not found!");
        }
        if (!client2[c]) {
          throw new Error("Click handler not found!");
        }
        client2[c](getClickArgs(el, t2));
      });
    });
  }
};
getClient();
