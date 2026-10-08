import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

import { type Entry, type Foundation, MANIFEST_SCHEMA_VERSION, type Manifest, type Token } from '../src/manifest.ts';
import { readTokens } from './css.ts';
import { readEntryExports } from './declarations.ts';
import { docsUrl, extractSection } from './markdown.ts';
import { mdxToMarkdown, readExportedTuples } from './mdx.ts';
import type { Report } from './report.ts';
import { readDocsPage } from './stories.ts';

export type GenerateOptions = {
  /** The library folder, `projects/ui`. */
  uiRoot: string;
  /** The deployed Storybook, with a trailing slash. */
  storybookUrl: string;
};

type PackageJson = { name: string; version: string; peerDependencies?: Record<string, string> };

export type GenerateResult = {
  manifest: Manifest;
  /** One line per problem; the manifest must not be shipped unless this is empty. */
  problems: string[];
};

/** Reads `projects/ui` and describes it as a manifest, listing what keeps it from being complete. */
export function generateManifest({ uiRoot, storybookUrl }: GenerateOptions): GenerateResult {
  const problems: string[] = [];
  const report: Report = (file, message) => problems.push(`${relative(process.cwd(), file)}: ${message}`);
  const read = (path: string): string => readFileSync(join(uiRoot, path), 'utf8');
  const pkg = JSON.parse(read('package.json')) as PackageJson;
  const program = createProgram(join(uiRoot, 'tsconfig.lib.json'));
  const entries = entryFolders(uiRoot).map((name) =>
    readEntry(program, uiRoot, name, `${pkg.name}/${name}`, storybookUrl, report),
  );
  const tokens = readTokens(read('styles/tokens.css'), read('styles/theme.css'));

  applyRoles(tokens, join(uiRoot, 'docs/colors.mdx'), report);

  const setup = extractSection(read('README.md'), 'Setup');

  if (!setup) {
    report(join(uiRoot, 'README.md'), 'has no "## Setup" section');
  }

  return {
    manifest: {
      schemaVersion: MANIFEST_SCHEMA_VERSION,
      package: { name: pkg.name, version: pkg.version, peerDependencies: pkg.peerDependencies ?? {} },
      storybookUrl,
      setup: setup ?? '',
      entries,
      tokens,
      foundations: readFoundations(uiRoot, storybookUrl, report),
    },
    problems,
  };
}

/** Gives each token the role the Colors page lists for it, in its `tokens` array. */
function applyRoles(tokens: Token[], colorsPage: string, report: Report): void {
  const roles = readExportedTuples(readFileSync(colorsPage, 'utf8'), 'tokens');

  if (!roles) {
    report(colorsPage, 'has no `export const tokens = [...]` of token roles');
  }

  for (const [name, role] of roles ?? []) {
    const token = tokens.find((candidate) => candidate.name === `--${name}`);

    if (!token) {
      report(colorsPage, `describes --${name}, which tokens.css does not declare`);
    } else if (!role) {
      report(colorsPage, `gives --${name} no role`);
    } else {
      token.role = role;
    }
  }
}

/** Every folder holding an `ng-package.json`, that is every secondary entry point. */
function entryFolders(uiRoot: string): string[] {
  return readdirSync(uiRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(uiRoot, entry.name, 'ng-package.json')))
    .map((entry) => entry.name)
    .sort();
}

function readEntry(
  program: ts.Program,
  uiRoot: string,
  name: string,
  importPath: string,
  storybookUrl: string,
  report: Report,
): Entry {
  const folder = join(uiRoot, name);
  const exports = readEntryExports(program, join(folder, 'index.ts'), report);
  const docs = readdirSync(folder)
    .filter((file) => file.endsWith('.stories.ts'))
    .sort()
    .flatMap((file) => {
      const path = join(folder, file);
      const page = readDocsPage(path, readFileSync(path, 'utf8'), storybookUrl, report);

      return page ? [page] : [];
    });

  if (exports.declarations.length && !docs.length) {
    report(folder, 'exports a component or directive but has no stories file to document it');
  }

  return { name, importPath, ...exports, docs };
}

/** The Foundations MDX pages, Overview first as in the Storybook sidebar. */
function readFoundations(uiRoot: string, storybookUrl: string, report: Report): Foundation[] {
  const folder = join(uiRoot, 'docs');
  const files = readdirSync(folder)
    .filter((file) => file.endsWith('.mdx'))
    .sort((a, b) => Number(b === 'overview.mdx') - Number(a === 'overview.mdx') || a.localeCompare(b));

  return files.flatMap((file) => {
    const { title, content } = mdxToMarkdown(readFileSync(join(folder, file), 'utf8'), storybookUrl);

    if (!title) {
      report(join(folder, file), 'has no <Meta title="..." />');

      return [];
    }

    const name = title.split('/').pop() as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return [{ slug, title: name, url: docsUrl(storybookUrl, title), content }];
  });
}

function createProgram(tsconfig: string): ts.Program {
  const config = ts.getParsedCommandLineOfConfigFile(
    tsconfig,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      },
    },
  ) as ts.ParsedCommandLine;

  return ts.createProgram({ rootNames: config.fileNames, options: config.options });
}
