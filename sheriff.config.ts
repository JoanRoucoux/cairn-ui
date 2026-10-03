import type { SheriffConfig } from '@softarc/sheriff-core';

/**
 * Enforces the design-system boundaries: each component folder is an isolated
 * module, and components must not import each other — shared building blocks
 * belong in their own module (e.g. a future `internal/` utilities module).
 * There are two kinds of exceptions: shared classes and test-only grants. `select` reuses `input`'s shared control classes
 * (`CONTROL_BASE_CLASSES`, `CONTROL_SIZE_CLASSES`, `ControlSize`) rather than
 * duplicating them, and `choice-chips` reuses its surface classes (`CONTROL_SURFACE_CLASSES`,
 * `ControlSurface`) for the same reason. `field`, `dialog`, `empty`, `menu`, `motion`, `row`, `stat` and
 * `toast` grant access only because their spec/story files need to render a sibling component
 * (`input`/`select`, `button`, `row`, `table`, `tab-bar`, `action-bar` and `delta`, and for `motion` also
 * `async`, `back-link`, `nav-item`, `segmented` and `switch`) for testing. `line-chart` -> `motion` and the
 * components that hold their transitions until rendered (`async`, `back-link`, `button`, `nav-item`, `row`,
 * `segmented`, `switch`, `table`) -> `motion` are no exception: `motion` is a shared building block
 * (`injectReducedMotion`, `holdTransitionsUntilRendered`). Sheriff has no test-only lens, so
 * those grants technically widen the production import surface too, even
 * though nothing in production code currently uses them that way.
 *
 * Each module has an index.ts that is its ng-packagr entry point (`@joanroucoux/cairn-ui/<component>`);
 * files a module wants to keep private go in an `internal/` subdirectory.
 * `projects/ui/src/public-api.ts` is the primary entry, exports nothing and belongs to the root scope.
 * Cross-module imports use the package path, resolved through tsconfig `paths`.
 *
 * `component:control` holds the token and the error shape the three control modules and `field`
 * share; it is the "shared building block gets its own module" case this comment already
 * anticipated.
 */
export const config: SheriffConfig = {
  entryFile: 'projects/ui/src/public-api.ts',
  enableBarrelLess: true,
  modules: {
    'projects/ui/<component>': 'component:<component>',
  },
  depRules: {
    root: ['component:*'],
    'component:*': [],
    'component:input': ['component:control'],
    'component:choice-chips': ['component:input', 'component:control'],
    'component:select': ['component:input', 'component:control'],
    'component:field': ['component:input', 'component:select', 'component:control'],
    'component:action-bar': ['component:button', 'component:tab-bar'],
    'component:async': ['component:motion'],
    'component:back-link': ['component:motion'],
    'component:button': ['component:motion'],
    'component:nav-item': ['component:motion'],
    'component:segmented': ['component:motion'],
    'component:switch': ['component:motion'],
    'component:table': ['component:motion'],
    'component:empty': ['component:button'],
    'component:fact': ['component:card'],
    'component:dialog': ['component:button'],
    'component:menu': ['component:button'],
    'component:motion': [
      'component:async',
      'component:back-link',
      'component:button',
      'component:nav-item',
      'component:row',
      'component:segmented',
      'component:switch',
      'component:table',
    ],
    'component:row': ['component:button', 'component:motion'],
    'component:stat': ['component:delta'],
    'component:toast': ['component:action-bar', 'component:button', 'component:tab-bar'],
    'component:line-chart': ['component:motion'],
  },
};
