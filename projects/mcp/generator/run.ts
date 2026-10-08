import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { generateManifest } from './generate.ts';

export const STORYBOOK_URL = 'https://joanroucoux.github.io/cairn-ui/';

/**
 * `generate-manifest --out <file>`: writes the manifest of the library under `root`, or lists its
 * problems on stderr and returns a failing exit code without writing anything.
 */
export function run(args: string[], root: string): number {
  const { values } = parseArgs({ args, options: { out: { type: 'string' } } });

  if (!values.out) {
    process.stderr.write('Usage: generate-manifest --out <file>\n');

    return 2;
  }

  const { manifest, problems } = generateManifest({ uiRoot: join(root, 'projects/ui'), storybookUrl: STORYBOOK_URL });

  if (problems.length) {
    process.stderr.write(`The MCP manifest is incomplete:\n${problems.map((problem) => `  - ${problem}\n`).join('')}`);

    return 1;
  }

  const out = resolve(root, values.out);

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`Wrote ${values.out}: ${manifest.entries.length} entries, ${manifest.tokens.length} tokens.\n`);

  return 0;
}
