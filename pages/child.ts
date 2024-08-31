import type { Component } from "../lib/app";

const child: Component = (h) => {
  return h.div(() => {
    h.div(() => {
      h.text("I am the CHILD 👶");
    });
  });
};

export { child };
