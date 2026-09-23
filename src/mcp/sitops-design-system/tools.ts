/**
 * Tool definitions and handlers for the SiteOps design-system MCP server.
 *
 * Pure: every handler takes a Catalog and typed args and returns a result
 * object. server.ts wires these onto a transport. tests/session-3 calls them
 * directly. Every tool is read-only by decision (ADR-001).
 */
import { z } from "zod";
import type { Catalog, ComponentSpec, SpecSection, Theme, Token } from "./catalog.js";
import { SPEC_SECTIONS } from "./catalog.js";
import { judgeContrast, type ContrastVerdict } from "./contrast.js";

export const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

// ---------------------------------------------------------------------------
// Schemas (zod raw shapes, as the MCP SDK expects)
// ---------------------------------------------------------------------------

export const themeSchema = z.enum(["light", "dark"]);

export const schemas = {
  get_design_system_info: {},
  get_design_tokens: {
    theme: themeSchema.default("light").describe("Which theme's values to return. Dark inherits light for tokens it does not override."),
    prefix: z.string().optional().describe('Filter by token name prefix, e.g. "--color-status".'),
  },
  list_components: {
    status: z.enum(["draft", "ready", "deprecated"]).optional().describe("Only components with this front-matter status."),
  },
  get_component_spec: {
    id: z.string().describe('Component id from list_components, e.g. "CMP-button".'),
    sections: z.array(z.enum(SPEC_SECTIONS)).optional().describe("Return only these sections. Omit for all."),
  },
  search_components: {
    query: z.string().min(1).describe("Free text: a prop, a token, a contract id (RULE-006), a Thai label."),
    limit: z.number().int().min(1).max(20).default(5),
  },
  check_contrast: {
    foreground: z.string().describe('Token name ("--color-on-primary") or hex ("#FFFFFF").'),
    background: z.string().describe('Token name ("--color-primary") or hex.'),
    theme: themeSchema.default("light"),
  },
} as const;

export type GetDesignTokensArgs = { theme: Theme; prefix?: string };
export type ListComponentsArgs = { status?: "draft" | "ready" | "deprecated" };
export type GetComponentSpecArgs = { id: string; sections?: SpecSection[] };
export type SearchComponentsArgs = { query: string; limit: number };
export type CheckContrastArgs = { foreground: string; background: string; theme: Theme };

// ---------------------------------------------------------------------------
// Descriptions: tell the agent *when* to call, not just what it returns.
// ---------------------------------------------------------------------------

export const descriptions = {
  get_design_system_info:
    "Call first. Returns the SiteOps design system name, version, status, platforms, component count and the contract precedence (UX.md beats PRD on flow; DESIGN.md binding on visuals; A11Y.md constrains both).",
  get_design_tokens:
    "Call before using any colour, radius, spacing or font in generated UI. Returns semantic CSS custom properties from DESIGN.md §9. Never invent a token; if one is missing, propose it under DESIGN.md 'Proposed additions'.",
  list_components:
    "Call before proposing a new component (check-before-write). Returns every component spec with id, status, source and variant axes.",
  get_component_spec:
    "Returns one component's full spec: front matter, the ten contract sections (Known gaps and Provenance included, read them) and the render-meta JSON that stories and code are generated from.",
  search_components:
    "Find components by prop, token, contract id, or Thai/English label. Use it to answer 'is there already a component for X' before writing one.",
  check_contrast:
    "Compute the WCAG contrast ratio of two colours (token names or hex) and whether they pass A11Y-001 text AA (4.5:1) and A11Y-002 non-text (3:1). Run it for every new foreground/background pair.",
} as const;

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export interface DesignSystemInfoResult {
  name: string;
  version: string;
  status: string;
  platforms: string[];
  implementation: string[];
  owner: string;
  lastReviewed: string;
  componentCount: number;
  tokenCount: number;
  precedence: string[];
  sourceFiles: { designMd: string; components: string[] };
}

export function getDesignSystemInfo(catalog: Catalog): DesignSystemInfoResult {
  return {
    ...catalog.info,
    componentCount: catalog.components.length,
    tokenCount: catalog.tokens.light.length,
    precedence: [
      "AGENTS.md",
      "MEMORY.md",
      "PRD (what exists, acceptance criteria)",
      "UX.md (behaviour; beats PRD on flow)",
      "DESIGN.md (visuals; binding)",
      "A11Y.md (constrains UX.md and DESIGN.md; cannot be overridden)",
      "components/<name>.md (generated spec)",
      "code",
    ],
    sourceFiles: { designMd: "docs/homework/session-2/DESIGN.md", components: catalog.components.map((c) => c.file) },
  };
}

export function getDesignTokens(catalog: Catalog, args: GetDesignTokensArgs): { theme: Theme; tokens: Token[] } {
  const all = catalog.tokens[args.theme];
  const tokens = args.prefix ? all.filter((t) => t.name.startsWith(args.prefix as string)) : all;
  return { theme: args.theme, tokens };
}

export interface ComponentSummary {
  id: string;
  name: string;
  status: string;
  source: string;
  primitive: string;
  axes: Record<string, string[]>;
  contracts: string[];
  knownGapCount: number;
}

export function summarise(spec: ComponentSpec): ComponentSummary {
  return {
    id: spec.frontMatter.id,
    name: spec.frontMatter.name,
    status: spec.frontMatter.status,
    source: spec.frontMatter.source,
    primitive: spec.renderMeta.primitive,
    axes: spec.renderMeta.axes,
    contracts: spec.renderMeta.contracts,
    knownGapCount: (spec.sections["Known gaps"].match(/\[GAP\]/g) ?? []).length,
  };
}

export function listComponents(catalog: Catalog, args: ListComponentsArgs = {}): { components: ComponentSummary[] } {
  const list = catalog.components.filter((c) => !args.status || c.frontMatter.status === args.status).map(summarise);
  return { components: list };
}

export type ToolFailure = { error: string; hint?: string };
export function isFailure(x: unknown): x is ToolFailure {
  return typeof x === "object" && x !== null && "error" in x;
}

export function getComponentSpec(
  catalog: Catalog,
  args: GetComponentSpecArgs,
): { frontMatter: ComponentSpec["frontMatter"]; sections: Partial<Record<SpecSection, string>>; renderMeta: ComponentSpec["renderMeta"] } | ToolFailure {
  const spec = catalog.components.find((c) => c.frontMatter.id === args.id || c.frontMatter.name === args.id);
  if (!spec) {
    return { error: `no component with id "${args.id}"`, hint: `known ids: ${catalog.components.map((c) => c.frontMatter.id).join(", ")}` };
  }
  const wanted = args.sections?.length ? args.sections : SPEC_SECTIONS;
  const sections: Partial<Record<SpecSection, string>> = {};
  for (const s of wanted) sections[s] = spec.sections[s];
  return { frontMatter: spec.frontMatter, sections, renderMeta: spec.renderMeta };
}

export interface SearchHit {
  id: string;
  name: string;
  score: number;
  matchedIn: SpecSection[];
}

const SECTION_WEIGHT: Record<SpecSection, number> = {
  Overview: 3,
  API: 3,
  "Cross-references": 3,
  Color: 2,
  Structure: 2,
  "Voice / Screen reader": 2,
  "Known gaps": 1,
  "Follow-ups": 1,
  Provenance: 1,
  "render-meta": 2,
};

export function searchComponents(catalog: Catalog, args: SearchComponentsArgs): { query: string; hits: SearchHit[] } {
  const q = args.query.trim().toLowerCase();
  const hits: SearchHit[] = [];
  for (const spec of catalog.components) {
    let score = 0;
    const matchedIn: SpecSection[] = [];
    const idName = `${spec.frontMatter.id} ${spec.frontMatter.name}`.toLowerCase();
    if (idName.includes(q)) score += 10;
    for (const section of SPEC_SECTIONS) {
      const text = spec.sections[section].toLowerCase();
      let count = 0;
      let idx = text.indexOf(q);
      while (idx !== -1) {
        count++;
        idx = text.indexOf(q, idx + q.length);
      }
      if (count > 0) {
        score += count * SECTION_WEIGHT[section];
        matchedIn.push(section);
      }
    }
    if (score > 0) hits.push({ id: spec.frontMatter.id, name: spec.frontMatter.name, score, matchedIn });
  }
  hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return { query: args.query, hits: hits.slice(0, args.limit) };
}

export interface CheckContrastResult extends ContrastVerdict {
  theme: Theme;
  foreground: { input: string; hex: string };
  background: { input: string; hex: string };
  rule: string;
}

function resolveColour(catalog: Catalog, theme: Theme, input: string): string | ToolFailure {
  if (input.startsWith("--")) {
    const token = catalog.tokens[theme].find((t) => t.name === input);
    if (!token) return { error: `unknown token "${input}" in ${theme} theme`, hint: "call get_design_tokens" };
    if (!/^#[0-9a-f]{3,6}$/i.test(token.value)) return { error: `token "${input}" is not a colour (${token.value})` };
    return token.value;
  }
  if (!/^#?[0-9a-f]{3}$|^#?[0-9a-f]{6}$/i.test(input)) return { error: `"${input}" is neither a --token nor a hex colour` };
  return input.startsWith("#") ? input : `#${input}`;
}

export function checkContrast(catalog: Catalog, args: CheckContrastArgs): CheckContrastResult | ToolFailure {
  const fg = resolveColour(catalog, args.theme, args.foreground);
  if (isFailure(fg)) return fg;
  const bg = resolveColour(catalog, args.theme, args.background);
  if (isFailure(bg)) return bg;
  const verdict = judgeContrast(fg, bg);
  return {
    ...verdict,
    theme: args.theme,
    foreground: { input: args.foreground, hex: fg.toUpperCase() },
    background: { input: args.background, hex: bg.toUpperCase() },
    rule: "A11Y-001 text ≥ 4.5:1 (large ≥ 3:1); A11Y-002 non-text ≥ 3:1",
  };
}

export const TOOL_NAMES = Object.keys(schemas) as (keyof typeof schemas)[];
