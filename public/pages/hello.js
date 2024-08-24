// lib/templater.ts
function templater2(root) {
  const allElements = {};
  for (const elementName of ALL_HTML_ELEMENTS) {
    allElements[elementName] = (optionsOrCb = {}, cb) => $(elementName, optionsOrCb, cb);
  }
  const functionSubcribersMap = new Map;
  const nesting = [root];
  function $(tag, optionsOrCb, cb, shouldAppend = true) {
    const parent = nesting[nesting.length - 1];
    if (tag === "text") {
      const node = document.createTextNode(optionsOrCb);
      if (shouldAppend)
        parent.appendChild(node);
      return node;
    }
    if (tag === "comment") {
      const comment = document.createComment("My comments");
      if (shouldAppend)
        parent.appendChild(comment);
      return comment;
    }
    if (tag === "custom") {
    }
    if (typeof optionsOrCb === "function") {
      cb = optionsOrCb;
      optionsOrCb = {};
    }
    const element = document.createElement(tag);
    for (let key in optionsOrCb) {
      if (key === "style" && typeof optionsOrCb[key] !== "string") {
        optionsOrCb[key] = Object.entries(optionsOrCb[key]).map(([styleKey, styleValue]) => {
          return `${toSnakeCase(styleKey)}: ${styleValue};`;
        }).join(" ");
      }
      if (key === "subscribe") {
        if (shouldAppend) {
          const funcs = optionsOrCb[key];
          funcs.forEach((f) => {
            const regenerator = () => $(tag, optionsOrCb, cb, false);
            if (functionSubcribersMap.get(f)) {
              functionSubcribersMap.get(f)?.push([element, regenerator]);
            } else {
              functionSubcribersMap.set(f, [[element, regenerator]]);
            }
          });
        }
      } else if (allEventListeners.includes(key)) {
        let func;
        let args = [];
        const eventDefinition = optionsOrCb[key];
        if (typeof eventDefinition === "function") {
          func = eventDefinition;
        } else if (Array.isArray(eventDefinition) && typeof eventDefinition[0] === "function" && (typeof eventDefinition[1] === "undefined" || Array.isArray(eventDefinition[1]))) {
          func = eventDefinition[0];
          if (eventDefinition[1]) {
            args = eventDefinition[1];
          }
        } else {
          throw new Error(`Listeners must be a function or an array of function and arguments. Recieved ${key}, ${eventDefinition}`);
        }
        const funcWrapper = (e) => {
          if (!func) {
            throw new Error("What??? \uD83E\uDD14");
          } else {
            func(...args);
          }
          const subscribers = functionSubcribersMap.get(func);
          subscribers?.forEach((subscriber) => {
            const newEl = subscriber[1]();
            const oldEl = subscriber[0];
            Array.from(functionSubcribersMap.values()).forEach((subs) => {
              subs.forEach((sub) => {
                if (sub[0] === oldEl) {
                  sub[0] = newEl;
                }
              });
            });
            oldEl.replaceWith(newEl);
          });
        };
        element.addEventListener(key, funcWrapper);
      } else {
        element.setAttribute(key, optionsOrCb[key]);
      }
    }
    if (typeof cb === "function") {
      nesting.push(element);
      cb();
      nesting.pop();
      if (shouldAppend)
        parent.appendChild(element);
    } else if (cb) {
      throw new Error("Callback must be a function!");
    } else {
      if (shouldAppend)
        parent.appendChild(element);
    }
    return element;
  }
  return allElements;
}
var allEventListeners = [
  "abort",
  "afterprint",
  "animationend",
  "animationiteration",
  "animationstart",
  "beforeprint",
  "beforeunload",
  "blur",
  "canplay",
  "canplaythrough",
  "change",
  "click",
  "contextmenu",
  "copy",
  "cut",
  "dblclick",
  "drag",
  "dragend",
  "dragenter",
  "dragleave",
  "dragover",
  "dragstart",
  "drop",
  "durationchange",
  "ended",
  "error",
  "focus",
  "focusin",
  "focusout",
  "fullscreenchange",
  "fullscreenerror",
  "hashchange",
  "input",
  "invalid",
  "keydown",
  "keypress",
  "keyup",
  "load",
  "loadeddata",
  "loadedmetadata",
  "loadstart",
  "message",
  "mousedown",
  "mouseenter",
  "mouseleave",
  "mousemove",
  "mouseover",
  "mouseout",
  "mouseup",
  "mousewheel",
  "offline",
  "online",
  "open",
  "pagehide",
  "pageshow",
  "paste",
  "pause",
  "play",
  "playing",
  "popstate",
  "progress",
  "ratechange",
  "resize",
  "reset",
  "scroll",
  "search",
  "seeked",
  "seeking",
  "select",
  "show",
  "stalled",
  "storage",
  "submit",
  "suspend",
  "timeupdate",
  "toggle",
  "touchcancel",
  "touchend",
  "touchmove",
  "touchstart",
  "transitionend",
  "unload",
  "volumechange",
  "waiting",
  "wheel"
];
var toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};
var ALL_HTML_ELEMENTS = [
  "a",
  "abbr",
  "acronym",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "comment",
  "custom",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fencedframe",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "meta",
  "meter",
  "nav",
  "nobr",
  "noembed",
  "noframes",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "plaintext",
  "portal",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "search",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "text",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "xmp"
];

// pages/hello.ts
var t = (h) => {
  let value = 0;
  let width = 100;
  const stuff = [];
  const updateWidth = () => width += 1;
  const updateValue = (v) => {
    value += v;
  };
  const addToStuff = () => {
    stuff.push((stuff[stuff.length - 1] || 0) + 11);
  };
  return h.div({ style: "background-color: red;" }, () => {
    h.a({ href: "https://www.google.com" }, () => {
      h.text("I am a link");
    });
    h.text("I am some text");
    h.br();
    h.text("I am some more text");
    h.div({ subscribe: [updateValue] }, () => {
      h.text(value);
    });
    h.button({ click: [updateValue, [1]] }, () => {
      h.text("Increment");
    });
    h.button({ click: [updateValue, [-1]] }, () => {
      h.text("Decrement");
    });
    h.button({ click: addToStuff }, () => {
      h.text("Add to stuff");
    });
    h.ul({ subscribe: [addToStuff] }, () => {
      stuff.forEach((thing) => {
        h.li({ style: { backgroundColor: "orange" } }, () => {
          h.text(`I am a list item with value: ${thing}`);
        });
      });
    });
    h.div({ subscribe: [updateWidth] }, () => {
      h.div({
        style: {
          backgroundColor: "pink",
          width: `${width}px`,
          height: "100px"
        },
        mouseover: updateWidth
      }, () => {
        h.text("mouse over me");
      });
    });
    h.comment("This is a comment!");
  });
};
var app = (i, id) => {
  const el = document.getElementById(id);
  if (!el) {
    console.error("No element found with id: " + id);
    return;
  }
  const x = templater2(el);
  i(x);
  console.log(x);
};
app(t, "app");
