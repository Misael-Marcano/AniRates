import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AniRate/i);
  });

  test("navbar search shortcut focuses input", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("/");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe("INPUT");
  });

  test("registro page renders form", async ({ page }) => {
    await page.goto("/registro");
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/contraseña/i).first()).toBeVisible();
  });

  test("buscar page renders results grid", async ({ page }) => {
    await page.goto("/buscar");
    await expect(page.locator("body")).toContainText(/buscar|resultados|filtros/i);
  });

  test("skip link is present and accessible", async ({ page }) => {
    await page.goto("/");
    const skip = page.locator(".skip-link");
    await expect(skip).toBeAttached();
    await expect(skip).toHaveAttribute("href", "#main-content");
  });
});
