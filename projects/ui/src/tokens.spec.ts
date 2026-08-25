import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const testPath = expect.getState().testPath ?? '';
const tokens = readFileSync(join(dirname(testPath), '..', 'styles', 'tokens.css'), 'utf8');

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
  ])('declares %s', (token) => {
    expect(tokens).toContain(`${token}:`);
  });

  it('declares every token with a light and a dark value', () => {
    const declarations = tokens.match(/^\s+--[a-z0-9-]+:.*$/gm) ?? [];
    const withoutLightDark = declarations.filter((line) => !line.includes('light-dark('));

    expect(withoutLightDark).toEqual([]);
  });

  it('stays a pure token sheet', () => {
    expect(tokens).not.toMatch(/^\s*(body|h1|p|\*)\s*\{/m);
  });
});
