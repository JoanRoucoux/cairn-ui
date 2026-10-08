import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import type { Report } from './report.ts';

/** The folder virtual files live in: inside the repository, so `@angular/core` resolves from its node_modules. */
export const VIRTUAL_ROOT = fileURLToPath(new URL('./__virtual__/', import.meta.url));

/** A program over in-memory files, typed against the real `@angular/core`. */
export function virtualProgram(files: Record<string, string>): ts.Program {
  const options: ts.CompilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.Preserve,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    experimentalDecorators: true,
    skipLibCheck: true,
    noEmit: true,
  };
  const virtual = new Map(Object.entries(files).map(([name, text]) => [join(VIRTUAL_ROOT, name), text]));
  const host = ts.createCompilerHost(options);
  const { fileExists, directoryExists, readFile, getSourceFile } = host;

  host.fileExists = (file) => virtual.has(file) || fileExists(file);
  host.directoryExists = (directory) => `${directory}/` === VIRTUAL_ROOT || !!directoryExists?.(directory);
  host.readFile = (file) => virtual.get(file) ?? readFile(file);
  host.getSourceFile = (file, language, ...rest) => {
    const text = virtual.get(file);

    return text === undefined
      ? getSourceFile(file, language, ...rest)
      : ts.createSourceFile(file, text, language, true);
  };

  return ts.createProgram({ rootNames: [...virtual.keys()], options, host });
}

/** Writes files under a fresh temporary folder and returns its path. */
export function temporaryTree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'cairn-mcp-'));

  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, name)), { recursive: true });
    writeFileSync(join(root, name), text);
  }

  return root;
}

/** A `Report` that collects `file: message` lines. */
export function collector(): { report: Report; problems: string[] } {
  const problems: string[] = [];

  return { report: (file, message) => problems.push(`${file}: ${message}`), problems };
}
