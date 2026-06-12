/* Cold-load proof: on a throttled connection with an empty cache, scroll
   immediately after load and verify the hero canvas actually advances
   (different pixels at different scroll depths) instead of freezing. */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--use-gl=angle"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

const cdp = await page.context().newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 40,
  downloadThroughput: (8 * 1024 * 1024) / 8, // 8 Mbps — mid-range 4G
  uploadThroughput: (1 * 1024 * 1024) / 8,
});

async function canvasSignature() {
  return page.evaluate(() => {
    const canvas = document.querySelector("section canvas");
    if (!canvas || canvas.width === 0) return null;
    const ctx = canvas.getContext("2d");
    const d = ctx.getImageData(0, 0, canvas.width, 200).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 40) sum += d[i] + d[i + 1] + d[i + 2];
    return Math.round(sum / (d.length / 40));
  });
}

// Don't wait for networkidle — a real user scrolls as soon as paint happens
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(300);

const signatures = [];
for (let step = 1; step <= 5; step++) {
  await page.evaluate((s) => window.scrollTo(0, 2.5 * 900 * (s * 0.18)), step);
  await page.waitForTimeout(450); // lerp + whatever frames have arrived
  signatures.push(await canvasSignature());
}

const distinct = new Set(signatures.filter((s) => s !== null)).size;
console.log(JSON.stringify({ signatures, distinct }, null, 1));
await browser.close();
