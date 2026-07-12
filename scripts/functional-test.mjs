// Functional test of live prod: contact form validation + submit, CTA anchor nav, mobile hamburger.
import { chromium } from "playwright";

const BASE = "https://hippocampus-plongee.vercel.app";
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-gl=angle"] });
const results = [];
const ok = (name, pass, detail = "") => results.push(`${pass ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);

// 1. Contact form on /le-club#contact
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/le-club#contact", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);

  const form = page.locator("#contact form");
  ok("form present", (await form.count()) === 1);

  // Empty submit must NOT show confirmation (validation blocks)
  await page.locator("#contact button[type=submit]").click();
  await page.waitForTimeout(500);
  const confirmEarly = await page.getByText("Votre client mail").count();
  ok("empty submit blocked by validation", confirmEarly === 0);

  // Fill and submit
  await page.fill("#fullname", "Jean Testeur");
  await page.fill("#email", "jean@example.com");
  await page.selectOption("#subject", "Baptême de plongée");
  await page.fill("#message", "Bonjour, test fonctionnel.");
  await page.locator("#contact button[type=submit]").click();
  await page.waitForTimeout(1500);
  const confirmed = await page.getByText("Votre client mail").count();
  ok("filled submit reaches confirmation", confirmed === 1);

  // Reset link works
  if (confirmed) {
    await page.getByText("Envoyer un autre message").click();
    await page.waitForTimeout(400);
    ok("reset returns to form", (await page.locator("#contact form").count()) === 1);
  }
  await page.close();
}

// 2. Home CTA "Devenir Membre" navigates to /le-club#contact and lands on section
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  const cta = page.getByRole("link", { name: "Devenir Membre" }).first();
  ok("Devenir Membre visible", await cta.isVisible());
  await cta.click();
  await page.waitForTimeout(2500);
  const url = page.url();
  const inView = await page.evaluate(() => {
    const el = document.getElementById("contact");
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  });
  ok("CTA lands on contact section", url.includes("/le-club#contact") && inView, url);
  await page.close();
}

// 3. Mobile hamburger menu
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  const burger = page.locator("nav button").first();
  await burger.click();
  await page.waitForTimeout(800);
  const menu = page.locator("#mobile-menu");
  const clubLink = menu.getByRole("link", { name: /Équipage|Le Club/i }).first();
  const visible = await clubLink.isVisible().catch(() => false);
  ok("mobile menu opens", visible);
  if (visible) {
    await clubLink.click();
    await page.waitForTimeout(2500);
    ok("mobile menu link navigates", page.url().includes("/le-club"), page.url());
  }
  await page.close();
} catch (e) {
  ok("mobile menu", false, e.message.split("\n")[0]);
}

await browser.close();
console.log(results.join("\n"));
console.log("FUNCTIONAL TEST DONE");
