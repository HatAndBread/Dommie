// lib/all-event-listeners.ts
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

// lib/strings.ts
var toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace("_", "-");
};

// lib/html-elements.ts
var allHtmlElements = [
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

// lib/templater.ts
function templater2(root) {
  const allElements = {};
  for (const elementName of allHtmlElements) {
    allElements[elementName] = (optionsOrCb = {}, cb) => $(elementName, optionsOrCb, cb);
  }
  const functionSubscribersMap = new Map;
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
        const style = Object.entries(optionsOrCb[key]).map(([styleKey, styleValue]) => {
          return `${toSnakeCase(styleKey)}: ${typeof styleValue === "function" ? styleValue() : styleValue};`;
        }).join(" ");
        element.setAttribute(key, style);
      } else if (key === "subscribe") {
        if (shouldAppend) {
          const funcs = optionsOrCb[key];
          funcs.forEach((f) => {
            const regenerator = () => $(tag, optionsOrCb, cb, false);
            if (functionSubscribersMap.get(f)) {
              functionSubscribersMap.get(f)?.push([element, regenerator]);
            } else {
              functionSubscribersMap.set(f, [[element, regenerator]]);
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
            func(e, ...args);
          }
          const subscribers = functionSubscribersMap.get(func);
          subscribers?.forEach((subscriber) => {
            const newEl = subscriber[1]();
            const oldEl = subscriber[0];
            Array.from(functionSubscribersMap.values()).forEach((subs) => {
              subs.forEach((sub) => {
                if (sub[0] === oldEl) {
                  sub[0] = newEl;
                }
              });
            });
            console.log(newEl);
            oldEl.replaceWith(newEl);
          });
        };
        element.addEventListener(key, funcWrapper);
      } else {
        element.setAttribute(key, typeof optionsOrCb[key] === "function" ? optionsOrCb[key]() : optionsOrCb[key]);
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

// pages/hello.ts
var t = (h) => {
  let value = 0;
  let width = 100;
  const stuff = [];
  const colors = [
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "black",
    "white",
    "gray",
    "brown",
    "cyan",
    "magenta",
    "teal",
    "olive",
    "navy",
    "maroon",
    "aquamarine",
    "turquoise",
    "silver",
    "lime",
    "fuchsia",
    "indigo",
    "violet",
    "pink",
    "orange",
    "gold",
    "orchid",
    "plum",
    "coral",
    "khaki",
    "azure",
    "lavender",
    "salmon",
    "peru",
    "wheat",
    "tan",
    "sienna",
    "thistle",
    "bisque",
    "moccasin",
    "snow",
    "seashell",
    "honeydew",
    "ivory",
    "linen",
    "oldLace",
    "beige",
    "gainsboro",
    "silver",
    "gray",
    "black"
  ];
  const updateWidth = () => width += 1;
  const updateValue = (_, v) => value += v;
  const addToStuff = (e) => {
    console.log(e);
    stuff.push((stuff[stuff.length - 1] || 0) + 11);
  };
  const thing = (text) => h.div(() => {
    h.text(`I am ${text}`);
  });
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
    thing("baka");
    h.button({ click: addToStuff, subscribe: [addToStuff] }, () => {
      h.text("Add to stuff" + stuff.length);
    });
    thing("Aho");
    h.ul({
      subscribe: [addToStuff],
      style: {
        backgroundColor: () => colors[Math.floor(Math.random() * colors.length)]
      }
    }, () => {
      stuff.forEach((thing2) => {
        h.li({
          style: {
            backgroundColor: colors[Math.floor(Math.random() * colors.length)]
          }
        }, () => {
          h.text(`I am a list item with value: ${thing2}`);
        });
      });
    });
    h.div({
      subscribe: [updateWidth],
      style: {
        backgroundColor: "pink",
        width: () => `${width}px`,
        height: "100px"
      },
      class: () => `${width}`,
      mouseover: updateWidth
    }, () => {
      h.text("mouse over me");
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
