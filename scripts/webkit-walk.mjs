// WebKit (Safari engine) walk of production — desktop + iPhone viewport.
// Screenshots -> OUT dir. Progressive scroll with settle so reveals fire.
import { webkit } from "playwright";

const OUT = process.env.OUT || "/private/tmp/claude-501/-private-tmp/e35a7843-2360-4036-b16f-748ee7438ec1/scratchpad/webkit-walk";
const BASE = "https://hippocampus-plongee.vercel.app";
const { mkdirSync } = await import("node:fs");
mkdirSync(OUT, { recursive: true });

const browser = await webkit.launch();

async function walkPage(ctxOpts, path, tag, stops) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 }).catch(async () => {
    await page.goto(BASE + path, { waitUntil: "load", timeout: 60000 });
  });
  await page.waitForTimeout(2500);
  const total = await page.evaluate(() => document.body.scrollHeight - innerHeight);
  for (const s of stops) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), Math.round(total * s));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${tag}-${Math.round(s * 100)}.png`, timeout: 60000 });
  }
  if (errors.length) console.log(`ERRORS ${tag}:\n` + errors.slice(0, 10).join("\n"));
  else console.log(`OK ${tag} (no js/console errors)`);
  await ctx.close();
}

const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const iphone = {
  viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
};

// Desktop Safari: home hero-heavy walk
await walkPage(desktop, "/", "wk-desk-home", [0, 0.12, 0.25, 0.5, 0.75, 1]);
await walkPage(desktop, "/le-club", "wk-desk-club", [0, 0.33, 0.66, 1]);
// iPhone Safari: all pages
await walkPage(iphone, "/", "wk-iph-home", [0, 0.15, 0.35, 0.6, 0.85, 1]);
await walkPage(iphone, "/le-club", "wk-iph-club", [0, 0.33, 0.66, 1]);
await walkPage(iphone, "/reglement-interieur", "wk-iph-reglement", [0, 0.5, 1]);
await walkPage(iphone, "/mentions-legales", "wk-iph-mentions", [0, 1]);

await browser.close();
console.log("WEBKIT WALK DONE");
