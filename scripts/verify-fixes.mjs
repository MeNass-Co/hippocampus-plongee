import { chromium } from "playwright";
import { mkdirSync } from "fs";
const OUT = process.env.SHOT_DIR || "/tmp/verify";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-gl=angle"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

async function shotAt(path, selector, name) {
  await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
    window.scrollBy(0, -80);
  }, selector);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

await shotAt("/", "#galerie", "fix-gallery");
await page.evaluate(() => window.scrollBy(0, 300)); await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/fix-gallery-2.png` });
await shotAt("/", "#agenda", "fix-agenda");
// voyages has no id — scroll to its title text
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2,h3")].find(e => e.textContent.includes("Voyages"));
  if (h) h.scrollIntoView({ block: "start", behavior: "instant" });
  window.scrollBy(0, -100);
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/fix-voyages.png` });
await page.goto("http://localhost:3000/le-club", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const h = [...document.querySelectorAll("h2,h3")].find(e => e.textContent.includes("quipage"));
  if (h) h.scrollIntoView({ block: "start", behavior: "instant" });
  window.scrollBy(0, -80);
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/fix-team.png` });
await browser.close();
console.log("done", OUT);
