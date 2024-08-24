import type { Template } from "../index.ts";
import { templater, templater2 } from "../lib/templater.ts";
import { child } from "../components/child.ts";
import type { AllElements } from "../lib/templater.ts";

const t: AppInput = (h) => {
  let value = 0;
  let width = 100;
  const stuff: number[] = [];

  const updateWidth = () => (width += 1);
  const updateValue = (v: number) => (value += v);

  const addToStuff = () => {
    stuff.push((stuff[stuff.length - 1] || 0) + 11);
  };

  return h.div({ style: "background-color: red;" }, () => {
    h.a({ href: "https://www.google.com" }, () => {
      h.text("I am a link");
    });
    h.text("I am some text");
    h.br();
    h.text("I am some more text");
    h.div({ subscribe: [updateValue] }, () => {
      h.text(value);
    });
    h.button({ click: [updateValue, [1]] }, () => {
      h.text("Increment");
    });
    h.button({ click: [updateValue, [-1]] }, () => {
      h.text("Decrement");
    });
    h.button({ click: addToStuff }, () => {
      h.text("Add to stuff");
    });
    h.ul({ subscribe: [addToStuff] }, () => {
      stuff.forEach((thing) => {
        h.li({ style: { backgroundColor: "orange" } }, () => {
          h.text(`I am a list item with value: ${thing}`);
        });
      });
    });
    h.div({ subscribe: [updateWidth] }, () => {
      h.div(
        {
          style: {
            backgroundColor: "pink",
            width: `${width}px`,
            height: "100px",
          },
          mouseover: updateWidth,
        },
        () => {
          h.text("mouse over me");
        },
      );
    });
    h.comment("This is a comment!");
  });
};

// LIB
const toPascalCase = (str: string) =>
  (str.match(/[a-zA-Z0-9]+/g) || [])
    .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
    .join("");
const camelize = (str: string) => {
  const pascaled = toPascalCase(str);
  return pascaled.charAt(0).toLowerCase() + pascaled.slice(1);
};

export type AppInput = (h: Template) => AllElements;
const app = (i: AppInput, id: string) => {
  const el = document.getElementById(id);
  if (!el) {
    console.error("No element found with id: " + id);
    return;
  }
  const x = templater2(el);
  i(x);
  console.log(x);
};

app(t, "app");
