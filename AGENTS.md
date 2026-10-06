# AGENTS.md

`fetch-result-please` is a small, ESM-only library that turns a `fetch` `Response` into a consumable
result: `fetchRP` parses the body by content type and `createFetchError` wraps non-ok responses in a
`DetailedError`. Node >= 22.14.0, pnpm, `#src/*` import map, tsdown build, Vitest tests.

## Commands

```sh
pnpm run lint             # eslint (@antfu/eslint-config) — it also owns formatting
pnpm run test             # vitest in watch mode; use `pnpm exec vitest run` for one pass
pnpm run test:types       # tsc --noEmit
pnpm run quickcheck       # lint + test:types — the fast gate
pnpm run check            # lint + test:types + vitest run --coverage — the full gate (`prerelease`)
pnpm run build            # tsdown -> dist/index.mjs + dist/index.d.mts
pnpm run release:check    # validate a version bump: `pnpm run release:check 0.3.0`
pnpm run release:preview  # print the changelog the next release would get
```

## Structure

- `src/index.ts` — the whole package: `fetchRP`, `createFetchError`, `detectResponseType`.
  package.json `source` points here; `exports` / `main` point at the built `dist/`.
- `test/index.test.ts` — the Vitest suite; imports the source as `#src/index.js`.
- `tsdown.config.ts` — build config (entry `src/index.ts`, `dts: true`).
- `tsconfig.json` — strict, `isolatedDeclarations`, `types: ["vitest"]`; `vitest.config.ts` adds coverage.
- `.github/workflows/` — `quickcheck`, `test-and-codecov`, `typedoc` and `release` are all
  `workflow_dispatch`-only; `release` is the publish pipeline below.
- `scripts/` — release helpers used by the release workflow, not by the library.

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, …) — the changelog is derived from them.
- ESLint via `@antfu/eslint-config` owns formatting: no Prettier, single quotes, 2-space indent.
  `simple-git-hooks` runs `lint-staged` (`eslint --fix`) on every commit, so run `pnpm run lint`
  before claiming a change is clean.
- `isolatedDeclarations` is on: every exported function needs an explicit return type.
- ESM only: `"type": "module"` and an `import`-only `exports` map — do not add a CJS build.
- Comments are sparse — explain non-obvious intent, not mechanics.

## Docs

Three tiers, so a reader loads only what the task needs:

1. **`AGENTS.md`** (this file) — orientation and the rules that prevent defects. Read every session.
2. **`.agentDocs/`** — depth that would bloat this file: module rationale, traps with their causes,
   compatibility rules. Read on demand.
3. **`README.md` / `docs/`** — for a person using the package, not for an agent.

**There is no `.agentDocs/` here yet and none is needed at this size.** Create one when a section
above outgrows a screen or two: move the *reasoning* out and keep the *rule* here with a pointer to
it — nobody reads a file they do not open. Each document opens with a one-line scope, and this file
links it.

## How to work here

- Check who calls it before changing it; say when impact is unclear rather than guessing.
- Never overwrite or delete a large section you have not understood.
- Do not invent requirements; surface what looks needed.
- Report risk, not just the change: correctness, security, operational, integration.
- **Fix the root cause, not the instance** — a copied helper, a rule stated twice, a guard bypassed by
  a second path: one implementation, one guard.
- Verify before claiming, and say which direction you checked; a passing test pins nothing on its own.
- Missing recall: read this file and `git log` first.

## Conciseness (applies everywhere)

Prune verbose, keep correctness — code, comments, docs. A comment only for non-obvious intent. One
idea per sentence; cut what would not change what a reader does. Delete history `git log` already
holds — keep the rule, not the story. Never drop a caveat to save a line.

## User-facing docs

`README.md` alone, for a person. Keep it a **concise first read**; put depth in `<details>` spoilers and add visuals where they help.
No `docs/` yet; one would follow these rules. Docs ship with the change, same commit.

## Releasing

Version-first and manual: dispatch **Actions → Release → Run workflow** with the version (no leading
`v`); `.github/workflows/release.yml` is the only publish path (a pushed tag publishes nothing) and
gates on `pnpm run check`. `dry-run` only stops before push/release/publish — changelogen still bumps
`package.json`, writes `CHANGELOG.md`, commits and tags on the runner. One-time trusted-publisher
setup (publish once by hand first) is in the README.

## Gotchas

- The suite makes real network calls (`jsonplaceholder.typicode.com`, `httpbin.org`), so the gate can
  fail when the network is down or those services misbehave — not because of a code change.
- `dist/` is built, never committed, and `files` ships only it; `prepublishOnly` rebuilds, so `npm publish` builds twice.
- The release workflow uses Node 24 for `npm publish --provenance`; the other workflows use Node 22.
- `package.json` key order is enforced by eslint (`jsonc/sort-keys`): `description` before `author`, `homepage` before `keywords` — run `pnpm run lint` after editing it.
- No `release` script on purpose — publishing locally would skip provenance; use the workflow.
