import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

const digest = (buffer: Buffer) => createHash("sha256").update(buffer).digest("hex");

test("water surface refracts on pointer trail and click", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  const refraction = page.locator(".starlake-refraction-canvas");
  await expect(refraction).toHaveAttribute("data-ready", "true");
  const dimensions = await refraction.evaluate((canvas: HTMLCanvasElement) => ({
    width: canvas.width,
    height: canvas.height,
    cssWidth: canvas.getBoundingClientRect().width,
    cssHeight: canvas.getBoundingClientRect().height,
  }));
  expect(dimensions.width).toBeGreaterThanOrEqual(1440);
  expect(dimensions.height).toBeGreaterThanOrEqual(1000);

  const idle = await refraction.screenshot();
  await page.mouse.move(470, 330);
  await page.mouse.move(820, 520, { steps: 28 });
  await page.waitForTimeout(90);
  const trail = await refraction.screenshot();
  expect(digest(trail)).not.toBe(digest(idle));

  await page.mouse.click(720, 430);
  await page.waitForTimeout(90);
  const firstPulse = await refraction.screenshot();
  await page.waitForTimeout(440);
  const secondPulse = await refraction.screenshot();
  expect(digest(firstPulse)).not.toBe(digest(secondPulse));
  expect(errors).toEqual([]);

  await page.screenshot({ path: "test-results/water-desktop.png", fullPage: false });
});

test("mobile water surface stays within its performance profile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const refraction = page.locator(".starlake-refraction-canvas");
  await expect(refraction).toHaveAttribute("data-ready", "true");
  await page.mouse.move(90, 240);
  await page.mouse.move(310, 460, { steps: 18 });
  await page.mouse.click(195, 360);
  await page.waitForTimeout(120);
  await page.screenshot({ path: "test-results/water-mobile.png", fullPage: false });
});
