/* Visual verification screenshots: desktop scroll-video positions,
   water background, and mobile touch flashlight. */
import { chromium, devices } from "playwright";
import { mkdirSync } from "fs";

const OUT = process.env.SHOT_DIR || "/tmp/hippo-shots";
const BASE = "http://localhost:3000";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--use-gl=angle"],
});

/* ── Desktop ── */
const desktop = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await desktop.goto(BASE, { waitUntil: "networkidle" });
await desktop.waitForTimeout(2500);
await desktop.screenshot({ path: `${OUT}/desktop-hero-0.png` });

// Mid-scrub positions of the hero (350vh section => scrollable = 2.5 * 900)
for (const [name, frac] of [["33", 0.33], ["66", 0.66], ["95", 0.95]]) {
  await desktop.evaluate((f) => window.scrollTo(0, 2.5 * 900 * f), frac);
  await desktop.waitForTimeout(900); // let the lerp settle
  await desktop.screenshot({ path: `${OUT}/desktop-hero-${name}.png` });
}

// Below the hero: water background over sections + mouse flashlight
await desktop.evaluate(() => window.scrollTo(0, 2.5 * 900 + 1200));
await desktop.waitForTimeout(800);
await desktop.mouse.move(800, 450);
await desktop.waitForTimeout(600);
await desktop.screenshot({ path: `${OUT}/desktop-sections-flashlight.png` });

// Full page for layout review
await desktop.evaluate(() => window.scrollTo(0, 0));
await desktop.waitForTimeout(400);
await desktop.screenshot({ path: `${OUT}/desktop-full.png`, fullPage: true });
await desktop.close();

/* ── Mobile (touch) ── */
const iphone = devices["iPhone 13"];
const ctx = await browser.newContext({ ...iphone });
const mobile = await ctx.newPage();
await mobile.goto(BASE, { waitUntil: "networkidle" });
await mobile.waitForTimeout(2500);
await mobile.screenshot({ path: `${OUT}/mobile-hero.png` });

// Scroll past hero to a section where the water canvas shows
await mobile.evaluate(() => window.scrollTo(0, 844 * 2.5 + 900));
await mobile.waitForTimeout(800);
await mobile.screenshot({ path: `${OUT}/mobile-section-noflash.png` });

// Simulate a touch drag => flashlight should appear
await mobile.touchscreen.tap(195, 400);
await mobile.waitForTimeout(120);
const cdp = await ctx.newCDPSession(mobile);
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: 195, y: 400 }],
});
for (let i = 1; i <= 6; i++) {
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 195 + i * 5, y: 400 - i * 8 }],
  });
  await mobile.waitForTimeout(60);
}
await mobile.screenshot({ path: `${OUT}/mobile-section-flashlight-on.png` });
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await mobile.waitForTimeout(1600);
await mobile.screenshot({ path: `${OUT}/mobile-section-flashlight-faded.png` });
await ctx.close();

await browser.close();
console.log("done:", OUT);
