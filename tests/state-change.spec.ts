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

test("An element that is subscribed to a boolean state is toggled when the state changes", async ({
  page,
}) => {
  await page.goto(DEV_SERVER);

  const boolDiv = page.locator("#test-bool-div");
  const boolButton = page.locator("#test-bool-btn");
  await expect(boolDiv).toHaveCount(0);
  await boolButton.click();
  await expect(boolDiv).toHaveCount(1);
  await boolButton.click();
  await expect(boolDiv).toHaveCount(0);
});

test("An element that is subscribed to a list state is updated when the list state changes", async ({
  page,
}) => {
  await page.goto(DEV_SERVER);

  const listButton = page.locator("#test-list-btn");
  const items = page.locator(".test-li");
  const itemsCheckbox = page.locator(".test-li-checkbox");
  await expect(items).toHaveCount(1);
  await expect(itemsCheckbox).toHaveCount(1);
  await expect(itemsCheckbox.first()).toBeChecked();
  await listButton.click();
  await expect(items).toHaveCount(4);
  await expect(itemsCheckbox).toHaveCount(4);
  await expect(itemsCheckbox.last()).not.toBeChecked();
  await itemsCheckbox.last().click();
  await expect(itemsCheckbox).toHaveCount(4);
  await expect(itemsCheckbox.first()).toBeChecked();
  await expect(itemsCheckbox.last()).toBeChecked();
});

test("An element with a ref is focused on", async ({ page }) => {
  await page.goto(DEV_SERVER);

  const input = page.locator("#ref-input");
  await expect(input).toBeFocused();
  const focusBtn = page.locator("#focus-btn");
  await focusBtn.click();
  const input2 = page.locator("#ref-input2");
  await expect(input2).toBeFocused();
});
