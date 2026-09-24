/**
 * Session 2 vibe-coded screens gate — docs/homework/session-2/vibe-coding.md.
 *
 * Runs the SiteOps Field prototype in both colour schemes and checks the
 * contract rules the screens must honour, beyond what axe can see.
 */
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const ROOT = path.resolve(import.meta.dirname, "../..");
const APP = pathToFileURL(path.join(ROOT, "src/session-2/siteops-app/index.html")).href;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const FIELD_MIN_TARGET_PX = 56; // A11Y-007

// 1×1 PNG, enough for the file input.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

let browser: Browser;

before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    args: ["--no-sandbox"],
  });
});
after(async () => {
  await browser?.close();
});

async function openApp(colorScheme: "light" | "dark"): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme });
  // Fonts are cosmetic; keep the gate independent of the network.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "load" });
  return { ctx, page };
}

async function axeViolations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  return r.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 3) }));
}

async function openDetail(page: Page, title: RegExp) {
  await page.getByRole("button", { name: title }).first().click();
  await page.getByRole("heading", { level: 1, name: title }).waitFor();
}

for (const scheme of ["dark", "light"] as const) {
  describe(`SiteOps Field (${scheme})`, () => {
    test("My Work and Work Order Detail have zero axe violations", async () => {
      const { ctx, page } = await openApp(scheme);
      try {
        assert.deepEqual(await axeViolations(page), [], "My Work");
        await openDetail(page, /น้ำรั่วจากท่อเมน/);
        assert.deepEqual(await axeViolations(page), [], "Work Order Detail");
      } finally {
        await ctx.close();
      }
    });
  });
}

test("My Work lists P1 first, with a live SLA timer, icon + label badges (RULE-009, RULE-006)", async () => {
  const { ctx, page } = await openApp("dark");
  try {
    assert.equal(await page.locator("html").getAttribute("lang"), "th");
    assert.equal(await page.getByRole("heading", { level: 1 }).innerText(), "งานของฉัน");
    const ids = await page.locator(".list").first().locator(".wo-id").allInnerTexts();
    assert.deepEqual(ids.slice(0, 2).sort(), ["SOPS-2417", "SOPS-2419"], `P1 first, got ${ids.join(", ")}`);
    assert.ok((await page.getByRole("timer").count()) >= 2, "each open P1 has an SLA timer");
    assert.match(await page.getByRole("timer").first().innerText(), /เกินกำหนด|เหลือ/);
    const badges = page.locator(".badge");
    for (let i = 0; i < (await badges.count()); i++) {
      assert.equal(await badges.nth(i).locator("svg").count(), 1, "badge has an icon");
      assert.ok((await badges.nth(i).innerText()).trim().length > 0, "badge has a label");
    }
  } finally {
    await ctx.close();
  }
});

test("รับงาน is undoable from the toast (RULE-004)", async () => {
  const { ctx, page } = await openApp("dark");
  try {
    const card = page.locator("article", { has: page.getByText("SOPS-2419") });
    await card.getByRole("button", { name: "รับงาน" }).click();
    await card.getByText("รับงานแล้ว").waitFor();
    await page.getByRole("button", { name: "เลิกทำ" }).click();
    await card.getByText("มอบหมายแล้ว").waitFor();
    await card.getByRole("button", { name: "รับงาน" }).waitFor();
  } finally {
    await ctx.close();
  }
});

test("ปิดงาน is blocked until evidence exists, then asks for confirmation (RULE-005, RULE-004)", async () => {
  const { ctx, page } = await openApp("dark");
  try {
    await openDetail(page, /ลิฟต์โดยสารตัวที่ 3/);
    const done = page.getByRole("button", { name: "ปิดงาน" });
    assert.equal(await done.getAttribute("aria-disabled"), "true", "blocked without a photo");
    assert.match(await page.locator("#done-reason").innerText(), /แนบหลักฐานอย่างน้อย 1 รูปก่อนปิดงาน/);

    await page.locator("#photo-input").setInputFiles({ name: "leak.png", mimeType: "image/png", buffer: PNG });
    await page.getByRole("img", { name: /หลักฐานรูปที่ 1/ }).waitFor();
    assert.equal(await done.getAttribute("aria-disabled"), null, "enabled after one photo");

    await done.click();
    const dialog = page.getByRole("dialog", { name: /ปิดงาน SOPS-2417/ });
    await dialog.waitFor();
    await dialog.getByRole("button", { name: "ยืนยันปิดงาน" }).click();
    await page.getByRole("heading", { level: 1, name: "งานของฉัน" }).waitFor();
    const closed = page.locator("article", { has: page.getByText("SOPS-2417") });
    await closed.getByText("ปิดงานแล้ว").waitFor();
  } finally {
    await ctx.close();
  }
});

test("offline is a state: banner with count, actions queue as รอส่ง, then send (RULE-001)", async () => {
  const { ctx, page } = await openApp("dark");
  try {
    await page.getByRole("button", { name: "จำลองออฟไลน์" }).click();
    const banner = page.getByRole("status").filter({ hasText: "ออฟไลน์" });
    await banner.waitFor();
    assert.match(await banner.innerText(), /รอส่ง 0 รายการ/);

    const card = page.locator("article", { has: page.getByText("SOPS-2408") });
    await card.getByRole("button", { name: "รับงาน" }).click();
    await card.getByText("รอส่ง").waitFor();
    assert.match(await banner.innerText(), /รอส่ง 1 รายการ/);

    await page.getByRole("button", { name: "กลับมาออนไลน์" }).click();
    await page.getByText(/ส่งครบแล้ว 1 รายการ/).waitFor({ timeout: 5000 });
    assert.equal(await card.getByText("รอส่ง").count(), 0);
  } finally {
    await ctx.close();
  }
});

test("field targets are at least 56 px (A11Y-007)", async () => {
  const { ctx, page } = await openApp("dark");
  try {
    for (const name of ["รับงาน", "เริ่มงาน", "ปิดงาน"]) {
      const box = await page.getByRole("button", { name, exact: true }).first().boundingBox();
      assert.ok(box && box.height >= FIELD_MIN_TARGET_PX, `${name} height ${box?.height}`);
    }
    await openDetail(page, /ลิฟต์โดยสารตัวที่ 3/);
    for (const name of ["งานของฉัน", "แก้ชั่วคราว", "ปิดงาน"]) {
      const box = await page.getByRole("button", { name, exact: true }).boundingBox();
      assert.ok(box && box.height >= FIELD_MIN_TARGET_PX, `${name} height ${box?.height}`);
    }
    const add = await page.locator("label[for=photo-input]").boundingBox();
    assert.ok(add && add.height >= FIELD_MIN_TARGET_PX, `photo button height ${add?.height}`);
  } finally {
    await ctx.close();
  }
});
