import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Manifest } from '../src/manifest.ts';
import { STORYBOOK_URL, run } from './run.ts';
import { temporaryTree } from './testing.ts';

const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

describe('run', () => {
  let stdout: string[];
  let stderr: string[];

  beforeEach(() => {
    stdout = [];
    stderr = [];
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => stdout.push(String(chunk)) > 0);
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => stderr.push(String(chunk)) > 0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks for --out', () => {
    expect(run([], REPO_ROOT)).toBe(2);
    expect(stderr.join('')).toContain('Usage: generate-manifest --out <file>');
  });

  it('writes the manifest of the library', () => {
    const out = join(temporaryTree({}), 'nested', 'mcp-manifest.json');

    expect(run(['--out', out], REPO_ROOT)).toBe(0);

    const manifest = JSON.parse(readFileSync(out, 'utf8')) as Manifest;

    expect(manifest.storybookUrl).toBe(STORYBOOK_URL);
    expect(stdout.join('')).toMatch(/^Wrote .*mcp-manifest\.json: \d+ entries, \d+ tokens\.\n$/);
  });

  it('writes nothing and lists the problems of an incomplete library', () => {
    const root = temporaryTree({
      'projects/ui/package.json': JSON.stringify({ name: '@scope/ui', version: '1.0.0' }),
      'projects/ui/tsconfig.lib.json': JSON.stringify({ include: ['**/*.ts'] }),
      'projects/ui/README.md': '# UI',
      'projects/ui/styles/tokens.css': '',
      'projects/ui/styles/theme.css': '',
      'projects/ui/docs/colors.mdx': '',
    });

    expect(run(['--out', 'manifest.json'], root)).toBe(1);
    expect(stderr.join('')).toContain('The MCP manifest is incomplete:\n  - ');
    expect(stdout).toEqual([]);
  });
});
