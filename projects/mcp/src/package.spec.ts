import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type PackageJson = { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

const read = (path: string): PackageJson =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as PackageJson;

describe('projects/mcp/package.json', () => {
  it('publishes the dependency versions the repository installs and tests against', () => {
    const root = read('../../../package.json');
    const server = read('../package.json');
    const installed = { ...root.dependencies, ...root.devDependencies };

    for (const [name, version] of Object.entries(server.dependencies ?? {})) {
      expect({ name, version }).toEqual({ name, version: installed[name] });
    }
  });
});
