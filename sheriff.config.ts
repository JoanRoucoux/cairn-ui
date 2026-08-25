import type { SheriffConfig } from '@softarc/sheriff-core';

/**
 * Enforces the design-system boundaries: each component folder is an isolated
 * module, and components must not import each other — shared building blocks
 * belong in their own module (e.g. a future `internal/` utilities module).
 * The one exception is `select`, which reuses `input`'s shared control classes
 * (`CONTROL_BASE_CLASSES`, `CONTROL_SIZE_CLASSES`, `ControlSize`) rather than
 * duplicating them. `field` projects an unrelated native control and needs
 * `input`/`select` only to render one in its own tests and story. `dialog`
 * needs `button` only to render one in its own story.
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
    'component:select': ['component:input'],
    'component:field': ['component:input', 'component:select'],
    'component:dialog': ['component:button'],
  },
};
