import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-gl=angle"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo(0, 1200)); await page.waitForTimeout(1500);
await page.screenshot({ path: process.env.OUT + "/hero-grain-mid.png" });
await browser.close();
