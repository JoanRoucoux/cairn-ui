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
- The published package is named `cairn-ui` ([projects/ui/package.json](projects/ui/package.json)); switch to a scope (e.g. `@your-scope/ui`) there if needed. Its version is managed in that file, independently of the root version.

## Publishing and consuming

The publishable artifact is built from `projects/ui` into `dist/ui`. Consumers must:

1. Import the tokens: `@import 'cairn-ui/styles/tokens.css';`
2. Register the package as a Tailwind source (templates in `node_modules` are not scanned by default): `@source '../node_modules/cairn-ui';`

See [AGENTS.md](AGENTS.md) for the architecture, conventions and testing guidelines inherited from the starter.
