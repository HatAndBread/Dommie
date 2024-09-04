// pages/child.ts
var child = (h, initialSomeOtherValue) => {
  let inputValue = "I am a text input";
  let someOtherValue = initialSomeOtherValue;
  return h.component(({ on, send, stateUpdater, ref }) => {
    const updateSomeOtherValue = on("updateValue", (v) => someOtherValue = v);
    const updateInputValue = stateUpdater((e) => {
      inputValue = e.target.value;
      send("inputValueChanged", inputValue);
    });
    const inputRef = ref();
    const { div, text, h1, input } = h;
    div(() => {
      div(() => {
        text("I am the CHILD \uD83D\uDC76");
        h1({ subscribe: updateInputValue }, () => {
          text(inputValue);
        });
        h1({ subscribe: updateSomeOtherValue }, () => {
          text(someOtherValue);
        });
        input({
          type: "text",
          value: () => inputValue,
          subscribe: updateInputValue,
          input: updateInputValue,
          ref: inputRef
        });
      });
    });
  });
};
export {
  child
};
