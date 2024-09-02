import type { Component } from "../lib/app";

const child: Component = (h) => {
  let inputValue = "I am a text input";
  const updateInputValue = h.stateUpdater((e: Event) => {
    inputValue = (e.target as HTMLInputElement).value;
    h.send("inputValueChanged", inputValue);
  });

  return h.component(() => {
    let someOtherValue = 0;
    const updateSomeOtherValue = h.on("updateValue", (v: number) => (someOtherValue = v));

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
        });
      });
    });
  });
};

export { child };
