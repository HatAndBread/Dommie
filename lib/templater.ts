type ElementInput = (optionsOrCb?: any, cb?: Function) => AllElements;
export interface AllElements {
  a: ElementInput;
  abbr: ElementInput;
  acronym: ElementInput;
  address: ElementInput;
  area: ElementInput;
  article: ElementInput;
  aside: ElementInput;
  audio: ElementInput;
  b: ElementInput;
  base: ElementInput;
  bdi: ElementInput;
  bdo: ElementInput;
  big: ElementInput;
  blockquote: ElementInput;
  body: ElementInput;
  br: ElementInput;
  button: ElementInput;
  canvas: ElementInput;
  caption: ElementInput;
  center: ElementInput;
  cite: ElementInput;
  code: ElementInput;
  col: ElementInput;
  colgroup: ElementInput;
  comment: ElementInput;
  custom: ElementInput;
  data: ElementInput;
  datalist: ElementInput;
  dd: ElementInput;
  del: ElementInput;
  details: ElementInput;
  dfn: ElementInput;
  dialog: ElementInput;
  div: ElementInput;
  dl: ElementInput;
  dt: ElementInput;
  em: ElementInput;
  embed: ElementInput;
  fieldset: ElementInput;
  figcaption: ElementInput;
  figure: ElementInput;
  font: ElementInput;
  footer: ElementInput;
  form: ElementInput;
  frame: ElementInput;
  frameset: ElementInput;
  generate: () => string;
  h1: ElementInput;
  h2: ElementInput;
  h3: ElementInput;
  h4: ElementInput;
  h5: ElementInput;
  h6: ElementInput;
  head: ElementInput;
  header: ElementInput;
  hr: ElementInput;
  html: ElementInput;
  i: ElementInput;
  iframe: ElementInput;
  img: ElementInput;
  input: ElementInput;
  ins: ElementInput;
  kbd: ElementInput;
  label: ElementInput;
  legend: ElementInput;
  li: ElementInput;
  link: ElementInput;
  main: ElementInput;
  map: ElementInput;
  mark: ElementInput;
  meta: ElementInput;
  meter: ElementInput;
  nav: ElementInput;
  noscript: ElementInput;
  object: ElementInput;
  ol: ElementInput;
  optgroup: ElementInput;
  option: ElementInput;
  output: ElementInput;
  p: ElementInput;
  param: ElementInput;
  picture: ElementInput;
  pre: ElementInput;
  progress: ElementInput;
  q: ElementInput;
  rp: ElementInput;
  rt: ElementInput;
  ruby: ElementInput;
  s: ElementInput;
  samp: ElementInput;
  script: ElementInput;
  section: ElementInput;
  select: ElementInput;
  small: ElementInput;
  source: ElementInput;
  span: ElementInput;
  strong: ElementInput;
  style: ElementInput;
  sub: ElementInput;
  summary: ElementInput;
  sup: ElementInput;
  table: ElementInput;
  tbody: ElementInput;
  td: ElementInput;
  template: ElementInput;
  text: (text: string | number) => string;
  textarea: ElementInput;
  tfoot: ElementInput;
  th: ElementInput;
  thead: ElementInput;
  time: ElementInput;
  title: ElementInput;
  tr: ElementInput;
  track: ElementInput;
  u: ElementInput;
  ul: ElementInput;
  var: ElementInput;
  video: ElementInput;
  wbr: ElementInput;
  xmp: ElementInput;
}
// abort 	The loading of a media is aborted 	UiEvent, Event
// afterprint 	A page has started printing 	Event
// animationend 	A CSS animation has completed 	AnimationEvent
// animationiteration 	A CSS animation is repeated 	AnimationEvent
// animationstart 	A CSS animation has started 	AnimationEvent
// beforeprint 	A page is about to be printed 	Event
// beforeunload 	Before a document is about to be unloaded 	UiEvent, Event
// blur 	An element loses focus 	FocusEvent
// canplay 	The browser can start playing a media (has buffered enough to begin) 	Event
// canplaythrough 	The browser can play through a media without stopping for buffering 	Event
// change 	The content of a form element has changed 	Event
// click 	An element is clicked on 	MouseEvent
// contextmenu 	An element is right-clicked to open a context menu 	MouseEvent
// copy 	The content of an element is copied 	ClipboardEvent
// cut 	The content of an element is cut 	ClipboardEvent
// dblclick 	An element is double-clicked 	MouseEvent
// drag 	An element is being dragged 	DragEvent
// dragend 	Dragging of an element has ended 	DragEvent
// dragenter 	A dragged element enters the drop target 	DragEvent
// dragleave 	A dragged element leaves the drop target 	DragEvent
// dragover 	A dragged element is over the drop target 	DragEvent
// dragstart 	Dragging of an element has started 	DragEvent
// drop 	A dragged element is dropped on the target 	DragEvent
// durationchange 	The duration of a media is changed 	Event
// ended 	A media has reach the end ("thanks for listening") 	Event
// error 	An error has occurred while loading a file 	ProgressEvent, UiEvent, Event
// focus 	An element gets focus 	FocusEvent
// focusin 	An element is about to get focus 	FocusEvent
// focusout 	An element is about to lose focus 	FocusEvent
// fullscreenchange 	An element is displayed in fullscreen mode 	Event
// fullscreenerror 	An element can not be displayed in fullscreen mode 	Event
// hashchange 	There has been changes to the anchor part of a URL 	HashChangeEvent
// input 	An element gets user input 	InputEvent, Event
// invalid 	An element is invalid 	Event
// keydown 	A key is down 	KeyboardEvent
// keypress 	A key is pressed 	KeyboardEvent
// keyup 	A key is released 	KeyboardEvent
// load 	An object has loaded 	UiEvent, Event
// loadeddata 	Media data is loaded 	Event
// loadedmetadata 	Meta data (like dimensions and duration) are loaded 	Event
// loadstart 	The browser starts looking for the specified media 	ProgressEvent
// message 	A message is received through the event source 	Event
// mousedown 	The mouse button is pressed over an element 	MouseEvent
// mouseenter 	The pointer is moved onto an element 	MouseEvent
// mouseleave 	The pointer is moved out of an element 	MouseEvent
// mousemove 	The pointer is moved over an element 	MouseEvent
// mouseover 	The pointer is moved onto an element 	MouseEvent
// mouseout 	The pointer is moved out of an element 	MouseEvent
// mouseup 	A user releases a mouse button over an element 	MouseEvent
// mousewheel 	Deprecated. Use the wheel event instead 	WheelEvent
// offline 	The browser starts working offline 	Event
// online 	The browser starts working online 	Event
// open 	A connection with the event source is opened 	Event
// pagehide 	User navigates away from a webpage 	PageTransitionEvent
// pageshow 	User navigates to a webpage 	PageTransitionEvent
// paste 	Some content is pasted in an element 	ClipboardEvent
// pause 	A media is paused 	Event
// play 	The media has started or is no longer paused 	Event
// playing 	The media is playing after being paused or buffered 	Event
// popstate 	The window's history changes 	PopStateEvent
// progress 	The browser is downloading media data 	Event
// ratechange 	The playing speed of a media is changed 	Event
// resize 	The document view is resized 	UiEvent, Event
// reset 	A form is reset 	Event
// scroll 	An scrollbar is being scrolled 	UiEvent, Event
// search 	Something is written in a search field 	Event
// seeked 	Skipping to a media position is finished 	Event
// seeking 	Skipping to a media position is started 	Event
// select 	User selects some text 	UiEvent, Event
// show 	A <menu> element is shown as a context menu 	Event
// stalled 	The browser is trying to get unavailable media data 	Event
// storage 	A Web Storage area is updated 	StorageEvent
// submit 	A form is submitted 	Event
// suspend 	The browser is intentionally not getting media data 	Event
// timeupdate 	The playing position has changed (the user moves to a different point in the media) 	Event
// toggle 	The user opens or closes the <details> element 	Event
// touchcancel 	The touch is interrupted 	TouchEvent
// touchend 	A finger is removed from a touch screen 	TouchEvent
// touchmove 	A finger is dragged across the screen 	TouchEvent
// touchstart 	A finger is placed on a touch screen 	TouchEvent
// transitionend 	A CSS transition has completed 	TransitionEvent
// unload 	A page has unloaded 	UiEvent, Event
// volumechange 	The volume of a media is changed (includes muting) 	Event
// waiting 	A media is paused but is expected to resume (e.g. buffering) 	Event
// wheel
const allEventListeners = [
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
  "wheel",
];

export function templater() {
  let template = "";
  let whitespace = "";
  const allElements = <AllElements>{};
  for (const elementName of ALL_HTML_ELEMENTS) {
    // @ts-ignore
    allElements[elementName] = (optionsOrCb: any = {}, cb?: Function) =>
      $(elementName, optionsOrCb, cb);
  }
  allElements.generate = () => {
    const copy = template;
    template = "";
    return copy;
  };
  function $(
    tag: string,
    optionsOrCb:
      | { [key: string]: string | number | Function[] | Function }
      | Function = {},
    cb?: Function,
  ) {
    if (tag === "text") {
      template += `${whitespace}${optionsOrCb}\n`;
      return;
    }
    if (tag === "comment") {
      template += `${whitespace}<!--${optionsOrCb}-->\n`;
      return;
    }
    if (tag === "custom") {
      // todo: add custom element
      return;
    }
    if (typeof optionsOrCb === "function") {
      cb = optionsOrCb;
      optionsOrCb = {};
    }
    let options = "";
    for (let key in optionsOrCb) {
      if (key === "subscribes") {
        const funcs = optionsOrCb[key] as Function[];
        funcs.forEach((f) => (options += ` subscribes-${f.name}`));
      } else if (key === "clicks") {
        const func = optionsOrCb[key] as Function;
        options += ` ${key}="${func.name}"`;
      } else {
        options += ` ${key}="${optionsOrCb[key]}"`;
      }
    }
    if (typeof cb === "function") {
      template += `${whitespace}<${tag}${options}>\n`;
      whitespace += "  ";
      cb();
      whitespace = whitespace.slice(0, -2);
      template += `${whitespace}</${tag}>\n`;
    } else if (cb) {
      throw new Error("Callback must be a function!");
    } else {
      if (isSelfClosing(tag)) {
        template += `${whitespace}<${tag}${options} />\n`;
      } else {
        template += `${whitespace}<${tag}${options}></${tag}>\n`;
      }
    }
    return allElements;
  }
  return allElements;
}

const toSnakeCase = (str: string) => {
  return str
    .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    .replace("_", "-");
};

export function templater2(root: Element) {
  const allElements = <AllElements>{};
  for (const elementName of ALL_HTML_ELEMENTS) {
    // @ts-ignore
    allElements[elementName] = (optionsOrCb: any = {}, cb?: Function) =>
      $(elementName, optionsOrCb, cb);
  }
  const functionSubscribersMap = new Map<
    Function,
    [Element, () => HTMLElement | Comment][]
  >();
  const nesting = [root];
  function $(
    tag: string,
    optionsOrCb: any,
    cb?: Function,
    shouldAppend = true,
  ) {
    const parent = nesting[nesting.length - 1];
    if (tag === "text") {
      const node = document.createTextNode(optionsOrCb as string);
      if (shouldAppend) parent.appendChild(node);
      return node;
    }
    if (tag === "comment") {
      const comment = document.createComment("My comments");
      if (shouldAppend) parent.appendChild(comment);
      return comment;
    }
    if (tag === "custom") {
      // todo: add custom element
      //return allElements;
    }
    if (typeof optionsOrCb === "function") {
      cb = optionsOrCb;
      optionsOrCb = {};
    }
    const element = document.createElement(tag);
    for (let key in optionsOrCb) {
      if (key === "style" && typeof optionsOrCb[key] !== "string") {
        const style = Object.entries(optionsOrCb[key])
          .map(([styleKey, styleValue]) => {
            return `${toSnakeCase(styleKey)}: ${typeof styleValue === "function" ? styleValue() : styleValue};`;
          })
          .join(" ");
        element.setAttribute(key, style);
      } else if (key === "subscribe") {
        if (shouldAppend) {
          const funcs = optionsOrCb[key] as Function[];
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
        let func: Function | undefined;
        let args: any[] = [];
        const eventDefinition = optionsOrCb[key];
        if (typeof eventDefinition === "function") {
          func = eventDefinition;
        } else if (
          Array.isArray(eventDefinition) &&
          typeof eventDefinition[0] === "function" &&
          (typeof eventDefinition[1] === "undefined" ||
            Array.isArray(eventDefinition[1]))
        ) {
          func = eventDefinition[0];
          if (eventDefinition[1]) {
            args = eventDefinition[1];
          }
        } else {
          throw new Error(
            `Listeners must be a function or an array of function and arguments. Recieved ${key}, ${eventDefinition}`,
          );
        }
        const funcWrapper = (e: Event) => {
          if (!func) {
            throw new Error("What??? 🤔");
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
        element.setAttribute(key, optionsOrCb[key]);
      }
    }
    if (typeof cb === "function") {
      nesting.push(element);
      cb();
      nesting.pop();
      if (shouldAppend) parent.appendChild(element);
    } else if (cb) {
      throw new Error("Callback must be a function!");
    } else {
      if (shouldAppend) parent.appendChild(element);
    }
    return element;
  }
  return allElements;
}

const ALL_HTML_ELEMENTS = [
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
  "xmp",
];

const SELF_CLOSING_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const isSelfClosing = (tag: string) => SELF_CLOSING_ELEMENTS.includes(tag);
