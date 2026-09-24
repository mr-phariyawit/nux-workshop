/**
 * Session 2 Intake dashboard gate — docs/homework/session-2/vibe-coding.md § Intake (dashboard).
 *
 * Runs the SiteOps Intake prototype at desktop size in both colour schemes and
 * checks the contract rules the screen must honour, beyond what axe can see.
 */
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const ROOT = path.resolve(import.meta.dirname, "../..");
const APP = pathToFileURL(path.join(ROOT, "src/session-2/siteops-intake/index.html")).href;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const DASHBOARD_MIN_TARGET_PX = 44; // A11Y-007, DESIGN.md §5

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

async function openApp(colorScheme: "light" | "dark" = "light"): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme });
  // Fonts are cosmetic; keep the gate independent of the network.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "load" });
  await page.locator("#queue-section[aria-busy=false]").waitFor();
  return { ctx, page };
}

async function axeViolations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  return r.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 3) }));
}

async function kpis(page: Page) {
  const read = async (k: string) => Number(await page.locator(`[data-kpi=${k}] .kpi-num`).innerText());
  return { open: await read("open"), p1: await read("p1"), over: await read("over") };
}

const row = (page: Page, id: string) => page.locator(`tr[data-id="${id}"]`);

for (const scheme of ["light", "dark"] as const) {
  describe(`SiteOps Intake (${scheme})`, () => {
    test("queue, form errors and dialogs have zero axe violations", async () => {
      const { ctx, page } = await openApp(scheme);
      try {
        assert.deepEqual(await axeViolations(page), [], "loaded");
        await page.getByRole("button", { name: "บันทึกใบงาน" }).click();
        assert.deepEqual(await axeViolations(page), [], "form with errors");
        await row(page, "SOPS-2420").getByRole("button", { name: "มอบหมาย" }).click();
        await page.getByRole("dialog", { name: /มอบหมาย SOPS-2420/ }).waitFor();
        assert.deepEqual(await axeViolations(page), [], "assign dialog");
        await page.keyboard.press("Escape");
        await row(page, "SOPS-2422").getByRole("button", { name: "รวมใบงาน" }).click();
        await page.getByRole("dialog", { name: /รวมใบงาน SOPS-2422/ }).waitFor();
        assert.deepEqual(await axeViolations(page), [], "merge dialog");
      } finally {
        await ctx.close();
      }
    });
  });
}

test("light theme and md tier by default; Thai lang; one primary button (prompt, RULE-003)", async () => {
  const { ctx, page } = await openApp("light");
  try {
    assert.equal(await page.locator("html").getAttribute("lang"), "th");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    assert.equal(bg, "rgb(246, 248, 250)", "light canvas #F6F8FA");
    assert.equal(await page.locator(".btn-primary:visible").count(), 1, "only บันทึกใบงาน is primary");
  } finally {
    await ctx.close();
  }
});

test("KPI header counts open, P1 and over-SLA orders (AC-SOPS-009)", async () => {
  const { ctx, page } = await openApp();
  try {
    assert.deepEqual(await kpis(page), { open: 7, p1: 3, over: 1 });
  } finally {
    await ctx.close();
  }
});

test("queue lists P1 first with SLA timers, icon + label badges and per-row sync time (RULE-009, RULE-006, GAP-006)", async () => {
  const { ctx, page } = await openApp();
  try {
    const ids = await page.locator("tbody tr[data-id]").evaluateAll((rs) => rs.map((r) => r.getAttribute("data-id")));
    assert.deepEqual(ids.slice(0, 3).sort(), ["SOPS-2417", "SOPS-2419", "SOPS-2421"], `P1 first, got ${ids.join(", ")}`);
    assert.equal(ids.at(-1), "SOPS-2401", "done at the bottom");
    assert.match(await row(page, "SOPS-2417").getByRole("timer").innerText(), /แก้ชั่วคราว เกินกำหนด/);
    assert.match(await row(page, "SOPS-2419").getByRole("timer").innerText(), /รับงาน เหลือ \d\d:\d\d/);
    const badges = page.locator("tbody .badge");
    for (let i = 0; i < (await badges.count()); i++) {
      assert.equal(await badges.nth(i).locator("svg").count(), 1, "badge has an icon");
      assert.ok((await badges.nth(i).innerText()).trim().length > 0, "badge has a label");
    }
    const synced = await page.locator("tbody tr[data-id] td:nth-child(6)").allInnerTexts();
    for (const s of synced) assert.match(s, /\d\d:\d\d/, "every row shows its last-synced time");
  } finally {
    await ctx.close();
  }
});

test("near-breach P1 raises a banner with no dismiss control; it clears on acknowledge (RULE-009)", async () => {
  const { ctx, page } = await openApp();
  try {
    const banner = page.locator("[data-alert=SOPS-2421]");
    await banner.waitFor();
    assert.equal(await page.getByRole("alert").count(), 1);
    assert.match(await banner.innerText(), /P1 SOPS-2421 ยังไม่มีช่างรับงาน/);
    assert.match(await banner.getByRole("timer").innerText(), /รับงาน เหลือ 0[0-4]:\d\d/);
    assert.equal(await banner.locator("button").count(), 0, "no dismiss control");
    assert.equal(await page.locator("[data-alert=SOPS-2419]").count(), 0, "12 min left is not near breach");

    // Assigning is not acknowledging: the banner stays.
    await row(page, "SOPS-2421").getByRole("button", { name: "มอบหมาย" }).click();
    await page.getByRole("radio", { name: /ช่างเอก/ }).check();
    await page.getByRole("dialog").getByRole("button", { name: "มอบหมาย" }).click();
    await row(page, "SOPS-2421").getByText("มอบหมายแล้ว").waitFor();
    assert.match(await banner.innerText(), /โทรตามช่างเอก/);

    await page.getByRole("button", { name: "จำลองช่างรับงาน P1" }).click();
    await banner.waitFor({ state: "detached" });
  } finally {
    await ctx.close();
  }
});

test("validation is inline with icon + text and focuses the first invalid field", async () => {
  const { ctx, page } = await openApp();
  try {
    await page.getByRole("button", { name: "บันทึกใบงาน" }).click();
    for (const [id, text] of [
      ["e-channel", "เลือกช่องทางแจ้ง"],
      ["e-reporter", "กรอกชื่อผู้แจ้ง"],
      ["e-floor", "กรอกชั้น"],
      ["e-details", "กรอกรายละเอียดอาการ"],
      ["e-pri", "เลือกความสำคัญ"],
    ]) {
      const err = page.locator(`#${id}`);
      assert.equal(await err.innerText(), text);
      assert.equal(await err.locator("svg").count(), 1, `${id} has an icon`);
    }
    assert.equal(await page.locator("#reporter").getAttribute("aria-invalid"), "true");
    assert.equal(await page.evaluate(() => (document.activeElement as HTMLInputElement).name), "channel");

    await page.getByLabel("ชั้น", { exact: true }).fill("99");
    await page.getByRole("button", { name: "บันทึกใบงาน" }).click();
    assert.equal(await page.locator("#e-floor").innerText(), "ชั้นต้องเป็น 1–45, B1–B3 หรือ RF");
    assert.equal(await page.locator("tbody tr[data-id]").count(), 8, "nothing saved");
  } finally {
    await ctx.close();
  }
});

test("saving a P1 creates a ใหม่ order with a timestamp and both deadlines (AC-SOPS-001, AC-SOPS-002)", async () => {
  const { ctx, page } = await openApp();
  try {
    assert.equal(await page.locator("[inputmode=numeric]#floor").count(), 1, "numeric keypad for floor");
    await page.getByRole("radio", { name: "LINE" }).check();
    await page.getByLabel("ผู้แจ้ง").fill("คุณก้อง (ผู้เช่า Vega)");
    await page.getByLabel("ชั้น", { exact: true }).fill("22");
    await page.getByLabel(/โซน/).fill("ห้องเซิร์ฟเวอร์");
    await page.getByLabel("รายละเอียดอาการ").fill("แอร์ห้องเซิร์ฟเวอร์ดับ อุณหภูมิขึ้นเร็ว");
    await page.getByRole("radio", { name: "P1" }).check();
    const preview = page.locator("#p1-deadlines");
    assert.match(await preview.innerText(), /รับงานภายใน \d\d:\d\d \(15 นาที\) · แก้ชั่วคราวภายใน \d\d:\d\d \(4 ชม\.\)/);

    await page.getByRole("button", { name: "บันทึกใบงาน" }).click();
    const r = row(page, "SOPS-2423");
    await r.waitFor();
    const text = await r.innerText();
    assert.match(text, /แจ้งเมื่อ \d\d:\d\d/);
    assert.match(text, /ใหม่/);
    assert.match(text, /LINE · คุณก้อง/);
    assert.match(text, /รับงานภายใน \d\d:\d\d/);
    assert.match(text, /แก้ชั่วคราวภายใน \d\d:\d\d/);
    assert.match(await r.getByRole("timer").innerText(), /รับงาน เหลือ 1[45]:\d\d/);
    assert.deepEqual(await kpis(page), { open: 8, p1: 4, over: 1 });
    assert.equal(await page.getByLabel("ผู้แจ้ง").inputValue(), "", "form cleared for the next call");
    await page.getByText(/บันทึกใบงาน SOPS-2423 แล้ว/).waitFor();
  } finally {
    await ctx.close();
  }
});

test("มอบหมาย sets มอบหมายแล้ว with the technician and is undoable (AC-SOPS-003, RULE-004)", async () => {
  const { ctx, page } = await openApp();
  try {
    const r = row(page, "SOPS-2420");
    await r.getByRole("button", { name: "มอบหมาย" }).click();
    const dialog = page.getByRole("dialog", { name: /มอบหมาย SOPS-2420/ });
    await dialog.getByRole("button", { name: "มอบหมาย" }).click();
    assert.equal(await dialog.locator("#e-tech").innerText(), "เลือกช่าง 1 คน", "must pick someone");
    await dialog.getByRole("radio", { name: /ช่างต้น · ประปา/ }).check();
    await dialog.getByRole("button", { name: "มอบหมาย" }).click();
    await r.getByText("มอบหมายแล้ว").waitFor();
    assert.match(await r.innerText(), /ช่างต้น/);
    assert.equal(await r.getByRole("button", { name: "มอบหมาย" }).count(), 0);

    await page.getByRole("button", { name: "เลิกทำ" }).click();
    await r.getByText("ใหม่").waitFor();
    assert.match(await r.innerText(), /ยังไม่มอบหมาย/);
  } finally {
    await ctx.close();
  }
});

test("รวมใบงาน confirms, keeps every reporter, and links the merged row (AC-SOPS-011, RULE-007)", async () => {
  const { ctx, page } = await openApp();
  try {
    await row(page, "SOPS-2422").getByRole("button", { name: "รวมใบงาน" }).click();
    const dialog = page.getByRole("dialog", { name: /รวมใบงาน SOPS-2422/ });
    assert.match(await dialog.innerText(), /ย้อนกลับไม่ได้/);
    assert.equal(await dialog.getByLabel("รวมเข้ากับใบงาน").inputValue(), "SOPS-2420", "same-floor order suggested");

    // Cancel leaves everything as it was.
    await dialog.getByRole("button", { name: "ยกเลิก" }).click();
    assert.match(await row(page, "SOPS-2422").innerText(), /ใหม่/);

    await row(page, "SOPS-2422").getByRole("button", { name: "รวมใบงาน" }).click();
    await page.getByRole("button", { name: "ยืนยันรวมใบงาน" }).click();

    const survivor = await row(page, "SOPS-2420").innerText();
    assert.match(survivor, /LINE · คุณมาลี/);
    assert.match(survivor, /กระดาษ · คุณอรุณ/);

    const merged = row(page, "SOPS-2422");
    assert.match(await merged.innerText(), /รวมใบงานแล้ว/);
    const link = merged.getByRole("link", { name: "รวมเข้า SOPS-2420" });
    await link.click();
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("data-id")), "SOPS-2420");
    assert.deepEqual(await kpis(page), { open: 6, p1: 3, over: 1 });
  } finally {
    await ctx.close();
  }
});

test("draft survives a reload and can be resumed or discarded (RULE-008)", async () => {
  const { ctx, page } = await openApp();
  try {
    await page.getByLabel("ผู้แจ้ง").fill("คุณเดือน (รปภ.)");
    await page.getByLabel("รายละเอียดอาการ").fill("กลิ่นไหม้ใกล้ห้องไฟ");
    await page.reload({ waitUntil: "load" });
    await page.getByText(/มีแบบร่างค้าง/).waitFor();
    assert.equal(await page.getByLabel("ผู้แจ้ง").inputValue(), "");
    await page.getByRole("button", { name: "ใช้แบบร่างต่อ" }).click();
    assert.equal(await page.getByLabel("ผู้แจ้ง").inputValue(), "คุณเดือน (รปภ.)");
    assert.equal(await page.getByLabel("รายละเอียดอาการ").inputValue(), "กลิ่นไหม้ใกล้ห้องไฟ");

    await page.reload({ waitUntil: "load" });
    await page.getByRole("button", { name: "ทิ้งแบบร่าง" }).click();
    await page.reload({ waitUntil: "load" });
    await page.locator("#queue-section[aria-busy=false]").waitFor();
    assert.equal(await page.getByText(/มีแบบร่างค้าง/).count(), 0);
  } finally {
    await ctx.close();
  }
});

test("dashboard targets are at least 44 × 44 px (A11Y-007)", async () => {
  const { ctx, page } = await openApp();
  try {
    const small = await page
      .locator("main button, main select, main input:not([type=radio]), main textarea, main a[href], main label:has(> input[type=radio])")
      .evaluateAll((els, min) =>
        els
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 0 && (r.height < min || r.width < min))
          .map(({ el, r }) => `${el.tagName}:${(el.textContent || (el as HTMLInputElement).name || "").trim().slice(0, 20)} ${r.width}×${r.height}`),
        DASHBOARD_MIN_TARGET_PX,
      );
    assert.deepEqual(small, []);
  } finally {
    await ctx.close();
  }
});
