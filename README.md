# cairn-ui

Cairn UI — Angular design system generated from [angular-starter-ui](https://github.com/JoanRoucoux/angular-starter-ui) v1.2.1: a publishable component library (`projects/ui`) developed and documented through Storybook.

## Getting started

```bash
pnpm install
pnpm start      # Storybook on http://localhost:6006
```

## Scripts

| Script                       | Description                                                |
| ---------------------------- | ---------------------------------------------------------- |
| `pnpm start`                 | Storybook dev server                                       |
| `pnpm run build`             | Builds the library into `dist/ui` (Angular Package Format) |
| `pnpm run build-storybook`   | Static Storybook build (→ `storybook-static/`)             |
| `pnpm test`                  | Unit tests (Vitest)                                        |
| `pnpm run test:coverage`     | Unit tests with coverage report and thresholds             |
| `pnpm run test-storybook:ci` | Storybook interaction tests against the built Storybook    |
| `pnpm run lint`              | Lint (ESLint, includes Sheriff module boundaries)          |
| `pnpm run format`            | Format the whole project (Prettier)                        |

## Next steps

- Grow your components in `projects/ui/src/lib/`: one folder per component (`badge`, `button` and `input` are the reference implementations), each exported from `projects/ui/src/public-api.ts`.
- Make the design tokens yours in `projects/ui/styles/tokens.css` — components consume them through Tailwind arbitrary values and never hardcode colors.
- The published package is named `@joanroucoux/cairn-ui` ([projects/ui/package.json](projects/ui/package.json)); the unscoped `cairn-ui` belongs to someone else on npm. Its version is managed in that file, independently of the root version.

## Publishing and consuming

The publishable artifact is built from `projects/ui` into `dist/ui`. Consumers must import three stylesheets, in
order, and register the package as a Tailwind source (templates in `node_modules` are not scanned by default):

```css
@import 'tailwindcss';
@import '@joanroucoux/cairn-ui/styles/tokens.css';
@import '@joanroucoux/cairn-ui/styles/theme.css';
@import '@joanroucoux/cairn-ui/styles/motion.css';
@source '../node_modules/@joanroucoux/cairn-ui';
```

`tokens.css` declares the custom properties, and `theme.css` turns them into Tailwind utilities (`text-body`,
`rounded-control`, `ease-out`...) and removes Tailwind's default scales. A consumer that only needs the custom
properties, without Tailwind, can import `tokens.css` alone: it stays a pure token sheet with no dependency on
`theme.css`.

`motion.css` ships the keyframes (`cairn-spin`, `cairn-pulse`), the `ui-enter-*` and `ui-leave-fade` classes for Angular's `animate.enter` / `animate.leave`, and the view-transition and theme-switch rules.

`fonts.css` self-hosts Rubik and must **not** be routed through the Tailwind entry above: its `@font-face` rules
carry `url(./fonts/...)` relative to itself, and a bundler that inlines it into another CSS file's `@import` (as
Tailwind's CSS-first pipeline does) does not rebase that path, so the browser requests a file that was never copied
anywhere. Add it wherever the app's own build rebases relative `url()`s in CSS it processes directly instead: for an
Angular app, `angular.json`'s `styles` array, next to the Tailwind stylesheet:

```json
"styles": ["src/styles.css", "node_modules/@joanroucoux/cairn-ui/styles/fonts.css"]
```

See [AGENTS.md](AGENTS.md) for the architecture, conventions and testing guidelines inherited from the starter.
