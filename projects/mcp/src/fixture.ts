import { MANIFEST_SCHEMA_VERSION, type Manifest } from './manifest.ts';

const page = (title: string, summary: string): Manifest['entries'][number]['docs'][number] => ({
  title,
  url: `https://example.test/?path=/docs/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}--docs`,
  summary,
  whenToUse: '* Always.',
  whenNotToUse: '* Never.',
  accessibility: '* Native.',
  args: [],
});

/** A small manifest that walks every branch of the server and its renderers. */
export function fixtureManifest(): Manifest {
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    package: { name: '@scope/ui', version: '1.2.3', peerDependencies: { '@angular/core': '^22.0.0' } },
    storybookUrl: 'https://example.test/',
    setup: 'Import `tokens.css`.',
    entries: [
      {
        name: 'button',
        importPath: '@scope/ui/button',
        declarations: [
          {
            kind: 'component',
            className: 'UiButton',
            selector: 'button[ui-button], a[ui-button]',
            exportAs: 'uiButton',
            description: 'Styled native button.',
            examples: ['<button ui-button>Save</button>'],
            inputs: [
              { name: 'variant', type: "'primary' | 'ghost'", required: false, default: "'primary'", twoWay: false },
              { name: 'pressed', type: 'boolean', required: false, default: 'false', twoWay: true },
              { name: 'label', type: 'string', required: true, twoWay: false, description: 'From the JSDoc.' },
            ],
            outputs: [{ name: 'activated', type: 'void', description: 'Fires on press.' }],
            slots: ['*', '[icon]'],
          },
        ],
        services: [],
        functions: [],
        constants: [{ name: 'BUTTON_VARIANTS', type: 'readonly string[]', values: ['primary', 'ghost'] }],
        types: [{ name: 'ButtonVariant', type: "'primary' | 'ghost'", description: 'The variants.' }],
        docs: [
          {
            ...page('Inputs/Button', 'Clickable element that triggers an action. It reads at a glance.'),
            args: [
              { name: 'variant', description: 'How much emphasis the action carries.' },
              { name: 'text', description: 'Projected text.' },
            ],
          },
        ],
      },
      {
        name: 'field',
        importPath: '@scope/ui/field',
        declarations: [
          {
            kind: 'component',
            className: 'UiField',
            selector: 'ui-field',
            description: 'Label around a control.',
            examples: [],
            inputs: [
              { name: 'label', type: 'string', required: true, twoWay: false },
              { name: 'size', type: "'sm' | 'md'", required: false, twoWay: false },
            ],
            outputs: [],
            slots: [],
          },
          {
            kind: 'directive',
            className: 'UiFieldLeading',
            selector: '[uiFieldLeading]',
            description: 'Leading icon.',
            examples: [],
            inputs: [{ name: 'size', type: "'sm' | 'md'", required: false, twoWay: false }],
            outputs: [],
            slots: [],
          },
        ],
        services: [],
        functions: [],
        constants: [{ name: 'UI_FIELD', type: 'InjectionToken<string>' }],
        types: [],
        docs: [
          {
            ...page('Inputs/Field', 'Label, hint and error around a control.'),
            args: [
              { name: 'label', description: 'The visible label.' },
              { name: 'size', description: 'Shared by both, so it stays apart.' },
            ],
          },
          page('Inputs/Field leading', 'A leading icon.'),
        ],
      },
      {
        name: 'toast',
        importPath: '@scope/ui/toast',
        declarations: [],
        services: [
          {
            className: 'UiToasts',
            providedIn: 'root',
            description: 'Message queue. Second sentence.',
            examples: ["inject(UiToasts).show('Saved');"],
            members: [
              { name: 'show', signature: 'show(message: string): void', description: 'Shows a message.' },
              { name: 'toast', signature: 'toast: Signal<Toast | null>' },
            ],
          },
          { className: 'UiLocalToasts', description: 'Scoped queue.', examples: [], members: [] },
        ],
        functions: [
          {
            name: 'formatToast',
            signature: 'formatToast(text: string): string',
            description: 'Formats a message.',
            examples: ["formatToast('Saved');"],
          },
          { name: 'clearToasts', signature: 'clearToasts(): void', description: 'Clears them.', examples: [] },
        ],
        constants: [],
        types: [],
        docs: [],
      },
      {
        name: 'control',
        importPath: '@scope/ui/control',
        declarations: [],
        services: [],
        functions: [],
        constants: [],
        types: [{ name: 'UiControl', type: '{ readonly touched: Signal<boolean>; }' }],
        docs: [],
      },
    ],
    tokens: [
      { name: '--primary', group: 'color', light: '#161918', dark: '#f2f4f3', overrides: [], role: 'Primary actions' },
      {
        name: '--gutter',
        group: 'layout',
        value: '1rem',
        overrides: [{ media: '(min-width: 64rem)', value: '2rem' }],
      },
      { name: '--text-label', group: 'typography', value: '0.875rem', overrides: [], utility: 'text-label' },
    ],
    foundations: [
      {
        slug: 'colors',
        title: 'Colors',
        url: 'https://example.test/?path=/docs/foundations-colors--docs',
        content: '# Colors\n\nCairn is monochrome. Green means a gain.',
      },
    ],
  };
}
