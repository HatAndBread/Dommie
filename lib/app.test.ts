import app from "./app";
import type { Component } from "./app";
import { test, expect } from "bun:test";

test("It throws when the given css selector is not in the dom", () => {
  const input: Component = (h) => {
    return h.component(() => {});
  };
  expect(() => app(input, "id")).toThrow("No element found with css selector: id");
});

test("It throws if no element is given", () => {
  const input: Component = (h) => {
    return h.component(() => {});
  };
  // @ts-ignore
  expect(() => app(input)).toThrow("No element found: undefined");
});

test("It creates a component when an id is given", () => {
  document.body.innerHTML = `<div id="app"></div>`;
  const input: Component = (h) => {
    return h.component(() => {});
  };

  app(input, "#app");
  const firstChild = document.getElementById("app")?.firstChild as HTMLElement;
  expect(firstChild.tagName).toBe("COMPONENT");
});

test("It creates a component when a class is given", () => {
  document.body.innerHTML = `<div class="app"></div>`;
  const input: Component = (h) => {
    return h.component(() => {});
  };
  app(input, ".app");
  const firstChild = document.querySelector(".app")?.firstChild as HTMLElement;
  expect(firstChild.tagName).toBe("COMPONENT");
});

test("It creates a component when an element is given", () => {
  document.body.innerHTML = `<div id="app"></div>`;
  const input: Component = (h) => {
    return h.component(() => {});
  };

  const element = document.getElementById("app");

  app(input, element as HTMLElement);
  const firstChild = document.getElementById("app")?.firstChild as HTMLElement;
  expect(firstChild.tagName).toBe("COMPONENT");
});

// test("It updates subscribed elements", () => {
//   document.body.innerHTML = `<div id="app"></div>`;
//   const input: Component = (h) => {
//     return h.component(({ state }) => {
//       const thing = state(1);
//       const click = () => {
//         thing.update(thing.value + 1);
//       };
//       const { div, button } = h;
//       div({ subscribe: thing }, () => {
//         button({ text: `${thing.value}`, click });
//       });
//     });
//   };

//   app(input, "#app");
//   const button = document.querySelector("button") as HTMLButtonElement;
//   expect(button.textContent).toBe("1");
//   button.click();
//   expect(button.textContent).toBe("2");
//   button.click();
//   expect(button.textContent).toBe("3");
// });
