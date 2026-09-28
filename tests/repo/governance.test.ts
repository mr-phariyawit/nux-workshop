/**
 * Repo governance (docs/ci.md §Branch protection). The ruleset JSON is the spec
 * the owner imports; these checks keep it aligned with the workflow it gates.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { REPO_ROOT } from "../../src/mcp/sitops-design-system/catalog.js";

interface Rule {
  type: string;
  parameters?: Record<string, unknown>;
}
interface Ruleset {
  name: string;
  target: string;
  enforcement: string;
  conditions: { ref_name: { include: string[]; exclude: string[] } };
  bypass_actors: unknown[];
  rules: Rule[];
}

const read = (rel: string) => readFile(path.join(REPO_ROOT, rel), "utf8");

/** Job display names under `jobs:` in a workflow, without a YAML dependency. */
function jobNames(workflow: string): string[] {
  const jobs = workflow.slice(workflow.search(/^jobs:\s*$/m));
  return [...jobs.matchAll(/^ {4}name:\s*(.+?)\s*$/gm)].map((m) => m[1].replace(/^["']|["']$/g, ""));
}

test("ruleset requires the CI job by its exact name", async () => {
  const ruleset = JSON.parse(await read(".github/rulesets/main-protection.json")) as Ruleset;
  const checks = ruleset.rules.find((r) => r.type === "required_status_checks")?.parameters as
    | { strict_required_status_checks_policy: boolean; required_status_checks: { context: string }[] }
    | undefined;
  assert.ok(checks, "required_status_checks rule is missing");
  const names = jobNames(await read(".github/workflows/ci.yml"));
  assert.ok(names.length > 0, "no job name found in ci.yml");
  for (const { context } of checks.required_status_checks) {
    assert.ok(names.includes(context), `required check "${context}" is not a job name in ci.yml (${names.join(", ")})`);
  }
  assert.equal(checks.strict_required_status_checks_policy, true, "branch must be up to date before merging");
});

test("ruleset matches docs/ci.md: active on main, PR required, no force push or deletion, no bypass", async () => {
  const ruleset = JSON.parse(await read(".github/rulesets/main-protection.json")) as Ruleset;
  assert.equal(ruleset.target, "branch");
  assert.equal(ruleset.enforcement, "active", "a disabled ruleset is how the first attempt failed");
  assert.deepEqual(ruleset.conditions.ref_name.include, ["~DEFAULT_BRANCH"]);
  assert.deepEqual(ruleset.bypass_actors, []);
  const types = ruleset.rules.map((r) => r.type).sort();
  assert.deepEqual(types, ["deletion", "non_fast_forward", "pull_request", "required_status_checks"]);
});
