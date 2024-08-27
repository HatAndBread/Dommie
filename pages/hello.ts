import type { Template } from "../index.ts";
import { templater2 } from "../lib/templater.ts";
import type { AllElements } from "../lib/types.ts";

const t: AppInput = (h) => {
  let value = 0;
  let width = 100;
  const stuff: number[] = [];
  const colors = [
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "black",
    "white",
    "gray",
    "brown",
    "cyan",
    "magenta",
    "teal",
    "olive",
    "navy",
    "maroon",
    "aquamarine",
    "turquoise",
    "silver",
    "lime",
    "fuchsia",
    "indigo",
    "violet",
    "pink",
    "orange",
    "gold",
    "orchid",
    "plum",
    "coral",
    "khaki",
    "azure",
    "lavender",
    "salmon",
    "peru",
    "wheat",
    "tan",
    "sienna",
    "thistle",
    "bisque",
    "moccasin",
    "snow",
    "seashell",
    "honeydew",
    "ivory",
    "linen",
    "oldLace",
    "beige",
    "gainsboro",
    "silver",
    "gray",
    "black",
  ];

  // const useHello = createState("hello");

  const updateWidth = () => (width += 1);
  const updateValue = (_: Event, v: number) => (value += v);

  const addToStuff = (e: Event) => {
    console.log(e);
    stuff.push((stuff[stuff.length - 1] || 0) + 11);
  };
  const thing = (text: string) =>
    h.div(() => {
      h.text(`I am ${text}`);
    });

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
    thing("baka");
    h.button({ click: addToStuff, subscribe: [addToStuff] }, () => {
      h.text("Add to stuff" + stuff.length);
    });
    // h.button({ click: useHello((s) => (s.value = "Stupid")) }, () => {
    //   h.text("Use hello");
    // });
    // h.div({ subscribe: [useHello], class: useHello((s) => s.value) }, () => {
    //   console.log(useHello);
    //   h.text("This is useHello");
    // });
    thing("Aho");
    h.ul(
      {
        subscribe: [addToStuff],
        style: {
          backgroundColor: () =>
            colors[Math.floor(Math.random() * colors.length)],
        },
      },
      () => {
        stuff.forEach((thing) => {
          h.li(
            {
              style: {
                backgroundColor:
                  colors[Math.floor(Math.random() * colors.length)],
              },
            },
            () => {
              h.text(`I am a list item with value: ${thing}`);
            },
          );
        });
      },
    );
    h.div(
      {
        subscribe: [updateWidth],
        style: {
          backgroundColor: "pink",
          width: () => `${width}px`,
          height: "100px",
        },
        class: () => `${width}`,
        mouseover: updateWidth,
      },
      () => {
        h.text("mouse over me");
      },
    );
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
