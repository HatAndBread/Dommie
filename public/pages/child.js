// pages/child.ts
var child = (h) => {
  return h.div(() => {
    h.div(() => {
      h.text("I am the CHILD \uD83D\uDC76");
    });
  });
};
export {
  child
};
