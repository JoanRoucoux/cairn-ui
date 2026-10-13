import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const dist = `${root}dist/mcp/`;
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');

rmSync(dist, { recursive: true, force: true });
execFileSync(process.execPath, [tsc, '-p', `${root}projects/mcp/tsconfig.build.json`], { stdio: 'inherit' });
mkdirSync(`${dist}manifest`, { recursive: true });
cpSync(`${root}dist/ui/mcp-manifest.json`, `${dist}manifest/mcp-manifest.json`);

for (const file of ['projects/mcp/package.json', 'projects/mcp/README.md', 'projects/mcp/CHANGELOG.md', 'LICENSE']) {
  cpSync(`${root}${file}`, `${dist}${file.split('/').pop()}`);
}
