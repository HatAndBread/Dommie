// pages/child.ts
var child = (h, initialSomeOtherValue) => {
  let inputValue = "I am a text input";
  let someOtherValue = initialSomeOtherValue;
  return h.component(({ on, send, stateUpdater, afterMounted, afterDestroyed, ref }) => {
    const updateSomeOtherValue = on("updateValue", (v) => someOtherValue = v);
    const updateInputValue = stateUpdater((e) => {
      inputValue = e.target.value;
      send("inputValueChanged", inputValue);
    });
    const inputRef = ref();
    const otherRef = ref();
    afterMounted(() => {
      console.log("I WAS MOUNTED");
      inputRef()?.focus();
      console.log(inputRef());
      console.log(otherRef());
    });
    afterDestroyed(() => {
      console.log("I WAS DESTROYED!");
      console.log(inputRef());
    });
    const { div, text, h1, input } = h;
    div(() => {
      div(() => {
        text("I am the CHILD \uD83D\uDC76");
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
          input: updateInputValue
        });
      });
    });
  });
};
export {
  child
};
