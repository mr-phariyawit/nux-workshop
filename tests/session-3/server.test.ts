/**
 * Session 3 — MCP round-trip over an in-memory transport (MCP_TASKS T4.3) and
 * the bearer guard for HTTP mode (T3.3).
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { SERVER_INFO, bearerMatches, createSitopsServer, readBearerFromEnv } from "../../src/mcp/sitops-design-system/server.js";

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

  assert.throws(() => readBearerFromEnv({}), /SITOPS_MCP_BEARER_TOKEN/);
  assert.throws(() => readBearerFromEnv({ SITOPS_MCP_BEARER_TOKEN: "short" }), /at least 32/);
  assert.equal(readBearerFromEnv({ SITOPS_MCP_BEARER_TOKEN: ` ${token} ` }), token);
});
