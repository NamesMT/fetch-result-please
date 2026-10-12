# AGENTS.md

`fetch-result-please` is a small, ESM-only library that turns a `fetch` `Response` into a consumable
result: `fetchRP` parses the body by content type and `createFetchError` wraps non-ok responses in a
`DetailedError`. Node >= 22.14.0, pnpm, `#src/*` import map, tsdown build, Vitest tests.

## Docs

Where knowledge lives, and when to reach for each:

| tier | what it holds | when you use it |
| --- | --- | --- |
| `AGENTS.md` — this file | orientation and the rules that prevent defects | read every session; write when a rule is learned the hard way |
| `.agentDocs/` | depth: module rationale, traps with their causes, compatibility | read on demand, before touching that area; write when a rule needs its reasoning kept |
| `docs/` | how-to and reference for a person using this package | read when the task is user-facing; write in the same commit as the change |
| `README.md` | the first read, for a person | write alongside `docs/` |

- **One home per fact.** State the rule here, keep the reasoning in `.agentDocs/` and link it — never both.
- **A dead pointer is a bug.** If the target is gone, delete the pointer rather than leave it.
- Move depth behind a pointer once a section outgrows a screen or two; keep the rule inline.

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
pnpm run prerelease       # alias of `pnpm run check`
```

## Structure

- `src/index.ts` — the whole package: `fetchRP`, `createFetchError`, `detectResponseType`.
  package.json `source` points here; `exports` / `main` point at the built `dist/`.
- `test/index.test.ts` — the Vitest suite; imports the source as `#src/index.js`.
- `tsconfig.json` — strict, `isolatedDeclarations`, `types: ["vitest"]`; `vitest.config.ts` adds coverage.
- `.github/workflows/` — `quickcheck`, `test-and-codecov`, `typedoc` and `release` are all
  `workflow_dispatch`-only; `release` is the publish pipeline below.
- `scripts/` — release helpers used by the release workflow, not by the library.

## Conventions

- Conventional commits (`feat:`, `fix:`, `chore:`, …) — the changelog is derived from them.
- ESLint (`@antfu/eslint-config`) owns lint and formatting; `lint-staged` runs `eslint --fix` on commit — run `pnpm run lint` before claiming a change is clean.
- `isolatedDeclarations` is on: every exported function needs an explicit return type.
- ESM only: `"type": "module"` and an `import`-only `exports` map — do not add a CJS build.
- Comments are sparse — explain non-obvious intent, not mechanics.

## How to work here

- **Check the callers before you change anything.** Grep who uses it and which tests name it. If the
  impact is unclear, say so — do not guess.
- **Never overwrite or delete a large section you have not understood.** Read it, or say what you could
  not determine and ask.
- **Do not invent requirements.** Build what was asked; surface what else you notice and let it be
  decided.
- **Fix the class, not the instance.** A copied helper, a rule stated twice, a guard bypassed by a
  second path is one problem: one implementation, one guard. That is the work, not a follow-up to ask
  for. Stay inside the task rather than refactoring the world.
- **Verify before claiming, and say what you checked.** A passing test is not evidence it pins
  anything — **break the thing it guards and watch it fail.** If it still passes, either the test is
  decoration or a different guard is running; find out which. Where a stub cannot answer the question,
  drive the real thing.
- **Never write an identifier from memory.** A commit hash, path, line number or version must be quoted
  from the source; a plausible-looking invented one is worse than none.
- **A stated blocker is a hypothesis, not a fact.** Re-test "cannot install X" / "tool unavailable"
  before inheriting it, and never report a failure your own flag forced.
- **Report the risk with the change** — correctness, security, operational and integration; plus what
  you could not verify and every assumption you made. An unverified claim marked as such beats a
  confident one that is wrong.
- **Missing recall of this repo?** Read this file, `.agentDocs/` and `git log` before acting, then ask
  1–3 focused questions rather than guessing at intent.

## Conciseness

**Prune verbose, keep correctness** — code, comments, docs alike.

- Code: a comment only for non-obvious *intent*, never to restate the line, and never long. A block
  arguing for its own change is a commit message.
- Docs: one idea per sentence. Cut anything that would not change what a reader does.
- Delete history `git log` already holds — keep the *rule* that came out of it, not the story.
- **Never drop a caveat to save a line.** Concise means no filler, not fewer facts.

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
- No `release` script on purpose — publishing locally would skip provenance; use the workflow.
