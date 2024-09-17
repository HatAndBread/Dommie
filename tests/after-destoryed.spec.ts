import { test, expect } from "@playwright/test";

const DEV_SERVER = "localhost:3000";

// Stateful component

test("After destroy callbacks are called when components are removed", async ({ page }) => {
  await page.goto(DEV_SERVER);

  const afterDestroyText = page.locator("#times-after-destroy-called-text");
  await expect(afterDestroyText).toHaveText(`Times afterDestroyed called: 0`);
  const toggleBtn = page.locator("#toggle-show-after-destroy");
  await expect(page.locator("#child-with-after-destroy-1")).toBeHidden();
  await toggleBtn.click();
  await expect(page.locator("#child-with-after-destroy-1")).not.toBeHidden();
  await toggleBtn.click();
  await expect(page.locator("#child-with-after-destroy-1")).toBeHidden();
  await expect(page.locator("#times-after-destroy-called-text")).toHaveText(
    `Times afterDestroyed called: 2`,
  );
  await toggleBtn.click();
  await expect(page.locator("#child-with-after-destroy-1")).not.toBeHidden();
  await toggleBtn.click();
  await expect(page.locator("#child-with-after-destroy-1")).toBeHidden();
  await expect(page.locator("#times-after-destroy-called-text")).toHaveText(
    `Times afterDestroyed called: 4`,
  );
});
