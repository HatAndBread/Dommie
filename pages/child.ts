import type { Component } from "../lib/app";

const child: Component = (h) => {
  let inputValue = "I am a text input";
  let someOtherValue = 0;

  return h.component(({ on, send, stateUpdater, ref }) => {
    const updateSomeOtherValue = on("updateValue", (v: number) => (someOtherValue = v));
    const updateInputValue = stateUpdater((e: Event) => {
      inputValue = (e.target as HTMLInputElement).value;
      send("inputValueChanged", inputValue);
    });
    const inputRef = ref();

    h.div(() => {
      h.div(() => {
        h.text("I am the CHILD 👶");
        h.h1({ subscribe: updateInputValue }, () => {
          h.text(inputValue);
        });
        h.h1({ subscribe: updateSomeOtherValue }, () => {
          h.text(someOtherValue);
        });
        h.input({
          type: "text",
          value: () => inputValue,
          subscribe: updateInputValue,
          input: updateInputValue,
          ref: inputRef,
        });
      });
    });
  });
};

export { child };
