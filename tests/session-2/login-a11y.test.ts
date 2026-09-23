/**
 * Session 2 workshop gate — A11Y.md §5.
 *
 * Proves two things:
 *  1. The "before" login page fails the axe gate (so the gate actually detects the
 *     defects listed in docs/homework/session-2/a11y-workshop.md).
 *  2. The "after" login page passes axe AND the stricter A11Y-007 target-size rule.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const ROOT = path.resolve(import.meta.dirname, "../..");
const BEFORE = pathToFileURL(path.join(ROOT, "src/session-2/login-a11y/login.before.html")).href;
const AFTER = pathToFileURL(path.join(ROOT, "src/session-2/login-a11y/login.after.html")).href;

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const FIELD_MIN_TARGET_PX = 56; // A11Y-007, field surface
const DASHBOARD_MIN_TARGET_PX = 44; // A11Y-007, non-primary links

let browser: Browser;
let context: BrowserContext;

before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined,
    args: ["--no-sandbox"],
  });
  // axe's finishRun opens a helper page in the same context, so the page must
  // come from an explicit context, not browser.newPage().
  context = await browser.newContext({ viewport: { width: 360, height: 800 } });
});

after(async () => {
  await context?.close();
  await browser?.close();
});

async function open(url: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  return page;
}

async function axeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  return results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
}

test("before: the unfixed login page fails the axe gate", async () => {
  const page = await open(BEFORE);
  try {
    const violations = await axeViolations(page);
    const ids = violations.map((v) => v.id);
    // The defects planted in login.before.html that axe can detect.
    for (const expected of ["html-has-lang", "document-title", "image-alt", "color-contrast"]) {
      assert.ok(ids.includes(expected), `expected axe to flag ${expected}; got ${ids.join(", ")}`);
    }
    // Placeholder-only inputs pass axe's `label` rule, so A11Y-012 needs its own check.
    assert.ok(!ids.includes("label"), "axe accepts placeholder as a name; if this changes, drop the structural check");
    assert.equal(await page.locator("label").count(), 0, "before page must have no visible labels");
  } finally {
    await page.close();
  }
});

test("after: the fixed login page has zero axe violations", async () => {
  const page = await open(AFTER);
  try {
    const violations = await axeViolations(page);
    assert.deepEqual(violations, [], `axe violations: ${JSON.stringify(violations, null, 2)}`);
  } finally {
    await page.close();
  }
});

test("after: controls are reachable by accessible name (A11Y-004, A11Y-012, A11Y-016)", async () => {
  const page = await open(AFTER);
  try {
    await page.getByLabel("ชื่อผู้ใช้", { exact: false }).fill("somchai");
    await page.getByLabel("รหัสผ่าน", { exact: false }).fill("x");
    assert.equal(await page.getByRole("button", { name: "เข้าสู่ระบบ" }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "วิธีใช้" }).count(), 1);
    assert.equal(await page.getByRole("link", { name: "ลืมรหัสผ่าน" }).count(), 1);
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    assert.equal(await page.locator("main").count(), 1);
    assert.equal(await page.locator("html").getAttribute("lang"), "th");
  } finally {
    await page.close();
  }
});

test("after: error is announced and tied to its field (A11Y-013)", async () => {
  const page = await open(AFTER);
  try {
    const password = page.getByLabel("รหัสผ่าน", { exact: false });
    assert.equal(await password.getAttribute("aria-invalid"), "true");
    const describedBy = await password.getAttribute("aria-describedby");
    assert.ok(describedBy, "password must reference its error message");
    const message = page.locator(`#${describedBy}`);
    assert.equal(await message.getAttribute("role"), "alert");
    assert.match(await message.innerText(), /รหัสผ่านไม่ถูกต้อง/);
  } finally {
    await page.close();
  }
});

test("after: target sizes meet A11Y-007 (56 px field controls, 44 px links)", async () => {
  const page = await open(AFTER);
  try {
    for (const name of ["เข้าสู่ระบบ", "วิธีใช้"]) {
      const box = await page.getByRole("button", { name }).boundingBox();
      assert.ok(box, `${name} has no box`);
      assert.ok(box.height >= FIELD_MIN_TARGET_PX && box.width >= FIELD_MIN_TARGET_PX, `${name} is ${box.width}×${box.height}`);
    }
    for (const label of ["ชื่อผู้ใช้", "รหัสผ่าน"]) {
      const box = await page.getByLabel(label, { exact: false }).boundingBox();
      assert.ok(box && box.height >= FIELD_MIN_TARGET_PX, `${label} input height ${box?.height}`);
    }
    const link = await page.getByRole("link", { name: "ลืมรหัสผ่าน" }).boundingBox();
    assert.ok(link && link.height >= DASHBOARD_MIN_TARGET_PX, `link height ${link?.height}`);
  } finally {
    await page.close();
  }
});

test("after: focus is visible and keyboard order follows the form (A11Y-008, A11Y-009)", async () => {
  const page = await open(AFTER);
  try {
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement?.id), "username");
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement?.id), "password");
    await page.keyboard.press("Tab");
    const focusedName = await page.evaluate(() => document.activeElement?.textContent?.trim());
    assert.equal(focusedName, "เข้าสู่ระบบ");
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
    assert.notEqual(outline, "none", "focused control must show an outline");
  } finally {
    await page.close();
  }
});
