# CI — what runs on every pull request

Source of truth for `.github/workflows/ci.yml`. Change this file first, then the workflow.

## Trigger

- Every `pull_request` targeting `main`.
- Every `push` to `main` (so the badge and the base-branch status stay honest after a merge).

## Jobs

One job, `check`, on `ubuntu-latest`, Node 22 (matches `engines.node` in `package.json`).

| Step | Command | Gate for |
|---|---|---|
| Install | `npm ci` | reproducible deps from `package-lock.json` |
| Typecheck | `npm run typecheck` | TypeScript strict across `src/` and `tests/` |
| Unit | `npm run test:unit` | Session 3 catalog parser, tool handlers, MCP round-trip, HTTP guard; repo governance (ruleset ↔ CI job name) |
| Browser | `npx playwright install --with-deps chromium` then `npm run test:e2e` | Session 2 axe gate and structural a11y checks (`A11Y.md` §5) |

Unit runs before the browser install so a typecheck or logic failure fails fast without paying for Chromium.

## Rules

- No secrets are needed. The MCP bearer test uses an in-memory token; nothing reads `SITOPS_MCP_BEARER_TOKEN` in CI.
- `concurrency` cancels an older run of the same PR when a new push lands.
- The job must stay green on `main`; a red base is handled per CLAUDE.md rule 4 (fix with tests), never by skipping a step.

## Branch protection (repository settings)

The intended ruleset is checked in as [`.github/rulesets/main-protection.json`](../.github/rulesets/main-protection.json)
so it is reviewed like any other spec. It applies to the default branch:

- Pull request required before merging, 0 approvals.
- Required status check `typecheck + tests`, branch must be up to date.
- Force pushes blocked, deletion restricted, no bypass list.

`tests/repo/governance.test.ts` fails if the required check in that file stops matching the job
`name:` in `.github/workflows/ci.yml`, so renaming the job cannot silently orphan the rule.

**To enforce it** (owner only; agent sessions cannot write repository settings):
Settings → Rules → Rulesets → New ruleset → **Import a ruleset** → choose the JSON file →
confirm Enforcement is **Active** → Create. Then re-run the check below and update the status line.

**Status: not enforced (re-verified 2026-09-28).**

- `GET /repos/{owner}/{repo}/rulesets` returns an empty list: no ruleset is saved on the repository.
- `GET /repos/{owner}/{repo}/rules/branches/main` returns an empty list: no rule applies to `main`.
- Earlier check (2026-09-23, PR #6): `mergeable_state: unstable` while `typecheck + tests` was still queued; an enforced required check reports `blocked`.
- An agent attempt to create the ruleset through the API was refused, which matches the note above.

Until enforcement is verified, the gate is convention: never merge a PR whose `typecheck + tests` is not green.
