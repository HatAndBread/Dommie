import type { Template, State } from "../lib/app";

export const childWithAfterDestroy2 = (
  h: Template,
  timesAfterDestroyCallbacksCalled: State<number>,
) => {
  return h.component(({ afterDestroyed }) => {
    afterDestroyed(() => {
      timesAfterDestroyCallbacksCalled.update(timesAfterDestroyCallbacksCalled.value + 1);
      console.log("Child with after destroy 2 destroyed");
    });
    const { div, text, h1, input, button } = h;
    div(() => {});
  });
};
