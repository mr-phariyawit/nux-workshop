/**
 * Catalog — pure reader over the SiteOps contracts.
 *
 * Reads DESIGN.md (Session 2) and components/*.md (Session 3) and turns them
 * into typed data. No transport, no process.env, no caching: the MCP server
 * re-reads on every call so the Markdown stays the single source of truth
 * (CONVENTIONS.md §3.2).
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
export const DEFAULT_PATHS = {
  designMd: path.join(REPO_ROOT, "docs/homework/session-2/DESIGN.md"),
  componentsDir: path.join(REPO_ROOT, "docs/homework/session-3/components"),
} as const;

export type Theme = "light" | "dark";

export interface Token {
  name: string;
  value: string;
}

export interface DesignSystemInfo {
  name: string;
  version: string;
  status: string;
  platforms: string[];
  implementation: string[];
  owner: string;
  lastReviewed: string;
}

export interface ComponentFrontMatter {
  id: string;
  name: string;
  status: "draft" | "ready" | "deprecated";
  source: string;
  generated_at: string;
  generator: string;
  design_md_version: string;
}

/** Section heading contract from CONVENTIONS.md §4, in order. */
export const SPEC_SECTIONS = [
  "Overview",
  "Known gaps",
  "Follow-ups",
  "API",
  "Structure",
  "Color",
  "Voice / Screen reader",
  "Cross-references",
  "Provenance",
  "render-meta",
] as const;
export type SpecSection = (typeof SPEC_SECTIONS)[number];

export interface RenderMeta {
  id: string;
  primitive: string;
  axes: Record<string, string[]>;
  states: string[];
  tokens: string[];
  contracts: string[];
  [key: string]: unknown;
}

export interface ComponentSpec {
  file: string;
  frontMatter: ComponentFrontMatter;
  sections: Record<SpecSection, string>;
  renderMeta: RenderMeta;
}

export interface Catalog {
  info: DesignSystemInfo;
  tokens: Record<Theme, Token[]>;
  components: ComponentSpec[];
}

export class CatalogError extends Error {
  constructor(
    public readonly file: string,
    detail: string,
  ) {
    super(`${path.basename(file)}: ${detail}`);
    this.name = "CatalogError";
  }
}

// ---------------------------------------------------------------------------
// Front matter
// ---------------------------------------------------------------------------

export function parseFrontMatter(markdown: string, file: string): Record<string, string> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(markdown);
  if (!match) throw new CatalogError(file, "missing YAML front matter");
  const out: Record<string, string> = {};
  for (const raw of match[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx < 0) throw new CatalogError(file, `front matter line is not key: value → "${line}"`);
    out[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return out;
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  const inner = value.replace(/^\[/, "").replace(/\]$/, "");
  return inner
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// DESIGN.md
// ---------------------------------------------------------------------------

export function parseDesignInfo(markdown: string, file: string): DesignSystemInfo {
  const fm = parseFrontMatter(markdown, file);
  for (const key of ["name", "version", "status"]) {
    if (!fm[key]) throw new CatalogError(file, `front matter missing "${key}"`);
  }
  return {
    name: fm.name,
    version: fm.version,
    status: fm.status,
    platforms: parseList(fm.platforms),
    implementation: parseList(fm.implementation),
    owner: fm.owner ?? "",
    lastReviewed: fm.last_reviewed ?? "",
  };
}

/**
 * Reads the first ```css block. Light tokens come from `:root { … }`; dark
 * tokens are light tokens overridden by `[data-theme="dark"] { … }`, so a
 * token that only exists in light still resolves in dark.
 */
export function parseDesignTokens(markdown: string, file: string): Record<Theme, Token[]> {
  const css = /```css\r?\n([\s\S]*?)```/.exec(markdown)?.[1];
  if (!css) throw new CatalogError(file, "no ```css block with custom properties");

  const block = (selector: RegExp): Map<string, string> => {
    const m = selector.exec(css);
    const map = new Map<string, string>();
    if (!m) return map;
    for (const decl of m[1].split(/\r?\n/)) {
      const d = /^\s*(--[\w-]+)\s*:\s*(.+?)\s*;\s*$/.exec(decl);
      if (d) map.set(d[1], d[2]);
    }
    return map;
  };

  const light = block(/:root\s*\{([\s\S]*?)\}/);
  if (light.size === 0) throw new CatalogError(file, "`:root` block has no custom properties");
  const darkOverrides = block(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
  const dark = new Map(light);
  for (const [k, v] of darkOverrides) dark.set(k, v);

  const toList = (m: Map<string, string>): Token[] => [...m].map(([name, value]) => ({ name, value }));
  return { light: toList(light), dark: toList(dark) };
}

// ---------------------------------------------------------------------------
// components/*.md
// ---------------------------------------------------------------------------

const STATUSES = new Set(["draft", "ready", "deprecated"]);

export function parseComponentSpec(markdown: string, file: string): ComponentSpec {
  const fm = parseFrontMatter(markdown, file);
  for (const key of ["id", "name", "status", "source", "generated_at", "generator", "design_md_version"]) {
    if (!fm[key]) throw new CatalogError(file, `front matter missing "${key}"`);
  }
  if (!STATUSES.has(fm.status)) throw new CatalogError(file, `status "${fm.status}" is not draft|ready|deprecated`);
  if (!/^CMP-[a-z0-9-]+$/.test(fm.id)) throw new CatalogError(file, `id "${fm.id}" must match CMP-<kebab>`);

  const body = markdown.slice(markdown.indexOf("\n---\n") + 5);
  const sections = {} as Record<SpecSection, string>;
  const parts = body.split(/^## /m).slice(1); // drop the H1 preamble
  const found = new Map<string, string>();
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const heading = part.slice(0, nl).trim();
    found.set(heading, part.slice(nl + 1).trim());
  }
  for (const heading of SPEC_SECTIONS) {
    const text = found.get(heading);
    if (text === undefined) throw new CatalogError(file, `missing section "## ${heading}"`);
    sections[heading] = text;
  }

  const json = /```json\r?\n([\s\S]*?)```/.exec(sections["render-meta"])?.[1];
  if (!json) throw new CatalogError(file, "render-meta section has no ```json block");
  let renderMeta: RenderMeta;
  try {
    renderMeta = JSON.parse(json) as RenderMeta;
  } catch (e) {
    throw new CatalogError(file, `render-meta JSON is invalid: ${(e as Error).message}`);
  }
  if (renderMeta.id !== fm.id) throw new CatalogError(file, `render-meta id "${renderMeta.id}" ≠ front matter id "${fm.id}"`);
  for (const key of ["primitive", "axes", "states", "tokens", "contracts"]) {
    if (!(key in renderMeta)) throw new CatalogError(file, `render-meta missing "${key}"`);
  }

  return {
    file,
    frontMatter: fm as unknown as ComponentFrontMatter,
    sections,
    renderMeta,
  };
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export interface CatalogPaths {
  designMd: string;
  componentsDir: string;
}

/** Spec files are lower-case kebab; `*_GUIDE.md` is hand-written and skipped. */
export function isSpecFile(name: string): boolean {
  return name.endsWith(".md") && !name.endsWith("_GUIDE.md") && name === name.toLowerCase();
}

export async function loadCatalog(paths: CatalogPaths = DEFAULT_PATHS): Promise<Catalog> {
  const design = await readFile(paths.designMd, "utf8");
  const info = parseDesignInfo(design, paths.designMd);
  const tokens = parseDesignTokens(design, paths.designMd);

  const names = (await readdir(paths.componentsDir)).filter(isSpecFile).sort();
  const components = await Promise.all(
    names.map(async (name) => {
      const file = path.join(paths.componentsDir, name);
      return parseComponentSpec(await readFile(file, "utf8"), file);
    }),
  );
  return { info, tokens, components };
}
