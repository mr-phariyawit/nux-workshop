/**
 * Session 3 — MCP round-trip over an in-memory transport (MCP_TASKS T4.3), the
 * bearer guard for HTTP mode (T3.3) and the HTTP hardening (T6).
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { copyFile, mkdtemp, rm } from "node:fs/promises";
import { createServer as createHttpServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { REPO_ROOT } from "../../src/mcp/sitops-design-system/catalog.js";
import {
  SERVER_INFO,
  bearerMatches,
  createHttpHandler,
  createSitopsServer,
  parseCliArgs,
  readBearerFromEnv,
} from "../../src/mcp/sitops-design-system/server.js";

let client: Client;
let server: ReturnType<typeof createSitopsServer>;

before(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  server = createSitopsServer();
  await server.connect(serverSide);
  client = new Client({ name: "test-client", version: "0.0.0" });
  await client.connect(clientSide);
});

after(async () => {
  await client.close();
  await server.close();
});

test("tools/list: six tools, every one read-only (ADR-001, MEM-008)", async () => {
  const { tools } = await client.listTools();
  assert.equal(tools.length, 6);
  for (const tool of tools) {
    assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name} must be readOnlyHint: true`);
    assert.equal(tool.annotations?.destructiveHint, false, `${tool.name} must not be destructive`);
    assert.ok(tool.description && tool.description.length > 40, `${tool.name} needs a guiding description`);
    assert.equal(tool.inputSchema.type, "object");
  }
  assert.equal(server.server.getClientVersion()?.name, "test-client");
  assert.equal(SERVER_INFO.name, "sitops-design-system");
});

test("tools/call round-trips structured content", async () => {
  const info = await client.callTool({ name: "get_design_system_info", arguments: {} });
  assert.notEqual(info.isError, true);
  const data = info.structuredContent as { componentCount: number; name: string };
  assert.equal(data.name, "SiteOps Design System");
  assert.equal(data.componentCount, 3);

  const tokens = await client.callTool({ name: "get_design_tokens", arguments: { theme: "dark", prefix: "--color-primary" } });
  const t = tokens.structuredContent as { tokens: { name: string; value: string }[] };
  assert.equal(t.tokens[0].value, "#6FCBCB");

  const contrast = await client.callTool({ name: "check_contrast", arguments: { foreground: "--color-on-primary", background: "--color-primary" } });
  const c = contrast.structuredContent as { textAA: boolean; ratio: number };
  assert.equal(c.textAA, true);
});

test("tools/call: unknown component is isError, not a protocol error", async () => {
  const res = await client.callTool({ name: "get_component_spec", arguments: { id: "CMP-toast" } });
  assert.equal(res.isError, true);
  const text = (res.content as { type: string; text: string }[])[0].text;
  assert.match(text, /no component with id/);
});

test("tools/call: schema validation rejects bad input", async () => {
  // The SDK surfaces zod failures either as a JSON-RPC error or as an isError
  // result depending on version; both are acceptable, silence is not.
  let rejected = false;
  try {
    const res = await client.callTool({ name: "get_design_tokens", arguments: { theme: "sepia" } });
    rejected = res.isError === true;
    if (rejected) assert.match((res.content as { text: string }[])[0].text, /invalid|Invalid/);
  } catch (e) {
    rejected = /invalid|Invalid/i.test((e as Error).message);
  }
  assert.equal(rejected, true, "bad theme must not be silently accepted");
});

test("bearer guard: constant-time compare, refuses missing or short token", () => {
  const token = "a".repeat(40);
  assert.equal(bearerMatches(`Bearer ${token}`, token), true);
  assert.equal(bearerMatches(`Bearer ${"b".repeat(40)}`, token), false);
  assert.equal(bearerMatches(`Bearer ${token}x`, token), false);
  assert.equal(bearerMatches(token, token), false, "scheme is required");
  assert.equal(bearerMatches(undefined, token), false);
  assert.equal(bearerMatches(`Bearer ${token.slice(0, 20)}`, token), false, "a shorter prefix of the token is rejected");
  assert.equal(bearerMatches("Bearer ", token), false);

  assert.throws(() => readBearerFromEnv({}), /SITOPS_MCP_BEARER_TOKEN/);
  assert.throws(() => readBearerFromEnv({ SITOPS_MCP_BEARER_TOKEN: "short" }), /at least 32/);
  assert.equal(readBearerFromEnv({ SITOPS_MCP_BEARER_TOKEN: ` ${token} ` }), token);
});

test("CLI: HTTP binds loopback unless --host is given; --port is validated (T6.1)", () => {
  assert.deepEqual(parseCliArgs([]), { http: false, port: 3333, host: "127.0.0.1" });
  assert.deepEqual(parseCliArgs(["--http", "--port", "4000"]), { http: true, port: 4000, host: "127.0.0.1" });
  assert.equal(parseCliArgs(["--http", "--host", "0.0.0.0"]).host, "0.0.0.0");
  assert.throws(() => parseCliArgs(["--port", "abc"]), /--port must be an integer/);
  assert.throws(() => parseCliArgs(["--port", "70000"]), /--port must be an integer/);
  assert.throws(() => parseCliArgs(["--port"]), /--port needs a value/);
  assert.throws(() => parseCliArgs(["--host", "--http"]), /--host needs a value/);
});

// ---------------------------------------------------------------------------
// HTTP mode over a real socket (T6.3)
// ---------------------------------------------------------------------------

const HTTP_TOKEN = "t".repeat(40);

async function listen(handler: ReturnType<typeof createHttpHandler>): Promise<{ http: Server; base: string }> {
  const http = createHttpServer(handler);
  await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve));
  return { http, base: `http://127.0.0.1:${(http.address() as AddressInfo).port}` };
}

test("HTTP: /health and /info are anonymous, carry no spec content; /mcp needs the bearer", async () => {
  const { http, base } = await listen(createHttpHandler({ token: HTTP_TOKEN, commit: "abc1234" }));
  try {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });

    const info = await fetch(`${base}/info`);
    assert.equal(info.status, 200);
    const body = (await info.json()) as Record<string, unknown>;
    assert.deepEqual(Object.keys(body).sort(), ["commit", "componentCount", "designSystemVersion", "server"]);
    assert.equal(body.commit, "abc1234");
    assert.equal(body.componentCount, 3);
    assert.match(body.designSystemVersion as string, /^\d+\.\d+\.\d+$/);

    assert.equal((await fetch(`${base}/health`, { method: "POST" })).status, 405);
    assert.equal((await fetch(`${base}/nope`)).status, 404);

    const anon = await fetch(`${base}/mcp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    assert.equal(anon.status, 401);
    assert.equal(anon.headers.get("www-authenticate"), "Bearer");

    const client = new Client({ name: "http-test", version: "0.0.0" });
    await client.connect(
      new StreamableHTTPClientTransport(new URL(`${base}/mcp`), { requestInit: { headers: { Authorization: `Bearer ${HTTP_TOKEN}` } } }),
    );
    const { tools } = await client.listTools();
    assert.equal(tools.length, 6);
    await client.close();
  } finally {
    http.closeAllConnections();
    await new Promise<void>((resolve) => http.close(() => resolve()));
  }
});

test("HTTP: /health is 503 without leaking the parser error when the catalog is broken", async () => {
  const load = () => Promise.reject(new Error("button.md: missing section \"## API\""));
  const { http, base } = await listen(createHttpHandler({ token: HTTP_TOKEN, commit: "unknown", load }));
  try {
    for (const route of ["/health", "/info"]) {
      const res = await fetch(`${base}${route}`);
      assert.equal(res.status, 503);
      const text = await res.text();
      assert.deepEqual(JSON.parse(text), { status: "catalog-error" });
      assert.doesNotMatch(text, /button\.md/);
    }
  } finally {
    await new Promise<void>((resolve) => http.close(() => resolve()));
  }
});

test("entry point starts from a directory whose name has # in it (T6.6)", async () => {
  // Inside the repo so tsx and the SDK resolve from node_modules.
  const dir = await mkdtemp(path.join(REPO_ROOT, "node_modules", ".sitops #entry "));
  try {
    for (const f of ["server.ts", "tools.ts", "catalog.ts", "contrast.ts"]) {
      await copyFile(path.join(REPO_ROOT, "src/mcp/sitops-design-system", f), path.join(dir, f));
    }
    const child = spawn(process.execPath, ["--import", "tsx", path.join(dir, "server.ts")], { cwd: REPO_ROOT, stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    const ready = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 15_000);
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
        if (stderr.includes("stdio ready")) {
          clearTimeout(timer);
          resolve(true);
        }
      });
      child.on("exit", () => {
        clearTimeout(timer);
        resolve(false);
      });
    });
    child.kill();
    assert.equal(ready, true, `server did not start from "${dir}": ${stderr}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
