# nux-workshop

Workshop repository for NUX Design's "AI-Driven Design" course: Markdown contracts, a11y-gated
vibe-coded screens, and a read-only design-system MCP server. Public.

Start at [`docs/homework/README.md`](docs/homework/README.md) for the scenario and how to run
everything; [`docs/course-map.md`](docs/course-map.md) is the course synthesis.

## Layout

```
docs/      specs and decisions (Markdown is the source of truth)
src/       implementation
tests/     tests
```

## Getting started

1. Clone: `git clone https://github.com/mr-phariyawit/nux-workshop`
2. `npm install && npm run typecheck && npm test` (Node 22; the e2e half needs Chromium).
3. Branch from `main`, open a PR. Never push to `main` directly. CI (`typecheck + tests`) must be
   green before merging; see [`docs/ci.md`](docs/ci.md) for what runs and how `main` is protected.
