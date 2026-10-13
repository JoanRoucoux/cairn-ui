import { describe, expect, it } from 'vitest';

import { readDocsPage } from './stories.ts';
import { collector } from './testing.ts';

const URL = 'https://example.test/';

const DESCRIPTION = `\`Clickable\` element.

#### When to use

Always.

#### When not to use

Never.

#### Accessibility

Native.`;

const story = (meta: string, exported = 'export default meta;'): string => `
import type { Meta } from '@storybook/angular-vite';

const other = { title: 'Not this one' };
const meta: Meta = ${meta};

${exported}
`;

const META = `{
  title: 'Inputs/Button',
  parameters: { docs: { description: { component: \`${DESCRIPTION.replaceAll('`', '\\`')}\` } } },
  argTypes: {
    variant: { control: 'select', description: 'How much emphasis the action carries.' },
    'aria-label': { description: 'Accessible name.' },
    onClick: { action: 'onClick', table: { disable: true } },
  },
}`;

describe('readDocsPage', () => {
  it('reads the title, the description sections and the described argTypes', () => {
    const { report, problems } = collector();

    expect(readDocsPage('button.stories.ts', story(META), URL, report)).toEqual({
      title: 'Inputs/Button',
      url: 'https://example.test/?path=/docs/inputs-button--docs',
      summary: '`Clickable` element.',
      whenToUse: 'Always.',
      whenNotToUse: 'Never.',
      accessibility: 'Native.',
      args: [
        { name: 'variant', description: 'How much emphasis the action carries.' },
        { name: 'aria-label', description: 'Accessible name.' },
      ],
    });
    expect(problems).toEqual([]);
  });

  it('reads a meta exported inline or through satisfies, and one without argTypes', () => {
    const { report } = collector();
    const inline = `export default ${META.replace(/argTypes: \{[\s\S]*?\n {2}\},/, '')} satisfies Meta;`;

    expect(readDocsPage('a.stories.ts', story('{}', inline), URL, report)?.args).toEqual([]);
    expect(readDocsPage('a.stories.ts', story(`(${META} as Meta)`), URL, report)?.args).toHaveLength(2);
  });

  it('reports a file whose default export cannot be read', () => {
    const { report, problems } = collector();

    expect(readDocsPage('a.stories.ts', 'export const meta = {};', URL, report)).toBeUndefined();
    expect(readDocsPage('b.stories.ts', story('{}', 'export default missing;'), URL, report)).toBeUndefined();
    expect(readDocsPage('c.stories.ts', story('buildMeta()'), URL, report)).toBeUndefined();
    expect(problems).toEqual([
      'a.stories.ts: has no default export the generator can read as a story meta',
      'b.stories.ts: has no default export the generator can read as a story meta',
      'c.stories.ts: has no default export the generator can read as a story meta',
    ]);
  });

  it('reports a computed title, a missing description and undescribed argTypes', () => {
    const { report, problems } = collector();
    const meta = `{
      title: TITLE,
      argTypes: { size: { control: 'select' }, ...shared, label: \`Label\` },
    }`;

    expect(readDocsPage('a.stories.ts', story(meta), URL, report)).toBeUndefined();
    expect(problems).toEqual([
      'a.stories.ts: has no static title',
      'a.stories.ts: has no static parameters.docs.description.component',
    ]);
  });

  it('reports every argType without a static description', () => {
    const { report, problems } = collector();
    const meta = META.replace(
      "'aria-label': { description: 'Accessible name.' },",
      "size: { control: 'select' }, ...shared, label: `Label`, hidden: { table: { disable: false } },",
    );

    readDocsPage('a.stories.ts', story(meta), URL, report);

    expect(problems).toEqual([
      'a.stories.ts: argType "size" has no static description',
      'a.stories.ts: argType "...shared" has no static description',
      'a.stories.ts: argType "label" has no static description',
      'a.stories.ts: argType "hidden" has no static description',
    ]);
  });
});
