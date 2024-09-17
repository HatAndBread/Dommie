import { test, expect } from "@playwright/test";

const DEV_SERVER = "localhost:3000";

test("State works after routing to another page", async ({ page }) => {
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

test("Nested routes work", async ({ page }) => {
  await page.goto(DEV_SERVER);

  const btn = page.locator("#go-to-nested-btn");
  await btn.click();
  const url = page.url();
  expect(url).toBe("http://" + DEV_SERVER + "/nested/route");
  const h1 = page.locator("#nested-route-h1");
  expect(await h1.innerText()).toBe("This is a nested route");
});

test("Route with wildcard works", async ({ page }) => {
  await page.goto(DEV_SERVER);
  const btn = page.locator("#go-to-wildcards-btn");

  await btn.click();
  const url = page.url();
  expect(url).toBe("http://" + DEV_SERVER + "/this/123/is/456/a/789/test");
  const pathVariable1 = page.locator("#path-variable-0");
  const pathVariable2 = page.locator("#path-variable-1");
  const pathVariable3 = page.locator("#path-variable-2");
  expect(await pathVariable1.innerText()).toBe("123");
  expect(await pathVariable2.innerText()).toBe("456");
  expect(await pathVariable3.innerText()).toBe("789");
});

test("Route with wildcard ending in path variable works", async ({ page }) => {
  await page.goto(DEV_SERVER);
  const btn = page.locator("#go-to-wildcards-2-btn");

  await btn.click();
  const url = page.url();
  expect(url).toBe("http://" + DEV_SERVER + "/this/123/is/456/a/789/test/abc");
  const pathVariable1 = page.locator("#path-variable-0");
  const pathVariable2 = page.locator("#path-variable-1");
  const pathVariable3 = page.locator("#path-variable-2");
  const pathVariable4 = page.locator("#path-variable-3");
  expect(await pathVariable1.innerText()).toBe("123");
  expect(await pathVariable2.innerText()).toBe("456");
  expect(await pathVariable3.innerText()).toBe("789");
  expect(await pathVariable4.innerText()).toBe("abc");
});
