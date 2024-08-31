import type { Template } from "../index.ts";
import { templater2 } from "../lib/templater.ts";
import type { Templater } from "../lib/types.ts";
import type { AllElements } from "../lib/types.ts";

const t: AppInput = (h) => {
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

  const ref = h.ref();
  let word = "🥓";
  const updateWord = h.stateUpdater(() => {
    const words = ["🥓", "🍳", "🥞", "🥩", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮"];
    word = words[Math.floor(Math.random() * words.length)];
    updateWidth();
  });
  const updateWidth = h.stateUpdater(() => (width += 1));
  let value = 0;
  const updateValue = h.stateUpdater((_: Event, n: number) => {
    value += n;
  });

  let catData = "";
  let fetchingCatData = false;

  const toggleFetchingCatData = h.stateUpdater(() => {
    fetchingCatData = !fetchingCatData;
  });

  const fetchCatData = h.stateUpdater(async () => {
    toggleFetchingCatData();
    const res = await fetch("https://meowfacts.herokuapp.com/");
    const data = await res.json();
    console.log(data.data[0]);
    catData = data.data[0];
    toggleFetchingCatData();
  });

  const addToStuff = h.stateUpdater((e: Event) => {
    stuff.push((stuff[stuff.length - 1] || 0) + 11);
  });

  let someBool = true;
  const toggleBool = h.stateUpdater(() => {
    someBool = !someBool;
  });

  const thing = (text: string) =>
    h.div(() => {
      h.text(`I am ${text}`);
    });

  return h.div(
    {
      subscribe: [
        updateWord,
        toggleBool,
        updateValue,
        addToStuff,
        updateWidth,
        fetchCatData,
        toggleFetchingCatData,
      ],
      style: { backgroundColor: () => colors[Math.floor(Math.random() * colors.length)] },
      ["data-component-root"]: 1,
    },
    () => {
      h.a({ href: "https://www.google.com" }, () => {
        h.text("I am a link");
      });
      h.div(() => {
        h.text(word);
      });
      h.button({ click: updateWord }, () => {
        h.text("Change word");
      });
      h.div(() => {
        h.text(fetchingCatData ? "Fetching cat data..." : catData);
      });
      h.button({ click: fetchCatData }, () => {
        h.text("Fetch cat data");
      });
      h.div(() => {
        if (!someBool) {
          h.button({ click: toggleBool, ref: ref }, () => {
            h.text("someBool is false");
          });
        }
      });
      h.text("I am some text");
      h.br();
      h.text("I am some more text");
      h.div(() => {
        if (someBool) {
          h.button({ click: toggleBool }, () => {
            h.text("someBool is true");
          });
        }
      });
      h.div(() => {
        h.text(value);
      });
      h.button({ click: [updateValue, [1]] }, () => {
        h.text("Increment");
      });
      h.button({ click: [updateValue, [-1]] }, () => {
        h.text("Decrement");
      });
      thing("baka");
      h.button({ click: addToStuff }, () => {
        h.text("Add to stuff" + stuff.length);
      });
      thing("Aho");
      h.ul(
        {
          style: {
            backgroundColor: () => colors[Math.floor(Math.random() * colors.length)],
          },
        },
        () => {
          stuff.forEach((thing) => {
            h.li(
              {
                style: {
                  backgroundColor: colors[Math.floor(Math.random() * colors.length)],
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
          style: {
            backgroundColor: "pink",
            width: () => `${width}px`,
            height: "100px",
          },
          class: () => `${width}`,
          mousemove: updateWidth,
        },
        () => {
          h.text("mouse over me");
        },
      );
      h.comment("This is a comment!");
    },
  );
};

// LIB
export type AppInput = (h: Templater) => Templater;
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
