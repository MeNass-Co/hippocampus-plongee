/* A/B pixel proof for the touch flashlight: same viewport, same scroll,
   measure mean brightness around the touch point with and without touch. */
import { chromium, devices } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--use-gl=angle"],
});

const touch = { x: 190, y: 670 };

async function meanBrightness(page) {
  // Full viewport: the glow may sit behind opaque sections, but enough raw
  // background is always exposed somewhere for the mean to move
  const buf = await page.screenshot();
  // Decode PNG via the browser itself to avoid native deps
  const b64 = buf.toString("base64");
  return page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += (d[i] + d[i + 1] + d[i + 2]) / 3;
    return sum / (d.length / 4);
  }, b64);
}

const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
// Scroll to a section where raw background is exposed at the bottom
await page.evaluate(() => window.scrollTo(0, 844 * 2.5 + 700));
await page.waitForTimeout(1500); // let reveals finish

const before = await meanBrightness(page);

const cdp = await ctx.newCDPSession(page);
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: touch.x, y: touch.y }],
});
for (let i = 1; i <= 8; i++) {
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: touch.x + i, y: touch.y - i }],
  });
  await page.waitForTimeout(50);
}
await page.waitForTimeout(400); // glow fade-in
const during = await meanBrightness(page);
await page.screenshot({ path: "/tmp/hippo-shots/mobile-flashlight-proof.png" });

await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await page.waitForTimeout(2000); // glow fade-out
const after = await meanBrightness(page);

console.log(JSON.stringify({ before, during, after }, null, 1));
await ctx.close();
await browser.close();
