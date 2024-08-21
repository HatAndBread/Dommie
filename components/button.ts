import type { Template } from "../index.ts";

export default function (
  h: Template,
  increment: Function,
  decrement: Function,
) {
  h.button({ style: "background-color: green;", clicks: increment }, () => {
    h.text("Increment");
  });
  h.button({ style: "background-color: orange;", clicks: decrement }, () => {
    h.text("Decrement");
  });
}
