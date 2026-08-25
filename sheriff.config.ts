import type { SheriffConfig } from '@softarc/sheriff-core';

/**
 * Enforces the design-system boundaries: each component folder is an isolated
 * module, and components must not import each other — shared building blocks
 * belong in their own module (e.g. a future `internal/` utilities module).
 *
 * Modules are barrel-less: files are importable directly (no index.ts needed);
 * put files a module wants to keep private in an `internal/` subdirectory.
 * `public-api.ts` is the ng-packagr entry point and belongs to the root scope.
 */
export const config: SheriffConfig = {
  entryFile: 'projects/ui/src/public-api.ts',
  enableBarrelLess: true,
  modules: {
    'projects/ui/src/lib/<component>': 'component:<component>',
  },
  depRules: {
    root: ['component:*'],
    'component:*': [],
  },
};
