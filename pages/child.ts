import type { Component } from "../lib/app";

const child: Component = (h) => {
  let inputValue = "I am a text input";
  const updateInputValue = h.stateUpdater((e: Event) => {
    inputValue = (e.target as HTMLInputElement).value;
  });
  return h.div(() => {
    h.div(() => {
      h.text("I am the CHILD 👶");
      h.h1({ subscribe: updateInputValue }, () => {
        h.text(inputValue);
      });
      h.input({
        type: "text",
        value: () => inputValue,
        subscribe: updateInputValue,
        input: updateInputValue,
      });
    });
  });
};

export { child };
