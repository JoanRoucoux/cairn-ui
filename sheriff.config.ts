import type { SheriffConfig } from '@softarc/sheriff-core';

// Sheriff has no test-only lens: a grant added so a spec or story can render a sibling component
// also opens the production import surface.
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
    'component:drawer': ['component:button', 'component:dialog'],
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
    'component:toast': ['component:action-bar', 'component:button', 'component:dialog', 'component:tab-bar'],
    'component:line-chart': ['component:motion'],
  },
};
