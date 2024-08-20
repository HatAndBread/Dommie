import type { Template } from "../index.ts";

export default function (h: Template) {
  h(
    "button",
    {
      style: "background-color: green;",
      clicks: "increment",
      targets: "#counter",
    },
    () => {
      h(["Increment"]);
    },
  );
  h(
    "button",
    {
      style: "background-color: orange;",
      clicks: "decrement",
      targets: "#counter",
    },
    () => {
      h(["Decrement"]);
    },
  );
}
