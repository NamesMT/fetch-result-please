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
- No `release` script on purpose — publishing locally would skip provenance; use the workflow.
