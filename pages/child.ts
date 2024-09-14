import type { Template, State } from "../lib/app";

const child = (h: Template, catData: State<string>) => {
  return h.component(({ afterMounted, afterDestroyed, ref, state }) => {
    const inputValue = state("I am a text input");

    const updateInputValue = (e: Event) => {
      inputValue.update((e.target as HTMLInputElement).value);
    };
    const inputRef = ref();
    afterMounted(() => {
      inputRef()?.focus();
    });
    afterDestroyed(() => {
      console.log("I am destroyed");
    });

    const thing = state(1);
    const click = (_: Event, i: number) => {
      console.log(i);
      thing.update(thing.value + 1);
    };

    const updateCatData = () => {
      catData.update("🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯🐯");
    };

    const { div, text, h1, input, button } = h;
    div(() => {
      div(() => {
        div({ subscribe: catData, text: () => catData.value });
        button({ text: "Update Cat Data From Child", click: updateCatData });

        div({ subscribe: thing }, () => {
          for (let x = 0; x < thing.value; x++) {
            div({ id: x }, () => {
              h.button({ text: `Button ${x}`, click: [click, [x]] });
              h.input({ type: "checkbox", checked: x % 2 === 0 });
            });
          }
        });
        text("I am the CHILD 👶");
        h1({ subscribe: inputValue }, () => {
          text(inputValue.value);
        });
        input({
          ref: inputRef,
          type: "text",
          value: () => inputValue.value,
          subscribe: inputValue,
          input: updateInputValue,
        });
      });
    });
  });
};

export { child };
