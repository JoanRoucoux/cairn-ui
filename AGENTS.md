# AGENTS.md

Guidance for AI coding agents working in this repository. See the [README](README.md) for the full project overview.

## Project

Angular 22 design-system starter: a publishable component library (`projects/ui`, standalone components, zoneless, signals, prefix `ui`) developed and documented through Storybook. There is no application — Storybook is the only dev surface.

Package manager: **pnpm** (version pinned in the `packageManager` field of package.json). Node 24 (`.nvmrc`).

## Commands

| Command                      | Purpose                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm install`               | Install deps                                                                                            |
| `pnpm start`                 | Storybook dev server (http://localhost:6006)                                                            |
| `pnpm run test:coverage`     | Unit tests with coverage                                                                                |
| `pnpm run build`             | Library build (ng-packagr → `dist/ui`)                                                                  |
| `pnpm run build-storybook`   | Static Storybook build (→ `storybook-static/`)                                                          |
| `pnpm run test-storybook:ci` | Interaction tests against the built Storybook (needs Chromium: `pnpm exec playwright install chromium`) |
| `pnpm run lint`              | ESLint (includes Sheriff module-boundary rules)                                                         |
| `pnpm run format:check`      | Prettier check                                                                                          |

Before considering a change done, run the same pipeline as CI: `format:check`, `lint`, `test:coverage`, `build`, `build-storybook`, `test-storybook:ci`.

## Architecture

- `projects/ui/src/lib/<component>/` — one folder per component: `<name>.ts` + `<name>.spec.ts` + `<name>.stories.ts` co-located, no `.component`/`.directive` suffixes.
- `projects/ui/src/public-api.ts` — the library's **only** entry point (required by ng-packagr): every public symbol is exported there.
- `projects/ui/styles/tokens.css` — the design tokens, shipped as a package asset (`dist/ui/styles/tokens.css`). It must stay a **pure token sheet**: no resets, no element styles. Preview-only chrome belongs in `.storybook/preview.css`.
- `projects/ui/docs/` — Storybook "Foundations" MDX pages (colors, typography).
- Module boundaries are enforced at lint time by Sheriff ([sheriff.config.ts](sheriff.config.ts)): **components never import each other** — shared building blocks get their own module. Modules are barrel-less: no `index.ts`, import files directly; private files go in an `internal/` subdirectory (`public-api.ts` is the ng-packagr entry, not a barrel).

## Conventions

- Everything in the repo is written in **English** (code, comments, docs, commit messages).
- Commits follow [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint. lint-staged formats and lints staged files on commit.
- OnPush is Angular 22's default change detection: do **not** add `ChangeDetectionStrategy.OnPush` to components.
- Selectors use the `ui` prefix. Prefer attaching to native elements (Material-style): `button[ui-button]`, `input[uiInput]` (attribute components/directives keep native semantics, a11y and forms support for free); use element selectors (`ui-badge`) only when there is no native host.
- Signal `input()`s + `host: { '[class]': 'classes()' }` with a `computed()` mapping variant/size records to class strings. No decorators (`@Input`, `@HostBinding`).
- Styling is Tailwind-in-template: arbitrary-value utilities consuming the tokens (`bg-(--primary)`, `border-(--border)`). Components never hardcode colors.
- `verbatimModuleSyntax` is enabled: type-only imports must use `import type { X }` or `import { type X }`.
- `console` is forbidden everywhere (ESLint).

## Storybook

- Stories are CSF3, co-located with their component, with manual `argTypes` (compodoc is not used). Attribute-selector components need a `render` with a `template` and a `moduleMetadata` decorator.
- Test utilities (`fn`, `userEvent`, `within`, `expect`) are imported from the **`storybook/test`** subpath.
- `autodocs` is enabled globally via `tags` in `.storybook/preview.ts` — do not re-tag individual stories.
- The light/dark switcher is `withThemeByDataAttribute` toggling `data-theme` on `<html>`; tokens resolve via `light-dark()`. Never bypass it with story-level colors.
- Interaction tests are `play` functions, executed in CI by `@storybook/test-runner` against the built Storybook. The Storybook **Vitest addon is not an option**: it does not support Angular.
- Foundations MDX pages live in `projects/ui/docs/` and use `Meta` from `@storybook/addon-docs/blocks`.

## Testing

- Component tests use Angular Testing Library (`render`, `screen`, `userEvent`) with template-string rendering (`render('<button ui-button>…</button>', { imports: [UiButton] })`): query by role or label, not by CSS selectors. jest-dom matchers are set up in `projects/ui/src/test-setup.ts`.
- Cover every variant/size branch of the class-record maps — that is what keeps coverage at 100%.
- Coverage is at 100% and must stay there; the CI thresholds (85/80/70/85) are intentionally lower so downstream users of the starter are not blocked — do not raise them. `*.stories.ts` files are excluded from coverage (`coverageExclude` in angular.json).

## Generator

New design systems are scaffolded from this starter by [starter-generator](https://github.com/JoanRoucoux/starter-generator), a generic engine: everything starter-specific lives **here**, in [generator.config.json](generator.config.json) (files removed from generated projects, package renames, install commands — full spec in the generator's README) and `.generator/templates/` (currently only the generated README, rendered with `{{token}}` placeholders).

Keep them in sync with the starter:

- The demo components (`badge`, `button`, `input`) are **kept** in generated projects as reference implementations — do not add them to the manifest's `remove`.
- The manifest patches both [package.json](package.json) and [projects/ui/package.json](projects/ui/package.json) (the published name); if the library layout moves, update the manifest paths.
- Template-only content (community files, release tooling) must be listed in the manifest's `remove`.
- `.generator/templates/` stays excluded in [.prettierignore](.prettierignore) and the ESLint `globalIgnores`.
- The `generate` job in [ci.yml](.github/workflows/ci.yml) generates a project from the working tree and runs its quality gates — it fails when the manifest or templates drift.

## Gotchas

- `typescript` is pinned to `~6.0.2`: TypeScript 7 breaks `typescript-eslint` (via `ts-api-utils`). Do not bump until typescript-eslint supports TS 7. (This is also why the Storybook framework is `@storybook/angular-vite` — the webpack `@storybook/angular` peer range only allows TS ≤5.)
- `pnpm-workspace.yaml` `allowBuilds` is required for native postinstall scripts (esbuild, ...) — do not remove it.
- GitHub Actions in `.github/workflows/ci.yml` are pinned by commit SHA (Dependabot keeps them updated) — when adding one, pin it the same way.
- npm consumers of the published library must add `@source '../node_modules/<pkg>'` to their Tailwind CSS — templates in `node_modules` are not scanned by default. Keep this documented in the README.
- The root package version (release-please) is the starter's version; the library's own version lives in `projects/ui/package.json` and is bumped manually before publishing `dist/ui`.
- Nothing is committed or pushed without an explicit request from the maintainer.
