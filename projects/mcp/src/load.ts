import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { MANIFEST_SCHEMA_VERSION, type Manifest } from './manifest.ts';

export const UI_PACKAGE = '@joanroucoux/cairn-ui';

export type ManifestSource = {
  manifest: Manifest;
  /** Where the manifest was read from, in words. */
  origin: string;
  /** Why a closer source was skipped, for stderr. */
  warnings: string[];
};

export type LoadOptions = {
  /** The project the server runs for, usually the working directory of the client. */
  cwd: string;
  /** A manifest path given on the command line, which wins over everything. */
  explicit?: string;
  /** The snapshot shipped with the server, read when the project has none. */
  bundled: string;
};

/**
 * Finds the manifest to answer from: an explicit path, else the one shipped by the copy of the
 * library installed in the project, so the answers match the version the project builds against,
 * else the snapshot bundled with the server.
 */
export function loadManifest({ cwd, explicit, bundled }: LoadOptions): ManifestSource {
  if (explicit) {
    const path = resolve(cwd, explicit);

    return { manifest: readManifest(path), origin: path, warnings: [] };
  }

  const warnings: string[] = [];
  const installed = findInstalled(cwd);

  if (installed && existsSync(join(installed.folder, 'mcp-manifest.json'))) {
    try {
      const manifest = readManifest(join(installed.folder, 'mcp-manifest.json'));

      return { manifest, origin: `${UI_PACKAGE}@${manifest.package.version} installed in the project`, warnings };
    } catch (error) {
      warnings.push(`Skipped the manifest of the installed ${UI_PACKAGE}: ${(error as Error).message}`);
    }
  } else if (installed) {
    warnings.push(
      `${UI_PACKAGE}@${installed.version} is installed but predates the MCP manifest: upgrade it so the answers match the version you build against.`,
    );
  }

  if (!existsSync(bundled)) {
    throw new Error(`No manifest found: ${UI_PACKAGE} is not installed in ${cwd} and ${bundled} is missing.`);
  }

  const manifest = readManifest(bundled);

  return {
    manifest,
    origin: `the snapshot of ${UI_PACKAGE}@${manifest.package.version} bundled with the server`,
    warnings,
  };
}

/** The nearest `node_modules/@joanroucoux/cairn-ui`, walking up from `cwd` as Node's resolution does. */
function findInstalled(cwd: string): { folder: string; version: string } | undefined {
  for (let folder = resolve(cwd); ; folder = dirname(folder)) {
    const candidate = join(folder, 'node_modules', UI_PACKAGE);

    if (existsSync(join(candidate, 'package.json'))) {
      const { version } = JSON.parse(readFileSync(join(candidate, 'package.json'), 'utf8')) as { version: string };

      return { folder: candidate, version };
    }

    if (dirname(folder) === folder) {
      return undefined;
    }
  }
}

function readManifest(path: string): Manifest {
  const manifest = JSON.parse(readFileSync(path, 'utf8')) as Partial<Manifest>;
  const version = manifest.schemaVersion;

  if (version !== MANIFEST_SCHEMA_VERSION) {
    const upgrade = typeof version === 'number' && version > MANIFEST_SCHEMA_VERSION ? 'this server' : UI_PACKAGE;

    throw new Error(
      `${path} uses manifest schema ${String(version)}, this server reads ${MANIFEST_SCHEMA_VERSION}: upgrade ${upgrade}.`,
    );
  }

  return manifest as Manifest;
}
