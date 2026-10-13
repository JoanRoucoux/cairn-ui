import { fileURLToPath } from 'node:url';

import { run } from './run.ts';

process.exitCode = run(process.argv.slice(2), fileURLToPath(new URL('../../..', import.meta.url)));
