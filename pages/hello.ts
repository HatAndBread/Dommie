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
    const testBool = state(false);
    const testList = state([true]);

    subscribe(() => {
      testState3.update("It Changed");
    }, [testState1]);

    // template
    const { div, button, input, a, text, br, ul, li, comment } = h;
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
      button({
        id: "test-bool-btn",
        click: () => testBool.update(!testBool.value),
        text: "Toggle",
      });
      div({ subscribe: testBool }, () => {
        if (testBool.value) {
          div({ id: "test-bool-div", text: "I do not exist when test bool is false." });
        }
      });
      button({
        id: "test-list-btn",
        click: () => testList.update([...testList.value, false, true, false]),
        text: "Add to list",
      });
      ul({ subscribe: testList, id: "test-list-ul" }, () => {
        testList.value.forEach((item, i) => {
          li({ id: `test-list-item-${i}`, class: "test-li" }, () => {
            input({
              type: "checkbox",
              checked: item,
              class: `test-li-checkbox`,
              click: () => {
                const newList = [...testList.value];
                newList[i] = !newList[i];
                testList.update(newList);
              },
            });
          });
        });
      });
    });
  });
};

app(t, "#app");
