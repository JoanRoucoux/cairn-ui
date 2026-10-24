<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/github/banner-dark.png">
    <img alt="Cairn UI: Components and tokens behind Cairn." src="docs/github/banner-light.png">
  </picture>
</p>

<div align="center">

[![CI](https://github.com/JoanRoucoux/cairn-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/JoanRoucoux/cairn-ui/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@joanroucoux/cairn-ui?logo=npm)](https://www.npmjs.com/package/@joanroucoux/cairn-ui)
[![Storybook](https://img.shields.io/badge/Storybook-live-FF4785?logo=storybook&logoColor=white)](https://joanroucoux.github.io/cairn-ui/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

Cairn UI is the component library behind [Cairn](https://github.com/JoanRoucoux/cairn), a personal wealth tracker. It is the design system of the Cairn repositories (see [The Cairn repositories](#the-cairn-repositories)): [cairn-web](https://github.com/JoanRoucoux/cairn-web), the Angular frontend, consumes it from npm.

## Storybook

Every component has a live Docs page, with its inputs, usage guidance and accessibility contract, plus Foundations pages for colors, typography and motion: https://joanroucoux.github.io/cairn-ui/

## Highlights

- **Monochrome**: the palette carries no hue. Green, red and amber are the only colors in the interface, and each one means something (gain, loss, stale data).
- **Accessible**: components wrap native elements (`button[ui-button]`, `input[uiInput]`, `<dialog>`, the Popover API) so keyboard behavior, forms and assistive technology support come from the platform. Every story is checked by the Storybook a11y addon, and a violation fails the build.
- **Modern Angular**: standalone, zoneless-ready components built on signals (`input()`, `model()`, `computed()`), for Angular 22.
- **Tailwind 4 tokens**: colors, type, radii and motion are CSS custom properties (`tokens.css`) that `theme.css` turns into Tailwind utilities. Components never hardcode a color.
- **One entry point per component**: the package root exports nothing, each folder is its own entry point, imported as `@joanroucoux/cairn-ui/<folder>`, so an application only ships the components it uses. Moving [cairn-web](https://github.com/JoanRoucoux/cairn-web) from a single bundle to subpaths took its initial bundle from 653.65 kB to 502.83 kB.

## Installation

```bash
pnpm add @joanroucoux/cairn-ui
```

Peer dependencies: `@angular/common` and `@angular/core`, version 22. The styles use Tailwind CSS 4, which the consuming application provides. The runtime dependencies `d3-scale` and `d3-shape` (used by the charts) are installed with the package.

## Setup

Consumers import three stylesheets, in order, and register the package as a Tailwind source (templates in `node_modules` are not scanned by default):

```css
@import 'tailwindcss';
@import '@joanroucoux/cairn-ui/styles/tokens.css';
@import '@joanroucoux/cairn-ui/styles/theme.css';
@import '@joanroucoux/cairn-ui/styles/motion.css';
@source '../node_modules/@joanroucoux/cairn-ui';
```

`tokens.css` declares the custom properties, and `theme.css` turns them into Tailwind utilities (`text-body`, `rounded-control`, `ease-out`...) and removes Tailwind's default scales. A consumer that only needs the custom properties, without Tailwind, can import `tokens.css` alone: it stays a pure token sheet with no dependency on `theme.css`.

`motion.css` ships the keyframes (`cairn-spin`, `cairn-pulse`), the `ui-enter-*` and `ui-leave-fade` classes for Angular's `animate.enter` / `animate.leave`, and the view-transition and theme-switch rules.

`fonts.css` self-hosts Rubik and must **not** be routed through the Tailwind entry above: its `@font-face` rules carry `url(./fonts/...)` relative to itself, and a bundler that inlines it into another CSS file's `@import` (as Tailwind's CSS-first pipeline does) does not rebase that path, so the browser requests a file that was never copied anywhere. Add it wherever the app's own build rebases relative `url()`s in CSS it processes directly instead: for an Angular app, `angular.json`'s `styles` array, next to the Tailwind stylesheet:

```json
"styles": ["src/styles.css", "node_modules/@joanroucoux/cairn-ui/styles/fonts.css"]
```

## Usage

Import each component from its own subpath:

```ts
import { Component } from '@angular/core';

import { UiBadge } from '@joanroucoux/cairn-ui/badge';
import { UiButton } from '@joanroucoux/cairn-ui/button';

@Component({
  selector: 'app-example',
  imports: [UiButton, UiBadge],
  template: `
    <ui-badge>Synced</ui-badge>
    <button ui-button variant="primary">Save</button>
  `,
})
export class Example {}
```

Light and dark follow the operating system through `light-dark()`; to force a scheme, set `data-theme="light"` or `data-theme="dark"` on `<html>`.

## Components

39 entry points. The subpath of a folder is `@joanroucoux/cairn-ui/<folder>`. Beside the components, most folders also export their option tuples (`BUTTON_VARIANTS`...) and types.

### Forms and inputs

| Folder         | Main exports                                   | Purpose                                                      |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `button`       | `UiButton`                                     | Clickable element whose variant says how consequential it is |
| `input`        | `UiInput`, `UiTextarea`                        | Styled native `<input>` and `<textarea>`                     |
| `select`       | `UiSelect`                                     | Styled native `<select>`                                     |
| `select-pill`  | `UiSelectPill`                                 | Pill opening a menu of exclusive choices, heading a chip row |
| `field`        | `UiField`, `UiFieldLeading`, `UiFieldTrailing` | Label, hint and error around a projected control             |
| `control`      | `UI_CONTROL`, `UiControl`, `UiControlError`    | Contract between a field and its control                     |
| `switch`       | `UiSwitch`                                     | Native checkbox styled as a switch                           |
| `icon-toggle`  | `UiIconToggle`                                 | Round icon button with an on and off state                   |
| `segmented`    | `UiSegmented`                                  | Exclusive choice in a small set, such as a chart range       |
| `choice-chips` | `UiChoiceChips`                                | Exclusive choice among named options, as wrapping pills      |
| `filter-chips` | `UiFilterChips`                                | Single-choice filter pills with optional counts              |

### Data display

| Folder         | Main exports                                                             | Purpose                                             |
| -------------- | ------------------------------------------------------------------------ | --------------------------------------------------- |
| `amount`       | `UiAmount`, `formatAmount`, `UI_AMOUNT_MASKED`                           | Locale formatting of numbers and money              |
| `delta`        | `UiDelta`                                                                | Signed amount whose sign carries meaning            |
| `stat`         | `UiStat`                                                                 | Label, figure and named period of change            |
| `fact`         | `UiFacts`, `UiFact`                                                      | Label and value pairs on a description list         |
| `badge`        | `UiBadge`                                                                | Small descriptor next to the thing it labels        |
| `avatar`       | `UiAvatar`, `UiAvatarLink`                                               | Initials in a disc, standing in for a person        |
| `table`        | `UiTable`, `UiTh`, `UiTr`, `UiTd`, `UiGroup`, `UiRowLink`, `UiRowAction` | Styled native `<table>` with grouped rows           |
| `row`          | `UiRow`, `UiListRow`, `UiRowGroup`, `UiRowItem`, `UiRowTile`             | Clickable list row                                  |
| `card`         | `UiCard`                                                                 | Surface that groups related content                 |
| `meter`        | `UiMeter`                                                                | Proportion of a whole, drawn as one bar             |
| `group-header` | `UiGroupHeader`                                                          | Collapsible header of a grouped card on a phone     |
| `result-group` | `UiResultGroup`                                                          | Results of one search source, with their own states |

### Charts

| Folder       | Main exports  | Purpose                                                   |
| ------------ | ------------- | --------------------------------------------------------- |
| `line-chart` | `UiLineChart` | One series over time, with a reference line and a tooltip |
| `donut`      | `UiDonut`     | Ring chart with its legend                                |

### Feedback and state

| Folder       | Main exports              | Purpose                                                 |
| ------------ | ------------------------- | ------------------------------------------------------- |
| `alert`      | `UiAlert`                 | Inline message about a failure or the cost of an action |
| `toast`      | `UiToaster`, `UiToasts`   | Short confirmation after an action that changed data    |
| `skeleton`   | `UiSkeleton`              | Placeholder at the shape of the content to come         |
| `empty`      | `UiEmpty`                 | Centered empty state with a title, a hint and an action |
| `async`      | `UiAsync`, `delayedState` | Loading, error with retry, or empty state of a block    |
| `stale-link` | `UiStaleLink`             | Link in the stale tone for late data                    |

### Navigation and actions

| Folder          | Main exports                            | Purpose                                           |
| --------------- | --------------------------------------- | ------------------------------------------------- |
| `nav-item`      | `UiNavItem`                             | Sidebar destination from `64rem`                  |
| `tab-bar`       | `UiTabBar`, `UiTab`                     | Bottom navigation below `64rem`                   |
| `back-link`     | `UiBackLink`                            | Link back to the parent screen                    |
| `external-link` | `UiExternalLink`                        | Link that leaves the application                  |
| `menu`          | `UiMenu`, `UiMenuTrigger`, `UiMenuItem` | Secondary actions menu on the native Popover API  |
| `action-bar`    | `UiActionBar`                           | Primary actions fixed above the tab bar on phones |

### Overlay and motion

| Folder   | Main exports                                                                                     | Purpose                                                             |
| -------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `dialog` | `UiDialog`                                                                                       | Modal dialog on the native `<dialog>`                               |
| `drawer` | `UiDrawer`                                                                                       | Modal side panel on the right edge, for a row's detail on a desktop |
| `motion` | `UiFlipList`, `UiFlipItem`, `UiHighlight`, `injectReducedMotion`, `holdTransitionsUntilRendered` | List reflow, highlight and reduced-motion helpers                   |

## MCP server

[`@joanroucoux/cairn-ui-mcp`](projects/mcp/README.md) lets a coding agent look up the components, their selectors and inputs, when to use each one, the tokens and the setup, from the manifest the library ships:

```bash
claude mcp add cairn-ui -- npx -y @joanroucoux/cairn-ui-mcp
```

## Design principles

- **Tokens, not values**: components consume `--primary`, `--border` and friends through Tailwind arbitrary values. The token sheet is the single place a color changes.
- **Measured contrast**: text tokens clear 4.5:1 on the surfaces they sit on, and a unit test computes it. The ratios and the neutral ramp are in [colors](projects/ui/docs/colors.mdx).
- **Reduced motion**: scales, durations and curves are tokens, and `prefers-reduced-motion: reduce` neutralizes them in the token sheet: presses stop scaling, slides become short fades, the skeleton stops pulsing. See [motion](projects/ui/docs/motion.mdx).
- **Tabular figures**: amounts line up in columns. Sizes, weights and the figure rules are in [typography](projects/ui/docs/typography.mdx).
- **Light, dark and system**: tokens resolve through `light-dark()`, so a scheme is a matter of `color-scheme`, not of a second stylesheet.

The [overview](projects/ui/docs/overview.mdx) page covers the rest.

## The Cairn repositories

| Repository                                                     | Content                                                                                                                 |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [cairn](https://github.com/JoanRoucoux/cairn)                  | Backend: API, batch jobs, Kafka worker, schema                                                                          |
| [cairn-web](https://github.com/JoanRoucoux/cairn-web)          | Angular 22 frontend                                                                                                     |
| [cairn-ui](https://github.com/JoanRoucoux/cairn-ui) (this one) | Design system, published on npm as `@joanroucoux/cairn-ui`, with a [Storybook](https://joanroucoux.github.io/cairn-ui/) |

The host, the shared proxy and the monitoring are managed in [infra](https://github.com/JoanRoucoux/infra), shared by every application on the server.

## Tech stack

| Tool                                  | Version                   | Role                                                     |
| ------------------------------------- | ------------------------- | -------------------------------------------------------- |
| Angular                               | 22 (peer range `^22.0.0`) | Standalone, signal-based components                      |
| TypeScript                            | 6                         | Language                                                 |
| Tailwind CSS                          | 4                         | Utilities generated from the CSS tokens                  |
| d3-scale, d3-shape                    | 4, 3                      | Scales and paths of the charts                           |
| ng-packagr                            | 22                        | Angular Package Format build, one entry point per folder |
| Storybook (`@storybook/angular-vite`) | 10                        | Development surface, documentation and interaction tests |
| Storybook a11y addon (axe)            | 10                        | Accessibility check of every story                       |
| Vitest                                | 5                         | Unit tests, with jsdom 30                                |
| Angular Testing Library               | 19                        | Component tests by role and label                        |
| Playwright                            | 1                         | Chromium for the Storybook test runner                   |
| Model Context Protocol SDK            | 1                         | MCP server                                               |
| Sheriff                               | 0.20                      | Module boundaries, enforced by lint                      |
| ESLint                                | 10                        | Lint                                                     |
| Prettier                              | 3                         | Formatting                                               |
| pnpm                                  | 11                        | Package manager                                          |

## Quality and delivery

- **Test layers**: unit tests with coverage (lines and branches are kept at 100 %), MCP server and manifest generator tests, and Storybook interaction tests against the built Storybook, where the a11y addon fails the build on a violation.
- **CI**: formatting, lint (including Sheriff boundaries), unit tests with coverage, MCP tests, the library build, the MCP server build, the Storybook build and the Storybook interaction tests.
- **Storybook deployment**: the Storybook is redeployed to GitHub Pages on every push to `main` by [its own workflow](.github/workflows/storybook.yml).
- **Dependabot** keeps npm and GitHub Actions dependencies up to date.
- **Releases**: the library version lives in `projects/ui/package.json`, independently of the root package.

  1. In a PR, bump `version` in `projects/ui/package.json` and add the entry to [`projects/ui/CHANGELOG.md`](projects/ui/CHANGELOG.md).
  2. Merge the PR into `main`.
  3. Push the tag `vX.Y.Z` on the merge commit.

  The [release workflow](.github/workflows/release.yml) checks that the tag matches the version and that the commit is on `main`, runs the CI checks, publishes `dist/ui` to npm with provenance (trusted publishing, no token), then creates the GitHub Release with the changelog section as its notes.

  The MCP server is released separately, the same way: bump `projects/mcp/package.json`, add the entry to [`projects/mcp/CHANGELOG.md`](projects/mcp/CHANGELOG.md), merge, then push the tag `mcp-vX.Y.Z`. [Its workflow](.github/workflows/release-mcp.yml) publishes `dist/mcp`, which bundles the manifest of the library at that commit.

## Development

Prerequisites: Node 24 (see `.nvmrc`) and pnpm.

```bash
pnpm install
pnpm start      # Storybook on http://localhost:6006
```

Storybook is the only development surface: there is no application.

### Scripts

| Script                       | Description                                                |
| ---------------------------- | ---------------------------------------------------------- |
| `pnpm start`                 | Storybook dev server                                       |
| `pnpm run build`             | Builds the library into `dist/ui` (Angular Package Format) |
| `pnpm run build:mcp`         | Builds the MCP server into `dist/mcp`, after `build`       |
| `pnpm run test:mcp`          | MCP server and manifest generator tests, with coverage     |
| `pnpm run build-storybook`   | Static Storybook build (to `storybook-static/`)            |
| `pnpm test`                  | Unit tests (Vitest)                                        |
| `pnpm run test:coverage`     | Unit tests with coverage report and thresholds             |
| `pnpm run test-storybook:ci` | Storybook interaction tests against the built Storybook    |
| `pnpm run lint`              | Lint (ESLint, includes Sheriff module boundaries)          |
| `pnpm run format`            | Format the whole project (Prettier)                        |
| `pnpm run format:check`      | Check formatting without writing                           |

## Documentation

- [Storybook](https://joanroucoux.github.io/cairn-ui/): a Docs page per component, plus the Foundations pages
- [projects/ui/docs/](projects/ui/docs/): the Foundations pages ([overview](projects/ui/docs/overview.mdx), [colors](projects/ui/docs/colors.mdx), [typography](projects/ui/docs/typography.mdx), [motion](projects/ui/docs/motion.mdx))
- [projects/ui/README.md](projects/ui/README.md): the README shown on the npm page
- [projects/mcp/README.md](projects/mcp/README.md): the MCP server
- [projects/ui/CHANGELOG.md](projects/ui/CHANGELOG.md), [projects/mcp/CHANGELOG.md](projects/mcp/CHANGELOG.md): release notes of the library and of the MCP server
- [AGENTS.md](AGENTS.md): architecture, conventions and testing guidelines, for contributors and coding agents

## License

[MIT](LICENSE)

<sub>Generated from [angular-starter-ui](https://github.com/JoanRoucoux/angular-starter-ui).</sub>
