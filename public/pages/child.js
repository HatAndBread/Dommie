// pages/child.ts
var child = (h) => {
  let inputValue = "I am a text input";
  let someOtherValue = 0;
  return h.component(({ on, send, stateUpdater, ref }) => {
    const updateSomeOtherValue = on("updateValue", (v) => someOtherValue = v);
    const updateInputValue = stateUpdater((e) => {
      inputValue = e.target.value;
      send("inputValueChanged", inputValue);
    });
    const inputRef = ref();
    h.div(() => {
      h.div(() => {
        h.text("I am the CHILD \uD83D\uDC76");
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
          ref: inputRef
        });
      });
    });
  });
};
export {
  child
};
