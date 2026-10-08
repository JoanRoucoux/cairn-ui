import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { temporaryTree } from '../generator/testing.ts';
import { fixtureManifest } from './fixture.ts';
import { loadManifest } from './load.ts';

const manifest = (version: string, schemaVersion: unknown = 1): string =>
  JSON.stringify({ ...fixtureManifest(), schemaVersion, package: { ...fixtureManifest().package, version } });

const installed = (files: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([name, text]) => [`node_modules/@joanroucoux/cairn-ui/${name}`, text]));

describe('loadManifest', () => {
  it('reads an explicit path, relative to the working directory', () => {
    const root = temporaryTree({ 'custom.json': manifest('7.0.0') });

    expect(loadManifest({ cwd: root, explicit: 'custom.json', bundled: '' })).toEqual({
      manifest: JSON.parse(manifest('7.0.0')),
      origin: join(root, 'custom.json'),
      warnings: [],
    });
  });

  it('prefers the manifest of the library installed in the project, found from a nested folder', () => {
    const root = temporaryTree({
      ...installed({ 'package.json': '{ "version": "2.0.0" }', 'mcp-manifest.json': manifest('2.0.0') }),
      'bundled.json': manifest('1.0.0'),
      'apps/web/.keep': '',
    });

    const source = loadManifest({ cwd: join(root, 'apps/web'), bundled: join(root, 'bundled.json') });

    expect(source.manifest.package.version).toBe('2.0.0');
    expect(source.origin).toBe('@joanroucoux/cairn-ui@2.0.0 installed in the project');
    expect(source.warnings).toEqual([]);
  });

  it('falls back to the bundled snapshot, and says why, when the installed library has no manifest', () => {
    const root = temporaryTree({
      ...installed({ 'package.json': '{ "version": "0.9.2" }' }),
      'bundled.json': manifest('1.0.0'),
    });

    const source = loadManifest({ cwd: root, bundled: join(root, 'bundled.json') });

    expect(source.origin).toBe('the snapshot of @joanroucoux/cairn-ui@1.0.0 bundled with the server');
    expect(source.warnings).toEqual([
      '@joanroucoux/cairn-ui@0.9.2 is installed but predates the MCP manifest: upgrade it so the answers match the version you build against.',
    ]);
  });

  it('skips an installed manifest of a newer schema than the server reads', () => {
    const root = temporaryTree({
      ...installed({ 'package.json': '{ "version": "9.0.0" }', 'mcp-manifest.json': manifest('9.0.0', 2) }),
      'bundled.json': manifest('1.0.0'),
    });

    const [warning] = loadManifest({ cwd: root, bundled: join(root, 'bundled.json') }).warnings;

    expect(warning).toMatch(
      /^Skipped the manifest of the installed @joanroucoux\/cairn-ui: .* uses manifest schema 2, this server reads 1: upgrade this server\.$/,
    );
  });

  it('asks to upgrade the library for a manifest older than the server reads', () => {
    const root = temporaryTree({ 'old.json': manifest('0.1.0', 0), 'none.json': manifest('0.1.0', 'x') });

    expect(() => loadManifest({ cwd: root, explicit: 'old.json', bundled: '' })).toThrow(
      /uses manifest schema 0, this server reads 1: upgrade @joanroucoux\/cairn-ui\.$/,
    );
    expect(() => loadManifest({ cwd: root, explicit: 'none.json', bundled: '' })).toThrow(/schema x,/);
  });

  it('fails when there is nothing to answer from', () => {
    const root = temporaryTree({});

    expect(() => loadManifest({ cwd: root, bundled: join(root, 'missing.json') })).toThrow(
      `No manifest found: @joanroucoux/cairn-ui is not installed in ${root} and ${join(root, 'missing.json')} is missing.`,
    );
  });
});
