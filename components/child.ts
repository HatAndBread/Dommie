import type { Template } from "../index.ts";
import type { AppInput } from "../pages/hello.ts";

export const child: AppInput = (h, handlersFunc) => {
  return h.button(() => {
    h.text("I am a child");
  });
};
