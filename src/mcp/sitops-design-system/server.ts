/**
 * SiteOps design-system MCP server.
 *
 *   npm run mcp:sitops                                      # stdio, for local agents
 *   npm run mcp:sitops -- --http --port 3333                # Streamable HTTP on 127.0.0.1
 *   npm run mcp:sitops -- --http --port 3333 --host 0.0.0.0 # ... reachable from other machines
 *
 * HTTP mode requires SITOPS_MCP_BEARER_TOKEN in the environment (ADR-001,
 * MEM-009). The token is compared in constant time and never logged.
 * Clients send:  Authorization: Bearer ${SITOPS_MCP_BEARER_TOKEN}
 * GET /health and GET /info are anonymous and carry no spec content
 * (ADR-001 amendment 1, MEM-011).
 *
 * This is the only file that touches process.env or a transport.
 */
import { createServer as createHttpServer, type IncomingMessage, type RequestListener, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { createHash, timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { loadCatalog, type Catalog, type CatalogPaths, DEFAULT_PATHS } from "./catalog.js";
import {
  READ_ONLY_ANNOTATIONS,
  checkContrast,
  descriptions,
  getComponentSpec,
  getDesignSystemInfo,
  getDesignTokens,
  isFailure,
  listComponents,
  schemas,
  searchComponents,
} from "./tools.js";

export const SERVER_INFO = { name: "sitops-design-system", version: "0.1.0" } as const;

type CallResult = { content: { type: "text"; text: string }[]; structuredContent?: Record<string, unknown>; isError?: boolean };

function ok(data: Record<string, unknown>): CallResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data };
}
function fail(data: { error: string; hint?: string }): CallResult {
  return { content: [{ type: "text", text: JSON.stringify(data) }], isError: true };
}

/** Builds a server. `load` is injectable so tests can point at fixture files. */
export function createSitopsServer(paths: CatalogPaths = DEFAULT_PATHS, load: (p: CatalogPaths) => Promise<Catalog> = loadCatalog): McpServer {
  const server = new McpServer(SERVER_INFO);
  const catalog = () => load(paths);

  server.registerTool(
    "get_design_system_info",
    { description: descriptions.get_design_system_info, inputSchema: schemas.get_design_system_info, annotations: READ_ONLY_ANNOTATIONS },
    async () => ok({ ...getDesignSystemInfo(await catalog()) }),
  );

  server.registerTool(
    "get_design_tokens",
    { description: descriptions.get_design_tokens, inputSchema: schemas.get_design_tokens, annotations: READ_ONLY_ANNOTATIONS },
    async (args) => ok({ ...getDesignTokens(await catalog(), args) }),
  );

  server.registerTool(
    "list_components",
    { description: descriptions.list_components, inputSchema: schemas.list_components, annotations: READ_ONLY_ANNOTATIONS },
    async (args) => ok({ ...listComponents(await catalog(), args) }),
  );

  server.registerTool(
    "get_component_spec",
    { description: descriptions.get_component_spec, inputSchema: schemas.get_component_spec, annotations: READ_ONLY_ANNOTATIONS },
    async (args) => {
      const result = getComponentSpec(await catalog(), args);
      return isFailure(result) ? fail(result) : ok({ ...result });
    },
  );

  server.registerTool(
    "search_components",
    { description: descriptions.search_components, inputSchema: schemas.search_components, annotations: READ_ONLY_ANNOTATIONS },
    async (args) => ok({ ...searchComponents(await catalog(), args) }),
  );

  server.registerTool(
    "check_contrast",
    { description: descriptions.check_contrast, inputSchema: schemas.check_contrast, annotations: READ_ONLY_ANNOTATIONS },
    async (args) => {
      const result = checkContrast(await catalog(), args);
      return isFailure(result) ? fail(result) : ok({ ...result });
    },
  );

  return server;
}

// ---------------------------------------------------------------------------
// Bearer auth for HTTP mode
// ---------------------------------------------------------------------------

export function bearerMatches(header: string | undefined, expected: string): boolean {
  if (!header?.startsWith("Bearer ")) return false;
  // Hash both sides so the compare is fixed-length: a wrong-length token takes
  // as long to reject as a wrong-content one, and the length does not leak.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header.slice(7).trim()), digest(expected));
}

export function readBearerFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  const token = env.SITOPS_MCP_BEARER_TOKEN?.trim();
  if (!token) {
    throw new Error("HTTP mode needs SITOPS_MCP_BEARER_TOKEN in the environment (see ADR-001). Refusing to start unauthenticated.");
  }
  if (token.length < 32) throw new Error("SITOPS_MCP_BEARER_TOKEN must be at least 32 characters.");
  return token;
}

// ---------------------------------------------------------------------------
// HTTP mode
// ---------------------------------------------------------------------------

export interface HttpOptions {
  token: string;
  /** Reported by GET /info so an agent can tell which snapshot it is talking to. */
  commit: string;
  paths?: CatalogPaths;
  load?: (p: CatalogPaths) => Promise<Catalog>;
}

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>): void {
  res.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify(body));
}

/**
 * Request handler for HTTP mode. /health and /info are anonymous and return no
 * spec content; /mcp needs the bearer; everything else is 404.
 */
export function createHttpHandler(options: HttpOptions): RequestListener {
  const handle = routeRequest(options);
  // Node does not await a listener: a rejection here would be unhandled and
  // stop the process, so one bad request must never escape (MCP_TASKS T6.7).
  return (req, res) => {
    handle(req, res).catch(() => {
      if (!res.headersSent) res.writeHead(500).end();
      else res.destroy();
    });
  };
}

/** Pathname of the request target, or null when it is not a parseable URL. */
function requestPath(url: string | undefined): string | null {
  try {
    return new URL(url ?? "/", "http://localhost").pathname;
  } catch {
    return null;
  }
}

function routeRequest({ token, commit, paths = DEFAULT_PATHS, load = loadCatalog }: HttpOptions) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const route = requestPath(req.url);
    if (route === null) {
      res.writeHead(400).end();
      return;
    }

    if (route === "/health" || route === "/info") {
      if (req.method !== "GET") {
        res.writeHead(405, { Allow: "GET" }).end();
        return;
      }
      let catalog: Catalog;
      try {
        catalog = await load(paths);
      } catch {
        // The parser error names files and headings; keep it off the anonymous route.
        sendJson(res, 503, { status: "catalog-error" });
        return;
      }
      if (route === "/health") {
        sendJson(res, 200, { status: "ok" });
        return;
      }
      sendJson(res, 200, {
        server: SERVER_INFO,
        designSystemVersion: catalog.info.version,
        componentCount: catalog.components.length,
        commit,
      });
      return;
    }

    if (route !== "/mcp") {
      res.writeHead(404).end();
      return;
    }
    if (!bearerMatches(req.headers.authorization, token)) {
      res.writeHead(401, { "WWW-Authenticate": "Bearer" }).end();
      return;
    }
    // Stateless: one server + transport per request, no session ids to leak.
    const server = createSitopsServer(paths, load);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res);
  };
}

export interface CliOptions {
  http: boolean;
  port: number;
  host: string;
}

/** Loopback unless --host says otherwise (ADR-001 amendment 1). */
export function parseCliArgs(argv: string[]): CliOptions {
  const value = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    if (idx < 0) return undefined;
    const v = argv[idx + 1];
    if (v === undefined || v.startsWith("--")) throw new Error(`${flag} needs a value`);
    return v;
  };
  const rawPort = value("--port");
  const port = rawPort === undefined ? 3333 : Number(rawPort);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`--port must be an integer 0-65535, got "${rawPort}"`);
  return { http: argv.includes("--http"), port, host: value("--host") ?? "127.0.0.1" };
}

async function startHttp(port: number, host: string): Promise<void> {
  const http = createHttpServer(
    createHttpHandler({ token: readBearerFromEnv(), commit: process.env.SITOPS_COMMIT_SHA?.trim() || "unknown" }),
  );
  await new Promise<void>((resolve, reject) => {
    http.once("error", reject);
    http.listen(port, host, resolve);
  });
  const { address, port: bound } = http.address() as AddressInfo;
  const shown = address.includes(":") ? `[${address}]` : address;
  console.error(`[sitops-mcp] Streamable HTTP on http://${shown}:${bound}/mcp (bearer required; /health and /info anonymous)`);
}

async function startStdio(): Promise<void> {
  const server = createSitopsServer();
  await server.connect(new StdioServerTransport());
  console.error("[sitops-mcp] stdio ready");
}

async function main(argv: string[]): Promise<void> {
  const { http, port, host } = parseCliArgs(argv);
  if (http) await startHttp(port, host);
  else await startStdio();
}

const isEntry = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntry) {
  main(process.argv.slice(2)).catch((err: Error) => {
    console.error(`[sitops-mcp] ${err.message}`);
    process.exit(1);
  });
}
