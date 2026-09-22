/**
 * Session 3 — tool handlers (MCP_TASKS T4.2). Pure functions over the real catalog.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PATHS, loadCatalog, type Catalog } from "../../src/mcp/sitops-design-system/catalog.js";
import { contrastRatio, judgeContrast, parseHex } from "../../src/mcp/sitops-design-system/contrast.js";
import {
  READ_ONLY_ANNOTATIONS,
  TOOL_NAMES,
  checkContrast,
  descriptions,
  getComponentSpec,
  getDesignSystemInfo,
  getDesignTokens,
  isFailure,
  listComponents,
  schemas,
  searchComponents,
} from "../../src/mcp/sitops-design-system/tools.js";

let catalog: Catalog;
before(async () => {
  catalog = await loadCatalog(DEFAULT_PATHS);
});

test("every tool has a schema, a description that says when to call it, and read-only annotations", () => {
  assert.deepEqual(TOOL_NAMES.sort(), ["check_contrast", "get_component_spec", "get_design_system_info", "get_design_tokens", "list_components", "search_components"]);
  for (const name of TOOL_NAMES) {
    assert.ok(name in schemas);
    assert.ok(descriptions[name].length > 40, `${name} description too short to guide an agent`);
  }
  assert.equal(READ_ONLY_ANNOTATIONS.readOnlyHint, true);
  assert.equal(READ_ONLY_ANNOTATIONS.destructiveHint, false);
});

test("get_design_system_info reports counts and precedence", () => {
  const info = getDesignSystemInfo(catalog);
  assert.equal(info.componentCount, 3);
  assert.ok(info.tokenCount >= 15);
  assert.ok(info.precedence.some((p) => p.startsWith("A11Y.md")));
  assert.equal(info.precedence[0], "AGENTS.md");
});

test("get_design_tokens filters by theme and prefix", () => {
  const status = getDesignTokens(catalog, { theme: "light", prefix: "--color-status" });
  assert.deepEqual(status.tokens.map((t) => t.name).sort(), ["--color-status-done", "--color-status-p1", "--color-status-p2", "--color-status-p3", "--color-status-pending-sync"]);
  const darkP1 = getDesignTokens(catalog, { theme: "dark", prefix: "--color-status-p1" }).tokens[0];
  assert.equal(darkP1.value, "#F08A8A");
  assert.equal(getDesignTokens(catalog, { theme: "light", prefix: "--nope" }).tokens.length, 0);
});

test("list_components summarises and filters by status", () => {
  const all = listComponents(catalog).components;
  assert.equal(all.length, 3);
  const button = all.find((c) => c.id === "CMP-button")!;
  assert.equal(button.primitive, "shadcn/button");
  assert.deepEqual(button.axes.size, ["lg", "md", "sm"]);
  assert.ok(button.knownGapCount >= 1, "hand-authored specs must declare their GAPs");
  const drafts = listComponents(catalog, { status: "draft" }).components.map((c) => c.id);
  assert.deepEqual(drafts, ["CMP-work-order-card"]);
});

test("get_component_spec returns sections, accepts name, fails softly on unknown id", () => {
  const full = getComponentSpec(catalog, { id: "CMP-status-badge" });
  assert.ok(!isFailure(full));
  assert.equal(Object.keys(full.sections).length, 10);
  assert.match(full.sections.Provenance!, /RULE-006/);

  const partial = getComponentSpec(catalog, { id: "Button", sections: ["API", "Known gaps"] });
  assert.ok(!isFailure(partial));
  assert.deepEqual(Object.keys(partial.sections).sort(), ["API", "Known gaps"]);
  assert.match(partial.sections.API!, /iconOnly/);

  const missing = getComponentSpec(catalog, { id: "CMP-toast" });
  assert.ok(isFailure(missing));
  assert.match(missing.hint!, /CMP-button/);
});

test("search_components ranks by section weight and finds Thai labels and contract ids", () => {
  const byRule = searchComponents(catalog, { query: "RULE-006", limit: 5 });
  assert.equal(byRule.hits[0].id, "CMP-status-badge");
  assert.ok(byRule.hits[0].matchedIn.includes("Cross-references"));

  const thai = searchComponents(catalog, { query: "รับงาน", limit: 5 });
  assert.equal(thai.hits[0].id, "CMP-work-order-card");

  const prop = searchComponents(catalog, { query: "iconOnly", limit: 1 });
  assert.equal(prop.hits.length, 1);
  assert.equal(prop.hits[0].id, "CMP-button");

  assert.deepEqual(searchComponents(catalog, { query: "zzz-nothing", limit: 5 }).hits, []);
});

test("contrast maths matches WCAG reference values", () => {
  assert.deepEqual(parseHex("#fff"), [255, 255, 255]);
  assert.equal(Math.round(contrastRatio("#000000", "#FFFFFF") * 100) / 100, 21);
  assert.equal(contrastRatio("#777777", "#FFFFFF").toFixed(2), "4.48"); // the classic just-fails grey
  assert.throws(() => parseHex("teal"), /not a hex colour/);
});

test("check_contrast: MEM-002 — teal.500 fails text AA, teal.600 passes", () => {
  const old = checkContrast(catalog, { foreground: "#FFFFFF", background: "#0F8B8D", theme: "light" });
  assert.ok(!isFailure(old));
  assert.ok(old.ratio > 4 && old.ratio < 4.5, `teal.500 ratio ${old.ratio}`);
  assert.equal(old.textAA, false);
  assert.equal(old.nonText, true);

  const current = checkContrast(catalog, { foreground: "--color-on-primary", background: "--color-primary", theme: "light" });
  assert.ok(!isFailure(current));
  assert.equal(current.background.hex, "#0B6F71");
  assert.ok(current.ratio >= 4.5, `light primary button ${current.ratio}`);
  assert.equal(current.textAA, true);

  const dark = checkContrast(catalog, { foreground: "--color-on-primary", background: "--color-primary", theme: "dark" });
  assert.ok(!isFailure(dark) && dark.textAA, "dark primary button must pass too");
});

test("check_contrast: every status colour is ≥ 3:1 non-text on its surface, both themes (A11Y-002)", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const name of ["--color-status-p1", "--color-status-p2", "--color-status-p3", "--color-status-done", "--color-primary", "--color-focus-ring"]) {
      const r = checkContrast(catalog, { foreground: name, background: "--color-bg-surface", theme });
      assert.ok(!isFailure(r) && r.nonText, `${theme} ${name} on surface: ${isFailure(r) ? r.error : r.ratio}`);
    }
  }
});

test("check_contrast: badge text passes AA on every status fill, both themes (A11Y-001, MEM-010)", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const status of ["p1", "p2", "p3", "done"]) {
      const r = checkContrast(catalog, { foreground: `--color-on-status-${status}`, background: `--color-status-${status}`, theme });
      assert.ok(!isFailure(r) && r.textAA, `${theme} on-status-${status}: ${isFailure(r) ? r.error : r.ratio}`);
    }
  }
});

test("check_contrast fails softly on unknown token or non-colour", () => {
  const unknown = checkContrast(catalog, { foreground: "--color-nope", background: "#fff", theme: "light" });
  assert.ok(isFailure(unknown) && /unknown token/.test(unknown.error));
  const notColour = checkContrast(catalog, { foreground: "--radius-md", background: "#fff", theme: "light" });
  assert.ok(isFailure(notColour) && /not a colour/.test(notColour.error));
  const garbage = checkContrast(catalog, { foreground: "teal", background: "#fff", theme: "light" });
  assert.ok(isFailure(garbage));
  assert.equal(judgeContrast("#fff", "#000").textAA, true);
});
