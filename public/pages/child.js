// pages/child.ts
var child = (h) => {
  let inputValue = "I am a text input";
  const updateInputValue = h.stateUpdater((e) => {
    inputValue = e.target.value;
    h.send("inputValueChanged", inputValue);
  });
  return h.component(() => {
    let someOtherValue = 0;
    const updateSomeOtherValue = h.on("updateValue", (v) => someOtherValue = v);
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
          input: updateInputValue
        });
      });
    });
  });
};
export {
  child
};
