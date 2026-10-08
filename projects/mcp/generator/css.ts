import type { Token, TokenGroup } from '../src/manifest.ts';

type Block = { prelude: string; body: string };

/**
 * Reads the custom properties of `tokens.css`: the `:root` defaults, their `light-dark()` pair, the
 * values a media query swaps in, and the Tailwind utility `theme.css` derives from each.
 *
 * `:root[data-theme=...]` blocks only pin `color-scheme`, so they add nothing a token reader needs.
 */
export function readTokens(tokensCss: string, themeCss: string): Token[] {
  const tokens = new Map<string, Token>();
  const utilities = themeUtilities(themeCss);

  for (const block of blocks(stripComments(tokensCss))) {
    if (block.prelude === ':root') {
      for (const [name, value] of declarations(block.body)) {
        tokens.set(name, { ...tokens.get(name), ...describe(name, value, utilities.get(name)) });
      }
    } else if (block.prelude.startsWith('@media')) {
      const media = block.prelude.slice('@media'.length).trim();

      for (const inner of blocks(block.body).filter((candidate) => candidate.prelude === ':root')) {
        for (const [name, value] of declarations(inner.body)) {
          tokens.get(name)?.overrides.push({ media, value });
        }
      }
    }
  }

  return [...tokens.values()];
}

function describe(name: string, value: string, utility: string | undefined): Token {
  const pair = /^light-dark\((.+)\)$/.exec(value)?.[1];
  const [light, dark] = pair ? splitTopLevel(pair, ',') : [];

  return {
    name,
    group: groupOf(name, value),
    ...(light !== undefined && dark !== undefined ? { light, dark } : { value }),
    overrides: [],
    ...(utility ? { utility } : {}),
  };
}

function groupOf(name: string, value: string): TokenGroup {
  if (value.startsWith('url(')) {
    return 'asset';
  }

  if (value.startsWith('light-dark(')) {
    return 'color';
  }

  if (/^--(text|font|tracking|numeric)/.test(name)) {
    return 'typography';
  }

  if (name.startsWith('--radius-')) {
    return 'radius';
  }

  if (/^--(duration|ease)-|-(scale|duration)$/.test(name)) {
    return 'motion';
  }

  return 'layout';
}

const UTILITY_PREFIXES: Record<string, string> = {
  '--text-': 'text-',
  '--radius-': 'rounded-',
  '--font-': 'font-',
  '--ease-': 'ease-',
};

/** Maps each token `theme.css` registers in `@theme` to the utility class Tailwind generates from it. */
function themeUtilities(themeCss: string): Map<string, string> {
  const utilities = new Map<string, string>();

  for (const block of blocks(stripComments(themeCss)).filter((candidate) => candidate.prelude === '@theme')) {
    for (const [name] of declarations(block.body)) {
      const prefix = Object.keys(UTILITY_PREFIXES).find((candidate) => name.startsWith(candidate));

      if (prefix && !name.includes('--', 2)) {
        utilities.set(name, `${UTILITY_PREFIXES[prefix]}${name.slice(prefix.length)}`);
      }
    }
  }

  return utilities;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Top-level `prelude { body }` blocks of a stylesheet or of a block body. */
function blocks(css: string): Block[] {
  const result: Block[] = [];
  let depth = 0;
  let start = 0;
  let open = 0;
  let quote = '';

  for (let index = 0; index < css.length; index++) {
    const char = css[index] as string;

    if (quote) {
      quote = char === quote ? '' : quote;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '{') {
      if (depth++ === 0) {
        open = index;
      }
    } else if (char === '}' && --depth === 0) {
      result.push({ prelude: css.slice(start, open).trim(), body: css.slice(open + 1, index) });
      start = index + 1;
    } else if (char === ';' && depth === 0) {
      start = index + 1;
    }
  }

  return result;
}

/** Custom property declarations of a block body. */
function declarations(body: string): [string, string][] {
  return splitTopLevel(body, ';')
    .map((declaration) => /^(--[\w-]+)\s*:\s*([\s\S]+)$/.exec(declaration))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => [match[1] as string, (match[2] as string).replace(/\s+/g, ' ').trim()]);
}

/** Splits on a separator outside quotes and parentheses, trimming each part. */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let current = '';

  for (const char of text) {
    if (quote) {
      quote = char === quote ? '' : quote;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth--;
    } else if (char === separator && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  return [...parts, current.trim()].filter(Boolean);
}
