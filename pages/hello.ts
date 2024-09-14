import app from "../lib/app.ts";
import type { Templater } from "../lib/types.ts";
import { child } from "./child.ts";

const t = (h: Templater) => {
  const colors = [
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
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

  const thing = (text: string) =>
    h.div(() => {
      h.text(`I am ${text}`);
    });

  return h.component(({ afterMounted, state }) => {
    const width = state(100);
    const updateWidth = () => {
      width.update(width.value + 1);
    };

    const getRandomWord = () => {
      const words = ["🥓", "🍳", "🥞", "🥩", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮"];
      return words[Math.floor(Math.random() * words.length)];
    };
    const word = state(getRandomWord());
    const updateWord = () => {
      word.update(getRandomWord());
      updateWidth();
    };
    const value = state(0);

    const catData = state("");

    const someBool = state(true);

    const updateValue = (_: Event, n: number) => {
      value.update(value.value + n);
    };
    const toggleBool = () => someBool.update(!someBool.value);
    const stuff = state<number[]>([]);

    const addToStuff = (e: Event) => {
      const arr = [...stuff.value];
      arr.push((arr[arr.length - 1] || 0) + 11);
      stuff.update(arr);
    };
    const fetchCatData = async (e: Event) => {
      console.log(e);
      catData.update("");
      const res = await fetch("https://meowfacts.herokuapp.com/");
      const data = await res.json();
      catData.update(data.data[0]);
    };
    afterMounted(fetchCatData);

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
        div(() => {
          text("This is one instance of a child");
          child(h, catData);
        });
        div(() => {
          text("This is another instance of a child");
          child(h, catData);
        });
        div({ subscribe: word }, () => {
          text(word.value);
        });
        h.custom({ nodeName: "custom-node", text: "I am a custom node!" });
        h.br();
        button({ click: updateWord, text: "Change word" });
        div({ subscribe: [catData] }, () => {
          text(catData.value ? catData.value : "Fetching cat data...");
        });
        button({ click: fetchCatData }, () => {
          text("Fetch cat data");
        });
        div({ subscribe: [someBool] }, () => {
          if (!someBool.value) {
            button({ click: toggleBool }, () => {
              text("someBool is false");
            });
          }
        });
        div({ subscribe: someBool }, () => {
          if (someBool.value) {
            child(h, catData);
          }
        });
        text("I am some text");
        br();
        text("I am some more text");
        div({ subscribe: someBool }, () => {
          if (someBool.value) {
            button({ click: toggleBool }, () => {
              text("someBool is true");
            });
          }
        });
        div({ subscribe: value }, () => {
          text(value.value);
        });
        button({ click: [updateValue, [1]], text: "Increment" });
        button({ click: [updateValue, [-1]], text: "Decrement" });
        thing("baka");
        button({ click: addToStuff, subscribe: stuff }, () => {
          text("Add to stuff" + stuff.value.length);
        });
        thing("Aho");
        ul(
          {
            style: {
              backgroundColor: () => colors[Math.floor(Math.random() * colors.length)],
            },
            subscribe: stuff,
          },
          () => {
            stuff.value.forEach((thing) => {
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
              width: () => `${width.value}px`,
              height: "100px",
            },
            class: () => `${width.value}`,
            subscribe: width,
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
