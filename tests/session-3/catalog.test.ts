/**
 * Session 3 — catalog parser facts (MCP_TASKS T4.1).
 * Runs against the real DESIGN.md and components/*.md so drift fails here first.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CatalogError,
  DEFAULT_PATHS,
  SPEC_SECTIONS,
  isSpecFile,
  loadCatalog,
  parseComponentSpec,
  parseDesignTokens,
  parseFrontMatter,
} from "../../src/mcp/sitops-design-system/catalog.js";

test("real DESIGN.md and every component spec parse", async () => {
  const catalog = await loadCatalog(DEFAULT_PATHS);
  assert.equal(catalog.info.name, "SiteOps Design System");
  assert.match(catalog.info.version, /^\d+\.\d+\.\d+$/);
  assert.deepEqual(catalog.info.platforms, ["web-dashboard", "mobile-pwa"]);
  assert.ok(catalog.components.length >= 3, "expected at least button, status-badge, work-order-card");
  const ids = catalog.components.map((c) => c.frontMatter.id).sort();
  assert.deepEqual(ids, ["CMP-button", "CMP-status-badge", "CMP-work-order-card"]);
});

test("tokens: light has the semantic set, dark overrides colours only", async () => {
  const { tokens } = await loadCatalog(DEFAULT_PATHS);
  const light = new Map(tokens.light.map((t) => [t.name, t.value]));
  const dark = new Map(tokens.dark.map((t) => [t.name, t.value]));
  assert.equal(light.get("--color-primary"), "#0B6F71", "MEM-002: light primary is teal.600");
  assert.equal(dark.get("--color-primary"), "#6FCBCB");
  // dark inherits non-colour tokens from light
  assert.equal(dark.get("--radius-md"), light.get("--radius-md"));
  assert.equal(dark.get("--font-sans"), light.get("--font-sans"));
  assert.equal(dark.size, light.size, "dark must resolve every light token");
});

test("every spec has all ten sections and render-meta matches front matter", async () => {
  const { components } = await loadCatalog(DEFAULT_PATHS);
  for (const spec of components) {
    for (const s of SPEC_SECTIONS) assert.ok(spec.sections[s].length > 0, `${spec.frontMatter.id} section "${s}" empty`);
    assert.equal(spec.renderMeta.id, spec.frontMatter.id);
    assert.ok(spec.renderMeta.tokens.every((t) => t.startsWith("--")), "render-meta tokens are semantic");
    assert.ok(spec.renderMeta.contracts.some((c) => /^A11Y-/.test(c)), `${spec.frontMatter.id} must cite an A11Y rule (CONVENTIONS §6)`);
    assert.ok(spec.renderMeta.contracts.some((c) => /^(RULE|AC-SOPS)-/.test(c)), `${spec.frontMatter.id} must cite a RULE or AC`);
  }
});

test("spec tokens all exist in DESIGN.md (CONVENTIONS §3.1)", async () => {
  const { tokens, components } = await loadCatalog(DEFAULT_PATHS);
  const known = new Set(tokens.light.map((t) => t.name));
  for (const spec of components) {
    for (const t of spec.renderMeta.tokens) assert.ok(known.has(t), `${spec.frontMatter.id} uses unknown token ${t}`);
  }
});

test("isSpecFile skips hand-written guides", () => {
  assert.equal(isSpecFile("button.md"), true);
  assert.equal(isSpecFile("BUTTON_GUIDE.md"), false);
  assert.equal(isSpecFile("README.md"), false);
  assert.equal(isSpecFile("button.tsx"), false);
});

test("parser fails loudly with the file name and the missing part", () => {
  assert.throws(() => parseFrontMatter("# no front matter", "/x/button.md"), (e: unknown) => e instanceof CatalogError && /button\.md: missing YAML front matter/.test((e as Error).message));
  assert.throws(() => parseDesignTokens("---\nname: x\n---\nno css", "/x/DESIGN.md"), /no ```css block/);
  const minimal = `---
id: CMP-x
name: X
status: ready
source: hand-authored
generated_at: 2026-09-22
generator: hand
design_md_version: 1.1.0
---

# X

## Overview
o
`;
  assert.throws(() => parseComponentSpec(minimal, "/x/x.md"), /missing section "## Known gaps"/);
  assert.throws(() => parseComponentSpec(minimal.replace("status: ready", "status: shipped"), "/x/x.md"), /not draft\|ready\|deprecated/);
  assert.throws(() => parseComponentSpec(minimal.replace("id: CMP-x", "id: Button"), "/x/x.md"), /must match CMP-<kebab>/);
});
