import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const testPath = expect.getState().testPath ?? '';
const stylesDir = join(dirname(testPath), '..', 'styles');
const tokens = readFileSync(join(stylesDir, 'tokens.css'), 'utf8');
const theme = readFileSync(join(stylesDir, 'theme.css'), 'utf8');

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

type Rgb = [number, number, number];
type Scheme = 'light' | 'dark';

const colorOf = (name: string, scheme: Scheme): string => {
  const line = tokens.split('\n').find((candidate) => candidate.trim().startsWith(`${name}:`))!;
  const pair = /light-dark\((.+)\);/.exec(line)![1]!;
  const [light, dark] = pair.split(/,\s(?=#|rgb)/);

  return (scheme === 'light' ? light : dark)!.trim();
};

const parseColor = (value: string): { rgb: Rgb; alpha: number } => {
  if (value.startsWith('#')) {
    const n = parseInt(value.slice(1), 16);

    return { rgb: [n >> 16, (n >> 8) & 255, n & 255], alpha: 1 };
  }

  const [r, g, b, a] = value.match(/[\d.]+/g)!.map(Number);

  return { rgb: [r!, g!, b!], alpha: a! };
};

const over = (top: string, ground: Rgb): Rgb => {
  const { rgb, alpha } = parseColor(top);

  return rgb.map((channel, i) => channel * alpha + ground[i]! * (1 - alpha)) as Rgb;
};

const luminance = (rgb: Rgb): number => {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;

    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};

const contrast = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi! + 0.05) / (lo! + 0.05);
};

describe('text contrast', () => {
  const TEXT = ['--foreground', '--muted-foreground', '--subtle-foreground', '--positive', '--negative', '--stale'];
  const GROUNDS = ['--background', '--card', '--elevated', '--muted'];

  it.each(['light', 'dark'] as const)('keeps every text token at 4.5:1 or more in %s', (scheme) => {
    const failures: string[] = [];

    for (const text of TEXT) {
      const foreground = parseColor(colorOf(text, scheme)).rgb;
      const grounds = new Map<string, Rgb>(GROUNDS.map((g) => [g, parseColor(colorOf(g, scheme)).rgb]));

      for (const base of ['--background', '--card']) {
        grounds.set(`--soft over ${base}`, over(colorOf('--soft', scheme), grounds.get(base)!));
      }

      for (const [ground, rgb] of grounds) {
        const ratio = contrast(foreground, rgb);

        if (ratio < 4.5) {
          failures.push(`${text} on ${ground}: ${ratio.toFixed(2)}`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it.each(['light', 'dark'] as const)('keeps the secondary text distinct from the tertiary one in %s', (scheme) => {
    expect(colorOf('--muted-foreground', scheme)).not.toBe(colorOf('--subtle-foreground', scheme));
  });
});

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
    '--duration-spin',
    '--duration-highlight',
    '--toast-duration',
    '--chevron-down',
    '--chevron-pill',
    '--chevron-pill-active',
  ])('declares %s', (token) => {
    expect(tokens).toContain(`${token}:`);
  });

  it('declares every color token with a light and a dark value', () => {
    const colorBlock = tokens.slice(tokens.indexOf('--background:'), tokens.indexOf('--font-sans:'));
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

  it('slows the spinner and shortens the highlight under reduced motion', () => {
    const reduced = tokens.slice(tokens.indexOf('prefers-reduced-motion'));

    expect(reduced).toContain('--duration-spin: 1600ms');
    expect(reduced).toContain('--duration-highlight: 600ms');
  });

  it('declares the motion durations of the handoff', () => {
    const values = parseDeclarations(tokens.slice(0, tokens.indexOf('prefers-reduced-motion')));

    expect(values.get('--duration-spin')).toBe('800ms');
    expect(values.get('--duration-highlight')).toBe('1200ms');
    expect(values.get('--toast-duration')).toBe('4000ms');
  });

  it('defaults every Tailwind transition to the Cairn curve and duration', () => {
    const values = parseDeclarations(theme);

    expect(values.get('--default-transition-timing-function')).toBe('var(--ease-out)');
    expect(values.get('--default-transition-duration')).toBe('var(--duration-fast)');
  });

  it('registers the spinner and pulse animations on the Cairn tokens', () => {
    const values = parseDeclarations(theme);

    expect(values.get('--animate-cairn-spin')).toBe('cairn-spin var(--duration-spin) linear infinite');
    expect(values.get('--animate-cairn-pulse')).toBe(
      'cairn-pulse var(--pulse-duration) var(--ease-out) infinite alternate',
    );
  });

  it('draws the chevron-down in the --muted-foreground of each scheme', () => {
    const [light, dark] = /--muted-foreground:\s*light-dark\(#([0-9a-f]{6}),\s*#([0-9a-f]{6})\)/.exec(tokens)!.slice(1);
    const chevrons = [...tokens.matchAll(/--chevron-down:\s*url\("[^"]*stroke='%23([0-9a-f]{6})'/g)].map(
      ([, color]) => color,
    );

    expect(chevrons).toEqual([light, dark, light, dark]);
  });

  it.each([
    [
      '--chevron-pill',
      /--foreground:\s*light-dark\(#([0-9a-f]{6}),\s*#([0-9a-f]{6})\)/,
      /--chevron-pill:\s*url\("[^"]*stroke='%23([0-9a-f]{6})'/g,
    ],
    [
      '--chevron-pill-active',
      /--primary-foreground:\s*light-dark\(#([0-9a-f]{6}),\s*#([0-9a-f]{6})\)/,
      /--chevron-pill-active:\s*url\("[^"]*stroke='%23([0-9a-f]{6})'/g,
    ],
  ])('draws %s in the text color of each scheme', (_token, source, chevron) => {
    const [light, dark] = source.exec(tokens)!.slice(1);
    const chevrons = [...tokens.matchAll(chevron)].map(([, color]) => color);

    expect(chevrons).toEqual([light, dark, light, dark]);
  });

  it('stays a pure token sheet', () => {
    expect(tokens).not.toMatch(/^\s*(body|h1|p|\*)\s*\{/m);
  });

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
