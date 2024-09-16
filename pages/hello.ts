import app from "../lib/app.ts";
import type { Template } from "../lib/app.ts";
import { child } from "./child.ts";

const t = (h: Template) => {
  return h.component(({ afterMounted, state, subscribe }) => {
    const catData = state("");
    const someBool = state(true);
    const fetchCatData = async (e: Event) => {
      console.log(e);
      catData.update("");
      const res = await fetch("https://meowfacts.herokuapp.com/");
      const data = await res.json();
      catData.update(data.data[0]);
    };
    afterMounted(fetchCatData);

    const testState1 = state(0);
    const testState2 = state(0);

    // template
    const { div, button, a, text, br, ul, li, comment } = h;
    div({ style: {} }, () => {
      button({
        "data-testid": "test-click",
        subscribe: testState1,
        click: () => testState1.update(testState1.value + 1),
        text: () => `${testState1.value}`,
      });
      button({
        "data-testid": "test-click2",
        text: "Test 2",
        click: () => testState2.update(testState2.value + 1),
      });
      div({ "data-testid": "test-click2-div", subscribe: testState2 }, () => {
        text(testState2.value);
      });
    });
  });
};

app(t, "#app");
