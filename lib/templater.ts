type ElementInput = (optionsOrCb?: any, cb?: Function) => void;
interface AllElements {
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
  ): void {
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
