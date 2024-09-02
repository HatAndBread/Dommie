import app from "../lib/app.ts";
import type { Component } from "../lib/app.ts";
import { child } from "./child.ts";

const t: Component = (h) => {
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
    console.log(value);
    h.send("updateValue", value);
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

  let inputValue = "I am not a text input";
  const inputValueUpdated = h.on("inputValueChanged", (v: string) => {
    inputValue = v;
  });

  return h.component(() => {
    h.div(
      {
        style: { backgroundColor: () => colors[Math.floor(Math.random() * colors.length)] },
      },
      () => {
        h.a({ href: "https://www.google.com" }, () => {
          h.text("I am a link");
        });
        h.div({ subscribe: inputValueUpdated }, () => {
          h.text(inputValue);
        });
        h.div(() => {
          h.text("This is one instance of a child");
          child(h);
        });
        h.div(() => {
          h.text("This is another instance of a child");
          child(h);
        });
        h.div({ subscribe: updateWord }, () => {
          h.text(word);
        });
        h.button({ click: updateWord, text: "Change word" });
        h.div({ subscribe: [toggleFetchingCatData, fetchCatData] }, () => {
          h.text(fetchingCatData ? "Fetching cat data..." : catData);
        });
        h.button({ click: fetchCatData }, () => {
          h.text("Fetch cat data");
        });
        h.div({ subscribe: [toggleBool] }, () => {
          if (!someBool) {
            h.button({ click: toggleBool, ref: ref }, () => {
              h.text("someBool is false");
            });
          }
        });
        h.text("I am some text");
        h.br();
        h.text("I am some more text");
        h.div({ subscribe: toggleBool }, () => {
          if (someBool) {
            h.button({ click: toggleBool }, () => {
              h.text("someBool is true");
            });
          }
        });
        h.div({ subscribe: updateValue }, () => {
          h.text(value);
        });
        h.button({ click: [updateValue, [1]], text: "Increment" });
        h.button({ click: [updateValue, [-1]], text: "Decrement" });
        thing("baka");
        h.button({ click: addToStuff, subscribe: addToStuff }, () => {
          h.text("Add to stuff" + stuff.length);
        });
        thing("Aho");
        h.ul(
          {
            style: {
              backgroundColor: () => colors[Math.floor(Math.random() * colors.length)],
            },
            subscribe: addToStuff,
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
            subscribe: updateWidth,
            mousemove: updateWidth,
          },
          () => {
            h.text("mouse over me");
          },
        );
        h.comment("This is a comment!");
      },
    );
  });
};

app(t, "#app");
