import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const testPath = expect.getState().testPath ?? '';
const stylesDir = join(dirname(testPath), '..', 'styles');
const tokens = readFileSync(join(stylesDir, 'tokens.css'), 'utf8');
const theme = readFileSync(join(stylesDir, 'theme.css'), 'utf8');

/**
 * theme.css names its letter-spacing keys after the utility they feed (`--text-caption--letter-spacing`,
 * `--text-heading--letter-spacing`, `--text-display--letter-spacing`); tokens.css names the same two
 * values once, as `--tracking-caption` and `--tracking-display`.
 */
const THEME_TO_TOKEN_ALIASES: Record<string, string> = {
  '--text-caption--letter-spacing': '--tracking-caption',
  '--text-heading--letter-spacing': '--tracking-display',
  '--text-display--letter-spacing': '--tracking-display',
};

const parseDeclarations = (css: string): Map<string, string> => {
  const declarations = new Map<string, string>();

  for (const [, name, value] of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    declarations.set(`--${name}`, value!.trim());
  }

  return declarations;
};

describe('design tokens', () => {
  it.each([
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--elevated',
    '--border',
    '--hairline',
    '--muted',
    '--muted-foreground',
    '--subtle-foreground',
    '--primary',
    '--primary-to',
    '--primary-foreground',
    '--soft',
    '--glow',
    '--ring',
    '--positive',
    '--negative',
    '--stale',
    '--ramp-1',
    '--ramp-6',
    '--destructive',
    '--destructive-foreground',
    '--font-sans',
    '--numeric',
    '--text-caption',
    '--text-label',
    '--text-body',
    '--text-title',
    '--text-heading',
    '--text-display',
    '--tracking-display',
    '--tracking-caption',
    '--gutter',
    '--inset-card',
    '--stack-group',
    '--stack-section',
    '--row-min',
    '--header-height',
    '--radius-control',
    '--radius-container',
    '--radius-pill',
    '--duration-press',
    '--duration-fast',
    '--duration-base',
    '--duration-exit',
    '--ease-out',
    '--ease-sheet',
    '--press-scale',
    '--enter-scale',
    '--pulse-duration',
  ])('declares %s', (token) => {
    expect(tokens).toContain(`${token}:`);
  });

  it('declares every color token with a light and a dark value', () => {
    const colorBlock = tokens.slice(tokens.indexOf('/* Surfaces */'), tokens.indexOf('/* Type'));
    const declarations = colorBlock.match(/^\s+--[a-z0-9-]+:.*$/gm) ?? [];

    expect(declarations.length).toBeGreaterThan(20);
    expect(declarations.filter((line) => !line.includes('light-dark('))).toEqual([]);
  });

  it('neutralizes press, entry scale and pulse under reduced motion', () => {
    const reduced = tokens.slice(tokens.indexOf('prefers-reduced-motion'));

    expect(reduced).toContain('--press-scale: 1');
    expect(reduced).toContain('--enter-scale: 1');
    expect(reduced).toContain('--pulse-duration: 0ms');
  });

  it('stays a pure token sheet', () => {
    expect(tokens).not.toMatch(/^\s*(body|h1|p|\*)\s*\{/m);
  });

  /*
   * theme.css copies literal values instead of referencing tokens.css with `var()`, because
   * `@theme inline` resolves against its own reset (`--text-*: initial`) sitting earlier in the same
   * block and compiles every size to a self-reference that resolves to nothing. This test is what
   * keeps the copy from drifting: any literal in theme.css that names a token also declared in
   * tokens.css must carry the exact same value.
   */
  it('keeps every literal value in theme.css equal to its source in tokens.css', () => {
    const themeValues = parseDeclarations(theme);
    const tokenValues = parseDeclarations(tokens);
    let compared = 0;

    for (const [name, value] of themeValues) {
      const tokenName = THEME_TO_TOKEN_ALIASES[name] ?? name;
      const tokenValue = tokenValues.get(tokenName);

      if (tokenValue === undefined) {
        continue;
      }

      compared += 1;
      expect(value).toBe(tokenValue);
    }

    expect(compared).toBeGreaterThan(10);
  });
});
