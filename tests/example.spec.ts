import { test, expect } from "@playwright/test";

const DEV_SERVER = "localhost:3000";

// Stateful component
test("An element subscribed to state that updates that same state is updated when the state changes", async ({
  page,
}) => {
  await page.goto(DEV_SERVER);

  const buttonText1 = await page.getByTestId("test-click").textContent();
  expect(buttonText1).toBe("0");
  await page.getByTestId("test-click").click();
  const buttonText2 = await page.getByTestId("test-click").textContent();
  expect(buttonText2).toBe("1");
  await page.getByTestId("test-click").click();
  const buttonText3 = await page.getByTestId("test-click").textContent();
  expect(buttonText3).toBe("2");
});

test("An element that is subscribed to state and is not the element that initiated the state change is changed", async ({
  page,
}) => {
  await page.goto(DEV_SERVER);

  const button = page.getByTestId("test-click2");
  const subscribedDivText1 = await page.getByTestId("test-click2-div").textContent();
  expect(subscribedDivText1).toBe("0");
  await button.click();
  const subscribedDivText2 = await page.getByTestId("test-click2-div").textContent();
  expect(subscribedDivText2).toBe("1");
});

test("State that is subscribed to the side effect of another state change is updated when the original changes", async ({
  page,
}) => {
  await page.goto(DEV_SERVER);

  const sideEffectDivText = await page.getByTestId("test-sideeffect-div").textContent();
  expect(sideEffectDivText).toBe("Side Effect Example");
  await page.getByTestId("test-click").click();
  const sideEffectDivText2 = await page.getByTestId("test-sideeffect-div").textContent();
  expect(sideEffectDivText2).toBe("It Changed");
});
