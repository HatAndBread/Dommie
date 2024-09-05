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

  let word = "🥓";

  let value = 0;

  let catData = "";
  let fetchingCatData = false;

  let someBool = true;

  const thing = (text: string) =>
    h.div(() => {
      h.text(`I am ${text}`);
    });

  let inputValue = "I am not a text input";

  return h.component(({ on, send, stateUpdater, ref }) => {
    const r = ref();

    const updateWidth = stateUpdater(() => (width += 1));
    const updateWord = stateUpdater(() => {
      const words = ["🥓", "🍳", "🥞", "🥩", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮"];
      word = words[Math.floor(Math.random() * words.length)];
      updateWidth();
    });
    const updateValue = stateUpdater((_: Event, n: number) => {
      value += n;
      send("updateValue", value);
    });
    const toggleBool = stateUpdater(() => (someBool = !someBool));
    const addToStuff = stateUpdater((e: Event) => {
      stuff.push((stuff[stuff.length - 1] || 0) + 11);
    });
    const toggleFetchingCatData = stateUpdater(() => {
      fetchingCatData = !fetchingCatData;
    });
    const fetchCatData = stateUpdater(async () => {
      toggleFetchingCatData();
      const res = await fetch("https://meowfacts.herokuapp.com/");
      const data = await res.json();
      catData = data.data[0];
      toggleFetchingCatData();
    });

    const inputValueUpdated = on("inputValueChanged", (v: string) => {
      inputValue = v;
    });

    // template
    const { div, button, a, text, br, ul, li, comment } = h;
    div(
      {
        style: { backgroundColor: () => colors[Math.floor(Math.random() * colors.length)] },
      },
      () => {
        a({ href: "https://www.google.com" }, () => {
          text("I am a link");
        });
        div({ subscribe: inputValueUpdated }, () => {
          text(inputValue);
        });
        div(() => {
          text("This is one instance of a child");
          child(h, value);
        });
        div(() => {
          text("This is another instance of a child");
          child(h, value);
        });
        div({ subscribe: updateWord }, () => {
          text(word);
        });
        button({ click: updateWord, text: "Change word" });
        div({ subscribe: [toggleFetchingCatData, fetchCatData] }, () => {
          text(fetchingCatData ? "Fetching cat data..." : catData);
        });
        button({ click: fetchCatData }, () => {
          text("Fetch cat data");
        });
        div({ subscribe: [toggleBool] }, () => {
          if (!someBool) {
            button({ click: toggleBool, ref: r }, () => {
              text("someBool is false");
            });
          }
        });
        div({ subscribe: toggleBool }, () => {
          if (someBool) {
            child(h, value);
          }
        });
        text("I am some text");
        br();
        text("I am some more text");
        div({ subscribe: toggleBool }, () => {
          if (someBool) {
            button({ click: toggleBool }, () => {
              text("someBool is true");
            });
          }
        });
        div({ subscribe: updateValue }, () => {
          text(value);
        });
        button({ click: [updateValue, [1]], text: "Increment" });
        button({ click: [updateValue, [-1]], text: "Decrement" });
        thing("baka");
        button({ click: addToStuff, subscribe: addToStuff }, () => {
          text("Add to stuff" + stuff.length);
        });
        thing("Aho");
        ul(
          {
            style: {
              backgroundColor: () => colors[Math.floor(Math.random() * colors.length)],
            },
            subscribe: addToStuff,
          },
          () => {
            stuff.forEach((thing) => {
              li({
                style: {
                  backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                },
                text: () => `I am a list item with value: ${thing}`,
              });
            });
          },
        );
        div(
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
            text("mouse over me");
          },
        );
        comment("This is a comment!");
      },
    );
  });
};

app(t, "#app");
