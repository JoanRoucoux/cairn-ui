import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

import { MANIFEST_SCHEMA_VERSION } from '../src/manifest.ts';
import { type GenerateResult, generateManifest } from './generate.ts';
import { temporaryTree } from './testing.ts';

const UI_ROOT = fileURLToPath(new URL('../../ui/', import.meta.url));
const URL_BASE = 'https://example.test/';

/** `projects/ui/docs/colors.mdx: message` as `colors.mdx: message`. */
const short = (problem: string): string => {
  const [file = '', ...message] = problem.split(': ');

  return `${basename(file)}: ${message.join(': ')}`;
};

describe('generateManifest on projects/ui', () => {
  let result: GenerateResult;

  beforeAll(() => {
    result = generateManifest({ uiRoot: UI_ROOT, storybookUrl: URL_BASE });
  });

  it('finds nothing missing', () => {
    expect(result.problems).toEqual([]);
  });

  it('describes the package and every entry point', () => {
    const { manifest } = result;

    expect(manifest.schemaVersion).toBe(MANIFEST_SCHEMA_VERSION);
    expect(manifest.package.name).toBe('@joanroucoux/cairn-ui');
    expect(manifest.package.peerDependencies['@angular/core']).toBeDefined();
    expect(manifest.entries.map((entry) => entry.name)).toContain('button');

    for (const entry of manifest.entries) {
      expect(entry.importPath).toBe(`@joanroucoux/cairn-ui/${entry.name}`);
    }
  });

  it('documents the button the way the Docs page does', () => {
    const button = result.manifest.entries.find((entry) => entry.name === 'button');
    const [declaration] = button?.declarations ?? [];

    expect(declaration?.selector).toBe('button[ui-button], a[ui-button]');
    expect(declaration?.inputs.find((input) => input.name === 'variant')).toMatchObject({
      type: expect.stringMatching(/^'primary' \| 'outline' \| /),
      default: "'primary'",
    });
    expect(button?.docs[0]?.url).toBe(`${URL_BASE}?path=/docs/inputs-button--docs`);
    expect(button?.docs[0]?.accessibility).not.toBe('');
  });

  it('gives every color token its two values and the semantic ones their role', () => {
    const positive = result.manifest.tokens.find((token) => token.name === '--positive');

    expect(positive).toMatchObject({
      group: 'color',
      light: expect.any(String),
      dark: expect.any(String),
      role: 'Gain',
    });
  });

  it('carries the Setup section and the Foundations pages, Overview first', () => {
    expect(result.manifest.setup).toContain("@source '../node_modules/@joanroucoux/cairn-ui'");
    expect(result.manifest.foundations[0]?.slug).toBe('overview');
    expect(result.manifest.foundations.map((page) => page.slug)).toContain('colors');
  });
});

describe('generateManifest on an incomplete library', () => {
  it('lists what is missing', () => {
    const uiRoot = temporaryTree({
      'package.json': JSON.stringify({ name: '@scope/ui', version: '1.0.0' }),
      'tsconfig.lib.json': JSON.stringify({ compilerOptions: { experimentalDecorators: true }, include: ['**/*.ts'] }),
      'README.md': '# UI',
      'styles/tokens.css': ':root { --background: light-dark(#fff, #000); }',
      'styles/theme.css': '',
      'docs/colors.mdx': '# Colors',
      'docs/untitled.mdx': '# Untitled',
      'docs/overview.mdx': '<Meta title="Foundations/Overview" />\n\n# Overview',
      'card/ng-package.json': '{}',
      'card/index.ts': `
        /**
         * A card.
         *
         * @example
         * <ui-card></ui-card>
         */
        @Component({ selector: 'ui-card' })
        export class UiCard {}
      `,
      'helpers/ng-package.json': '{}',
      'helpers/index.ts': 'export const HELPERS = 1;',
      'not-an-entry/index.ts': 'export const NOTHING = 1;',
    });

    const { manifest, problems } = generateManifest({ uiRoot, storybookUrl: URL_BASE });

    expect(manifest.package.peerDependencies).toEqual({});
    expect(manifest.entries.map((entry) => entry.name)).toEqual(['card', 'helpers']);
    expect(manifest.foundations.map((page) => page.slug)).toEqual(['overview']);
    expect(problems.map(short)).toEqual([
      'card: exports a component or directive but has no stories file to document it',
      'colors.mdx: has no `export const tokens = [...]` of token roles',
      'README.md: has no "## Setup" section',
      'colors.mdx: has no <Meta title="..." />',
      'untitled.mdx: has no <Meta title="..." />',
    ]);
  });

  it('reports a role given to a token the sheet does not declare', () => {
    const uiRoot = temporaryTree({
      'package.json': JSON.stringify({ name: '@scope/ui', version: '1.0.0', peerDependencies: { a: '1' } }),
      'tsconfig.lib.json': JSON.stringify({ include: ['**/*.ts'] }),
      'README.md': '# UI\n\n## Setup\n\nImport it.',
      'styles/tokens.css': ':root { --background: light-dark(#fff, #000); }',
      'styles/theme.css': '',
      'docs/colors.mdx':
        "export const tokens = [\n  ['background', 'Page'],\n  ['ghost', 'Gone'],\n  ['background'],\n];",
      'button/ng-package.json': '{}',
      'button/index.ts': 'export {};',
      'button/button.stories.ts': "export default { title: 'Inputs/Button' };",
    });

    const { manifest, problems } = generateManifest({ uiRoot, storybookUrl: URL_BASE });

    expect(manifest.tokens[0]?.role).toBe('Page');
    expect(manifest.setup).toBe('Import it.');
    expect(problems.map(short)).toEqual([
      'index.ts: is missing or exports nothing',
      'button.stories.ts: has no static parameters.docs.description.component',
      'colors.mdx: describes --ghost, which tokens.css does not declare',
      'colors.mdx: gives --background no role',
      'colors.mdx: has no <Meta title="..." />',
    ]);
  });

  it('throws on a tsconfig it cannot read', () => {
    const uiRoot = temporaryTree({ 'package.json': '{}' });

    expect(() => generateManifest({ uiRoot, storybookUrl: URL_BASE })).toThrow();
  });
});
