/**
 * SiteOps design-system MCP server.
 *
 *   npm run mcp:sitops                       # stdio, for local agents
 *   npm run mcp:sitops -- --http --port 3333 # Streamable HTTP, remote agents
 *
 * HTTP mode requires SITOPS_MCP_BEARER_TOKEN in the environment (ADR-001,
 * MEM-009). The token is compared in constant time and never logged.
 * Clients send:  Authorization: Bearer ${SITOPS_MCP_BEARER_TOKEN}
 *
 * This is the only file that touches process.env or a transport.
 */
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
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
  const presented = Buffer.from(header.slice(7).trim());
  const wanted = Buffer.from(expected);
  if (presented.length !== wanted.length) return false;
  return timingSafeEqual(presented, wanted);
}

export function readBearerFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  const token = env.SITOPS_MCP_BEARER_TOKEN?.trim();
  if (!token) {
    throw new Error("HTTP mode needs SITOPS_MCP_BEARER_TOKEN in the environment (see ADR-001). Refusing to start unauthenticated.");
  }
  if (token.length < 32) throw new Error("SITOPS_MCP_BEARER_TOKEN must be at least 32 characters.");
  return token;
}

async function startHttp(port: number): Promise<void> {
  const token = readBearerFromEnv();
  const http = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url !== "/mcp") {
      res.writeHead(404).end();
      return;
    }
    if (!bearerMatches(req.headers.authorization, token)) {
      res.writeHead(401, { "WWW-Authenticate": "Bearer" }).end();
      return;
    }
    // Stateless: one server + transport per request, no session ids to leak.
    const server = createSitopsServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });
  await new Promise<void>((resolve) => http.listen(port, resolve));
  console.error(`[sitops-mcp] Streamable HTTP on http://127.0.0.1:${port}/mcp (bearer required)`);
}

async function startStdio(): Promise<void> {
  const server = createSitopsServer();
  await server.connect(new StdioServerTransport());
  console.error("[sitops-mcp] stdio ready");
}

async function main(argv: string[]): Promise<void> {
  const http = argv.includes("--http");
  const portIdx = argv.indexOf("--port");
  const port = portIdx >= 0 ? Number(argv[portIdx + 1]) : 3333;
  if (http) await startHttp(port);
  else await startStdio();
}

const isEntry = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isEntry) {
  main(process.argv.slice(2)).catch((err: Error) => {
    console.error(`[sitops-mcp] ${err.message}`);
    process.exit(1);
  });
}
