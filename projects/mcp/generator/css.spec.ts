import { describe, expect, it } from 'vitest';

import { readTokens } from './css.ts';

const THEME = `
@theme {
  --text-*: initial;
  --text-label: 0.875rem;
  --text-label--line-height: 1.25rem;
  --radius-control: 0.5rem;
  --font-sans: 'Rubik', sans-serif;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --animate-spin: spin 1s linear infinite;
}
@utility other { color: red; }
`;

describe('readTokens', () => {
  it('reads a light-dark() pair as two values and a plain value as one', () => {
    const tokens = readTokens(
      `:root {
        color-scheme: light dark;
        /* a comment; with a semicolon */
        --primary: light-dark(#161918, rgb(242 244 243 / 0.1));
        --gutter: 1rem;
      }`,
      '',
    );

    expect(tokens).toEqual([
      { name: '--primary', group: 'color', light: '#161918', dark: 'rgb(242 244 243 / 0.1)', overrides: [] },
      { name: '--gutter', group: 'layout', value: '1rem', overrides: [] },
    ]);
  });

  it('collects the values a media query swaps in, ignoring tokens it does not know and other selectors', () => {
    const tokens = readTokens(
      `@import 'x.css';
      :root { --gutter: 1rem; }
      @media (min-width: 64rem) {
        :root { --gutter: 2rem; --unknown: 1px; }
        .other { --gutter: 3rem; }
      }
      :root[data-theme='dark'] { color-scheme: dark; --gutter: 9rem; }`,
      '',
    );

    expect(tokens).toEqual([
      { name: '--gutter', group: 'layout', value: '1rem', overrides: [{ media: '(min-width: 64rem)', value: '2rem' }] },
    ]);
  });

  it('keeps quoted values whole, separators included', () => {
    const [token] = readTokens(`:root { --icon: url("data:image/svg+xml,a;b{c}"); }`, '');

    expect(token).toEqual({ name: '--icon', group: 'asset', value: 'url("data:image/svg+xml,a;b{c}")', overrides: [] });
  });

  it('groups tokens by what they control', () => {
    const tokens = readTokens(
      `:root {
        --text-label: 0.875rem;
        --font-sans: x;
        --tracking-display: -0.02em;
        --numeric: tabular-nums;
        --radius-pill: 9999px;
        --duration-fast: 180ms;
        --ease-sheet: x;
        --press-scale: 0.97;
        --toast-duration: 5s;
        --row-min: 2.75rem;
      }`,
      '',
    );

    expect(Object.fromEntries(tokens.map((token) => [token.name, token.group]))).toEqual({
      '--text-label': 'typography',
      '--font-sans': 'typography',
      '--tracking-display': 'typography',
      '--numeric': 'typography',
      '--radius-pill': 'radius',
      '--duration-fast': 'motion',
      '--ease-sheet': 'motion',
      '--press-scale': 'motion',
      '--toast-duration': 'motion',
      '--row-min': 'layout',
    });
  });

  it('names the Tailwind utility theme.css generates from a token', () => {
    const tokens = readTokens(
      `:root {
        --text-label: 0.875rem;
        --text-label--line-height: 1.25rem;
        --radius-control: 0.5rem;
        --font-sans: x;
        --ease-out: x;
        --gutter: 1rem;
      }`,
      THEME,
    );

    expect(Object.fromEntries(tokens.map((token) => [token.name, token.utility]))).toEqual({
      '--text-label': 'text-label',
      '--text-label--line-height': undefined,
      '--radius-control': 'rounded-control',
      '--font-sans': 'font-sans',
      '--ease-out': 'ease-out',
      '--gutter': undefined,
    });
  });
});
