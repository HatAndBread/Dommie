import { test, expect } from "@playwright/test";

const DEV_SERVER = "localhost:3000";

// Stateful component

test("After destroy callbacks are called when components are removed", async ({ page }) => {
  await page.goto(DEV_SERVER);

  const btn = page.locator("#go-to-a-btn");
  await btn.click();
  const url = page.url();
  expect(url).toBe("http://" + DEV_SERVER + "/page-a");
  const text = page.locator("#thing-text");
  expect(await text.innerText()).toBe("Change me!");
  const changeTextBtn = page.locator("#change-text-btn");
  await changeTextBtn.click();
  expect(await text.innerText()).toBe("I was changed!");
});
