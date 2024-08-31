// pages/child.ts
var child = (h) => {
  let inputValue = "I am a text input";
  const updateInputValue = h.stateUpdater((e) => {
    inputValue = e.target.value;
  });
  return h.div(() => {
    h.div(() => {
      h.text("I am the CHILD \uD83D\uDC76");
      h.h1({ subscribe: updateInputValue }, () => {
        h.text(inputValue);
      });
      h.input({
        type: "text",
        value: () => inputValue,
        subscribe: updateInputValue,
        input: updateInputValue
      });
    });
  });
};
export {
  child
};
