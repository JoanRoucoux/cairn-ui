# @joanroucoux/cairn-ui

A monochrome, accessible Angular design system, built for [Cairn](https://github.com/JoanRoucoux/cairn).

Browse every component, live, in the [Storybook](https://joanroucoux.github.io/cairn-ui/).

## Installation

```bash
pnpm add @joanroucoux/cairn-ui
```

Peer dependencies: `@angular/common` and `@angular/core`, version 22. The styles use Tailwind CSS 4, which the consuming
application provides.

## Setup

Import three stylesheets, in order, and register the package as a Tailwind source (templates in `node_modules` are
not scanned by default):

```css
@import 'tailwindcss';
@import '@joanroucoux/cairn-ui/styles/tokens.css';
@import '@joanroucoux/cairn-ui/styles/theme.css';
@import '@joanroucoux/cairn-ui/styles/motion.css';
@source '../node_modules/@joanroucoux/cairn-ui';
```

`fonts.css` self-hosts Rubik and must not be imported through the Tailwind entry above: its `@font-face` rules use
`url(./fonts/...)` paths relative to the file, and Tailwind's CSS-first pipeline does not rebase them. Add it to the
`styles` array of `angular.json` instead:

```json
"styles": ["src/styles.css", "node_modules/@joanroucoux/cairn-ui/styles/fonts.css"]
```

An application that does not use Tailwind can import `@joanroucoux/cairn-ui/styles/tokens.css` alone: it is a pure
token sheet.

## Usage

The package root exports nothing. Each component folder is its own entry point, so your bundler only ships what you
import:

```ts
import { Component } from '@angular/core';

import { UiBadge } from '@joanroucoux/cairn-ui/badge';
import { UiButton } from '@joanroucoux/cairn-ui/button';

@Component({
  selector: 'app-example',
  imports: [UiButton, UiBadge],
  template: `
    <ui-badge>Synced</ui-badge>
    <button ui-button>Save</button>
  `,
})
export class Example {}
```

## More

- [Repository README](https://github.com/JoanRoucoux/cairn-ui#readme): the component list, design principles and development guide
- [Changelog](https://github.com/JoanRoucoux/cairn-ui/blob/main/projects/ui/CHANGELOG.md)

MIT licensed.
