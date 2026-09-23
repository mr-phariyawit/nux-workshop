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
| Unit | `npm run test:unit` | Session 3 catalog parser, tool handlers, MCP round-trip, bearer guard |
| Browser | `npx playwright install --with-deps chromium` then `npm run test:e2e` | Session 2 axe gate and structural a11y checks (`A11Y.md` §5) |

Unit runs before the browser install so a typecheck or logic failure fails fast without paying for Chromium.

## Rules

- No secrets are needed. The MCP bearer test uses an in-memory token; nothing reads `SITOPS_MCP_BEARER_TOKEN` in CI.
- `concurrency` cancels an older run of the same PR when a new push lands.
- The job must stay green on `main`; a red base is handled per CLAUDE.md rule 4 (fix with tests), never by skipping a step.

## Branch protection (manual, not in this repo)

Once this workflow has run once, mark `check` as a required status check on `main` in the repository settings so `pull_request` cannot merge red.
