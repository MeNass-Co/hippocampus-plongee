/* Section-by-section walk: scroll to each section, let reveals fire, screenshot. */
import { chromium, devices } from "playwright";
import { mkdirSync } from "fs";

const OUT = process.env.SHOT_DIR || "/tmp/hippo-walk";
const BASE = "http://localhost:3000";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--use-gl=angle"],
});

async function walkPage(page, path, prefix, viewportH) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const total = await page.evaluate(() => document.body.scrollHeight);
  let i = 0;
  for (let y = 0; y < total - viewportH / 2; y += Math.round(viewportH * 0.85)) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(700); // reveals + lerp settle
    await page.screenshot({ path: `${OUT}/${prefix}-${String(i).padStart(2, "0")}.png` });
    i++;
    if (i > 30) break;
  }
}

const desktop = await browser.newPage({ viewport: { width: 1600, height: 900 } });
for (const [path, prefix] of [
  ["/", "home"],
  ["/le-club", "club"],
  ["/reglement-interieur", "reglement"],
  ["/mentions-legales", "mentions"],
]) {
  await walkPage(desktop, path, `d-${prefix}`, 900);
}
await desktop.close();

const iphone = devices["iPhone 13"];
const ctx = await browser.newContext({ ...iphone });
const mobile = await ctx.newPage();
await walkPage(mobile, "/", "m-home", 844);
await ctx.close();

await browser.close();
console.log("walk done:", OUT);
