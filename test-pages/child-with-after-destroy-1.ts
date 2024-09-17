import type { Template, State } from "../lib/app";
import { childWithAfterDestroy2 } from "./child-with-after-destroy-2";

export const childWithAfterDestroy1 = (
  h: Template,
  timesAfterDestroyCallbacksCalled: State<number>,
) => {
  return h.component(({ afterDestroyed }) => {
    const { div, text, h1, input, button } = h;
    afterDestroyed(() => {
      timesAfterDestroyCallbacksCalled.update(timesAfterDestroyCallbacksCalled.value + 1);
      console.log("Child with after destroy 1 destroyed");
    });
    div({ id: "child-with-after-destroy-1" }, () => {
      text("I am a child with an after destroy callback");
      childWithAfterDestroy2(h, timesAfterDestroyCallbacksCalled);
    });
  });
};
