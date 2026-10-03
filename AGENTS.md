# AGENTS.md

Guidance for AI coding agents working in this repository. See the [README](README.md) for the full project overview.

## Project

Cairn UI, the Angular 22 design system published as `@joanroucoux/cairn-ui`: a component library (`projects/ui`, standalone components, zoneless, signals, prefix `ui`) developed and documented through Storybook, which is also deployed to GitHub Pages (https://joanroucoux.github.io/cairn-ui/). There is no application: Storybook is the only dev surface. It was scaffolded from `angular-starter-ui` (see `.starter-manifest.json`).

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
| `pnpm run format`            | Prettier write                                                                                          |
| `pnpm run format:check`      | Prettier check                                                                                          |

Before considering a change done, run the same pipeline as CI: `format:check`, `lint`, `test:coverage`, `build`, `build-storybook`, `test-storybook:ci`.

## Architecture

- `projects/ui/<component>/`: one folder per component, `<name>.ts` + `<name>.spec.ts` + `<name>.stories.ts` co-located, no `.component`/`.directive` suffixes.
- **One folder, one ng-packagr entry point.** Each component folder holds an `ng-package.json` (`{ "lib": { "entryFile": "index.ts" } }`) and an `index.ts` exporting its public symbols. Consumers import `@joanroucoux/cairn-ui/<folder>`; a new component gets its own `ng-package.json` + `index.ts`. Cross-entry imports in production code, specs and stories go through the package path (`@joanroucoux/cairn-ui/motion`, resolved by `paths` in the root `tsconfig.json`), never a relative `../<folder>/...`. Imports inside a folder, `./internal/...` included, stay relative. A symbol another entry needs must be exported from `index.ts`, so it becomes public.
- `projects/ui/src/public-api.ts` — the primary entry point, required by ng-packagr, which **exports nothing** on purpose: a root barrel (or a single fesm) forces every component into the consumer's initial chunk, defeating esbuild's per-module splitting. Never export an entry from it.
- `projects/ui/styles/tokens.css` — the design tokens, shipped as a package asset (`dist/ui/styles/tokens.css`). It must stay a **pure token sheet**: no resets, no element styles. Preview-only chrome belongs in `.storybook/preview.css`.
- `projects/ui/docs/` — Storybook "Foundations" MDX pages (overview, colors, motion, typography).
- `projects/ui/README.md`: the README shown on the npm page. ng-packagr copies it into `dist/ui`, so it uses absolute URLs (npm does not resolve relative links) and must stay consistent with the root README's Setup section.
- `docs/github/logo.svg`: the logo shown in the root README.
- Module boundaries are enforced at lint time by Sheriff ([sheriff.config.ts](sheriff.config.ts)): **components never import each other**, shared building blocks get their own module. Each module's `index.ts` is its public surface and the ng-packagr entry (not an import shortcut inside the folder); private files go in an `internal/` subdirectory.
- The palette is **monochrome**: `--primary` carries no hue, which leaves `--positive`,
  `--negative` and `--stale` as the only colors in the interface. Their light values are darker
  than their dark values on purpose - a green that reads at 7.76:1 on near-black only reaches
  4.07:1 on white. The role is fixed across schemes, never the hex. Measured ratios live in
  `projects/ui/docs/colors.mdx`; `projects/ui/src/tokens.spec.ts` guards the token names.

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
- Compodoc being off, Storybook infers no prose: every component carries a `parameters.docs.description.component` and every `argType` a `description`, or the Docs page ships an empty props table. Descriptions follow one shape, taken from `@grafana/ui`: a sentence saying what the component is, then **When to use**, **When not to use** and **Accessibility** as `####` sections.
- Test utilities (`fn`, `userEvent`, `within`, `expect`) are imported from the **`storybook/test`** subpath.
- `autodocs` is enabled globally via `tags` in `.storybook/preview.ts` — do not re-tag individual stories.
- The theme control is `withThemeByDataAttribute` stamping `data-theme` on `<html>`; tokens resolve via `light-dark()`. Never bypass it with story-level colors. `system` is the default and maps to an **empty** attribute value, which is what lets `:root`'s own `color-scheme: light dark` decide.
- That control only reaches the preview iframe. Storybook's own chrome (sidebar, toolbar, Docs prose and tables) is styled by Storybook, so `.storybook/theme.ts` restates the tokens as a `ThemeVars`, applied to the manager in `.storybook/manager.ts` and to Docs pages through `parameters.docs.theme`.
- Both read `getPreferredColorScheme()` once at load, so **the chrome follows the OS and the toolbar drives the stories**. The two halves always agree with each other, which is the point: a light Docs page beside a dark sidebar is what this replaced. `@grafana/ui` splits it the same way.
- **Do not try to make the chrome follow the toolbar.** It was measured, not assumed: once the manager is running neither `setConfig` nor `api.setOptions` re-themes it, and a Docs page never re-renders on a globals change, so even a getter on `docs.theme` is read only once. What is left is a custom `docs.container`, which is a React component this repo will not own and which would not fix the sidebar anyway, or reloading the window on every switch, which was tried and felt worse than the problem.
- Should a globals listener ever be needed in the manager, it is `addons.register('id', (api) => api.on('updateGlobals', ...))`. `addons.getChannel().on('updateGlobals')` receives nothing there.
- Editing a color in `styles/tokens.css` means editing its twin in `.storybook/theme.ts`, otherwise the chrome and the components drift apart.
- Interaction tests are `play` functions, executed in CI by `@storybook/test-runner` against the built Storybook. The Storybook **Vitest addon is not an option**: it does not support Angular.
- Foundations MDX pages live in `projects/ui/docs/` and use `Meta` from `@storybook/addon-docs/blocks`. `Overview` is the landing page and is pinned first by `storySort`.

## Testing

- Component tests use Angular Testing Library (`render`, `screen`, `userEvent`) with template-string rendering (`render('<button ui-button>…</button>', { imports: [UiButton] })`): query by role or label, not by CSS selectors. jest-dom matchers are set up in `projects/ui/src/test-setup.ts`.
- Cover every variant/size branch of the class-record maps — that is what keeps coverage at 100%.
- Lines and branches are at 100% and must stay there; statements and functions sit just under it, because Angular attributes some generated code — the `forwardRef` arrows in decorator metadata, the `contentChild` query factory — to source positions no test can reach. A drop in **lines** is a real gap; a drop in statements alone, with lines still at 100%, is not. The thresholds enforced by `coverageThresholds` in angular.json (statements 85, branches 80, functions 70, lines 85) are intentionally lower than the actual figures: do not raise them. `*.stories.ts` files are excluded from coverage (`coverageExclude` in angular.json).

## Release

The library is published to npm by [release.yml](.github/workflows/release.yml) through npm trusted publishing (OIDC, no token). Never run `npm publish` by hand.

1. In a PR, bump `version` in `projects/ui/package.json` and add the entry to `projects/ui/CHANGELOG.md`.
2. Merge the PR into `main`.
3. Push the tag `vX.Y.Z` on the merge commit. The workflow checks that the tag equals `v` + the library version and that the commit is on `main`, runs the CI checks, builds, then publishes `dist/ui` with provenance.
4. A second job of `release.yml` creates the GitHub Release for the tag, using the `## X.Y.Z` section of `projects/ui/CHANGELOG.md` as its notes (the heading must be exactly `## X.Y.Z`, or the job fails). It also fails if a release for the tag already exists.

The Storybook is deployed to GitHub Pages by [storybook.yml](.github/workflows/storybook.yml) on every push to `main` (and on manual dispatch). It does not wait for CI: CI and the deploy run side by side on the same push.

## Gotchas

- `typescript` is pinned to `~6.0.2`: TypeScript 7 breaks `typescript-eslint` (via `ts-api-utils`). Do not bump until typescript-eslint supports TS 7. (This is also why the Storybook framework is `@storybook/angular-vite` — the webpack `@storybook/angular` peer range only allows TS ≤5.)
- `pnpm-workspace.yaml` `allowBuilds` is required for native postinstall scripts (esbuild, ...) — do not remove it.
- `fonts.css` must be loaded by the consumer's own build (a Vite import in `.storybook/preview.ts`, an `angular.json` `styles` entry in an app), never through Tailwind's `@import`, which does not rebase its `url()`s.
- jsdom ships the Popover API's default stylesheet (`[popover]:not(:popover-open) { display: none }`) but neither its JS methods nor the `:popover-open` pseudo-class those rules key off; `test-setup.ts` shims `showPopover`/`hidePopover` by flipping an inline `display` instead, which wins over that UA rule regardless of the pseudo-class.
- `UiMenu.close()` only calls `hidePopover()` when the menu was open: `hidePopover()` throws on a closed popover, and it fires the `toggle` event that calls `close()` again.
- GitHub Actions in `.github/workflows/` are pinned by commit SHA (Dependabot keeps them updated) — when adding one, pin it the same way.
- npm consumers of the published library must add `@source '../node_modules/<pkg>'` to their Tailwind CSS — templates in `node_modules` are not scanned by default. Keep this documented in both READMEs (root and `projects/ui/README.md`).
- The root `package.json` is private and its version is not used: the library's version lives in `projects/ui/package.json` and is bumped manually, with `projects/ui/CHANGELOG.md`, in the release PR (see Release). `projects/ui/CHANGELOG.md` is listed in `ng-package.json` assets and ignored by Prettier.
- Angular's zoneless scheduler calls `requestAnimationFrame` itself during bootstrap: assert on the rendered output, never on a count of animation frames.
- Text tokens clear 4.5:1 on `--background`, `--card`, `--elevated`, `--muted` and on `--soft` over `--background` or `--card`; `tokens.spec.ts` computes it, so a token edit that breaks it fails the test (ratios in `docs/colors.mdx`).
- Nothing is committed or pushed without an explicit request from the maintainer.
