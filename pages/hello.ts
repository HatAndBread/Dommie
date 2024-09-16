import app from "../lib/app.ts";
import type { Template } from "../lib/app.ts";
import { child } from "./child.ts";

const t = (h: Template) => {
  return h.component(({ afterMounted, state, subscribe }) => {
    const catData = state("");
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
    const testState3 = state("Side Effect Example");

    subscribe(() => {
      testState3.update("It Changed");
    }, [testState1]);

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
      div({ "data-testid": "test-sideeffect-div", subscribe: testState3 }, () => {
        text(testState3.value);
      });
    });
  });
};

app(t, "#app");
