import { describe, expect, it } from 'vitest';

import { fixtureManifest } from './fixture.ts';
import { search } from './lookup.ts';
import { renderEntry, renderFoundation, renderList, renderSearch, renderSetup, renderTokens } from './render.ts';

const manifest = fixtureManifest();
const [button, field, toast, control] = manifest.entries as [
  (typeof manifest.entries)[number],
  (typeof manifest.entries)[number],
  (typeof manifest.entries)[number],
  (typeof manifest.entries)[number],
];

describe('renderEntry', () => {
  it('opens with the Docs page and the import', () => {
    const text = renderEntry(button);

    expect(text).toMatch(
      /^# `@scope\/ui\/button`\n\nClickable element that triggers an action\. It reads at a glance\.\n\nDocs: https:\/\/example\.test\//,
    );
    expect(text).toContain(
      '### When to use\n\n* Always.\n\n### When not to use\n\n* Never.\n\n### Accessibility\n\n* Native.',
    );
    expect(text).toContain("```ts\nimport { UiButton } from '@scope/ui/button';\n```");
  });

  it('documents a component: selector, inputs, outputs, slots and examples', () => {
    const text = renderEntry(button);

    expect(text).toContain(
      '## UiButton (component) — `button[ui-button], a[ui-button]`\n\nStyled native button. Exported as `uiButton`.',
    );
    expect(text).toContain(
      "| `variant` | `'primary' \\| 'ghost'` | `'primary'` | How much emphasis the action carries. |",
    );
    expect(text).toContain('| `[(pressed)]` | `boolean` | `false` |  |');
    expect(text).toContain('| `label` (required) | `string` |  | From the JSDoc. |');
    expect(text).toContain('| `activated` | `void` | Fires on press. |');
    expect(text).toContain('### Content slots\n\n- Default slot\n- `[icon]`');
    expect(text).toContain('```html\n<button ui-button>Save</button>\n```');
    expect(text).toContain('| `BUTTON_VARIANTS` | "primary", "ghost" |  |');
    expect(text).toContain("| `ButtonVariant` | `'primary' \\| 'ghost'` | The variants. |");
    expect(text).toContain(
      '## Story controls\n\nControls of the Docs page; some are story-only, such as projected text.\n\n| Control | Description |\n| --- | --- |\n| `text` | Projected text. |',
    );
  });

  it('gives a control to the only declaration with that input, and keeps a shared one apart', () => {
    const text = renderEntry(field);

    expect(text).toContain('## Inputs/Field\n\nLabel, hint and error around a control.');
    expect(text).toContain('## Inputs/Field leading\n\nA leading icon.');
    expect(text).toContain('| `label` (required) | `string` |  | The visible label. |');
    expect(text).toContain("| `size` | `'sm' \\| 'md'` |  |  |");
    expect(text).toContain('| `size` | Shared by both, so it stays apart. |');
    expect(text).toContain('## UiFieldLeading (directive) — `[uiFieldLeading]`\n\nLeading icon.\n\n### Inputs');
    expect(text).toContain('| `UI_FIELD` | `InjectionToken<string>` |  |');
    expect(text).not.toContain('### Outputs');
  });

  it('documents services and functions, and an entry without a Docs page', () => {
    const text = renderEntry(toast);

    expect(text).toMatch(/^# `@scope\/ui\/toast`\n\nMessage queue\.\n\n## Import/);
    expect(text).toContain('## UiToasts (service, provided in `root`)\n\nMessage queue. Second sentence.');
    expect(text).toContain('| `show(message: string): void` | Shows a message. |');
    expect(text).toContain('| `toast: Signal<Toast \\| null>` |  |');
    expect(text).toContain("```ts\ninject(UiToasts).show('Saved');\n```");
    expect(text).toContain('## UiLocalToasts (service)\n\nScoped queue.');
    expect(text).toContain(
      "## formatToast()\n\n```ts\nformatToast(text: string): string\n```\n\nFormats a message.\n\n### Examples\n\n```ts\nformatToast('Saved');\n```",
    );
    expect(text).toContain('## clearToasts()\n\n```ts\nclearToasts(): void\n```\n\nClears them.');
  });

  it('documents an entry of types alone', () => {
    expect(renderEntry(control)).toBe(
      '# `@scope/ui/control`\n\n## Constants and types\n\n| Name | Value or type | Description |\n| --- | --- | --- |\n| `UiControl` | `{ readonly touched: Signal<boolean>; }` |  |',
    );
  });
});

describe('renderList', () => {
  it('groups entries by section, building blocks included', () => {
    expect(renderList(manifest.entries)).toBe(
      [
        '## Building blocks',
        '',
        '| Entry | Selectors | Summary |',
        '| --- | --- | --- |',
        '| `toast` |  | Message queue. |',
        '| `control` |  |  |',
        '',
        '## Inputs',
        '',
        '| Entry | Selectors | Summary |',
        '| --- | --- | --- |',
        '| `button` | `button[ui-button], a[ui-button]` | Clickable element that triggers an action. |',
        '| `field` | `ui-field`, `[uiFieldLeading]` | Label, hint and error around a control. |',
      ].join('\n'),
    );
  });
});

describe('renderTokens', () => {
  it('lists each group with values, utility, role and overrides', () => {
    const text = renderTokens(manifest.tokens);

    expect(text).toContain('## color\n\n| Token | Value (light / dark) | Utility | Role | Overrides |');
    expect(text).toContain('| `--primary` | `#161918` / `#f2f4f3` |  | Primary actions |  |');
    expect(text).toContain('| `--gutter` | `1rem` |  |  | (min-width: 64rem): 2rem |');
    expect(text).toContain('| `--text-label` | `0.875rem` | `text-label` |  |  |');
  });
});

describe('renderSetup', () => {
  it('gives the installation, the setup section and the conventions', () => {
    const text = renderSetup(manifest, 'the fixture');

    expect(text).toContain('# Setting up @scope/ui 1.2.3\n\nAnswering from the fixture.');
    expect(text).toContain('npm install @scope/ui\n```\n\nPeer dependencies: `@angular/core` ^22.0.0.');
    expect(text).toContain('## Setup\n\nImport `tokens.css`.');
    expect(text).toContain('`@scope/ui/<entry>`: the package root exports nothing.');
  });

  it('leaves out an empty list of peer dependencies', () => {
    const text = renderSetup({ ...manifest, package: { ...manifest.package, peerDependencies: {} } }, 'x');

    expect(text).not.toContain('Peer dependencies');
  });
});

describe('renderFoundation and renderSearch', () => {
  it('appends the Docs link to a page', () => {
    expect(renderFoundation(manifest.foundations[0]!)).toBe(
      '# Colors\n\nCairn is monochrome. Green means a gain.\n\nDocs: https://example.test/?path=/docs/foundations-colors--docs',
    );
  });

  it('tabulates search hits', () => {
    expect(renderSearch(search(manifest, 'gutter', 5))).toBe(
      '| Kind | Name | Summary |\n| --- | --- | --- |\n| token | `--gutter` | 1rem |',
    );
  });
});
