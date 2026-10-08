#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { loadManifest } from './load.ts';
import { createServer } from './server.ts';

// stdout carries the protocol: everything else goes to stderr.
const { values } = parseArgs({ options: { manifest: { type: 'string' } } });
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

try {
  const source = loadManifest({
    cwd: process.cwd(),
    explicit: values.manifest,
    bundled: fileURLToPath(new URL('../manifest/mcp-manifest.json', import.meta.url)),
  });

  for (const warning of source.warnings) {
    process.stderr.write(`cairn-ui-mcp: ${warning}\n`);
  }

  await createServer(source, version).connect(new StdioServerTransport());
} catch (error) {
  process.stderr.write(`cairn-ui-mcp: ${(error as Error).message}\n`);
  process.exitCode = 1;
}
