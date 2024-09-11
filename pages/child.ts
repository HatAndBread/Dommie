import type { Component } from "../lib/app";

const child: Component = (h, initialSomeOtherValue: number) => {
  let inputValue = "I am a text input";
  let someOtherValue = initialSomeOtherValue;

  return h.component(({ on, send, stateUpdater, afterMounted, afterDestroyed, ref }) => {
    const updateSomeOtherValue = on("updateValue", (v: number) => (someOtherValue = v));
    const updateInputValue = stateUpdater((e: Event) => {
      inputValue = (e.target as HTMLInputElement).value;
      send("inputValueChanged", inputValue);
    });
    const inputRef = ref();
    const otherRef = ref();
    afterMounted(() => {
      inputRef()?.focus();
    });
    afterDestroyed(() => {
      console.log("I am destroyed");
    });

    let thing = 1;
    const click = stateUpdater((_: Event, i: number) => {
      console.log(i);
      thing++;
    });

    const { div, text, h1, input } = h;
    div(() => {
      div(() => {
        div({ subscribe: click }, () => {
          for (let x = 0; x < thing; x++) {
            h.button({ text: `Button ${x}`, click: [click, [x]] });
          }
        });
        text("I am the CHILD 👶");
        h1({ subscribe: updateInputValue }, () => {
          text(inputValue);
        });
        h1({ subscribe: updateSomeOtherValue, ref: otherRef }, () => {
          text(someOtherValue);
        });
        input({
          ref: inputRef,
          type: "text",
          value: () => inputValue,
          subscribe: updateInputValue,
          input: updateInputValue,
        });
      });
    });
  });
};

export { child };
