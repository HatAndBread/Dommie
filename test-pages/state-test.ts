import type { Template } from "../lib/app";

export const stateTest = (h: Template) => {
  return h.component(({ afterMounted, state, subscribe, ref, r }) => {
    const catData = state("");
    const fetchCatData = async (e: Event) => {
      console.log(e);
      catData.update("");
      const res = await fetch("https://meowfacts.herokuapp.com/");
      const data = await res.json();
      catData.update(data.data[0]);
    };
    afterMounted(fetchCatData);

    const updateTest = state(0);
    const testState1 = state(0);
    const testState2 = state(0);
    const testState3 = state("Side Effect Example");
    const testBool = state(false);
    const testList = state([true]);
    const inputRef = ref();
    const inputRef2 = ref();

    subscribe(() => {
      testState3.update("It Changed");
    }, [testState1]);

    afterMounted(() => {
      inputRef()?.focus();
    });

    // template
    const { div, button, input, a, text, br, ul, li, comment } = h;
    div({ style: {} }, () => {
      button({
        "data-testid": "test-click",
        subscribe: testState1,
        click: () => testState1.value++,
        text: () => `${testState1.value}`,
      });
      button({
        "data-testid": "test-click2",
        text: "Test 2",
        click: () => testState2.value++,
      });
      div({ "data-testid": "test-click2-div", subscribe: testState2 }, () => {
        text(testState2.value);
      });
      div({ "data-testid": "test-sideeffect-div", subscribe: testState3 }, () => {
        text(testState3.value);
      });
      button({
        id: "test-bool-btn",
        click: () => (testBool.value = !testBool.value),
        text: "Toggle",
      });
      div({ subscribe: testBool }, () => {
        if (testBool.value) {
          div({ id: "test-bool-div", text: "I do not exist when test bool is false." });
        }
      });
      button({
        id: "test-list-btn",
        click: () => (testList.value = [...testList.value, false, true, false]),
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
      button({ click: () => inputRef2()?.focus(), id: "focus-btn", text: "Focus" });
      input({ type: "text", ref: inputRef, id: "ref-input" });
      input({ type: "text", ref: inputRef2, id: "ref-input2" });
      h.button({
        click: () => updateTest.update(updateTest.value + 1),
        text: "Update test",
        id: "update-test-btn",
      });
      h.div({ subscribe: updateTest, id: "update-test-text" }, () => {
        h.text(updateTest.value);
      });
    });
  });
};
