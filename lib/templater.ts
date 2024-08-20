export function templater() {
  let template = "";
  function $(
    tag: string | string[],
    optionsOrCb: { [key: string]: string | number } | Function = {},
    cb?: Function,
  ): string {
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
