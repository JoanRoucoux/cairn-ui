import { describe, expect, it } from 'vitest';

import { mdxToMarkdown, readExportedTuples } from './mdx.ts';

const PAGE = `import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Foundations/Colors" />

# Colors

Cairn is **monochrome**.

export const Swatch = ({ token }) => (
  <div style={{ background: \`var(--\${token})\` }}>

    Aa
  </div>
);

export const tokens = [
  ['background', 'Page background'],
  ['positive', 'Gain'],
];

export const Sample = ({ children }) => <span>{children}</span>;

<table>
  <tbody>

    {tokens.map(([token]) => <Swatch token={token} />)}
  </tbody>
</table>

<Swatch token="primary" />

<p>One line.</p>

\`\`\`ts
import { UiButton } from '@joanroucoux/cairn-ui/button';
\`\`\`

See [Motion](?path=/docs/foundations-motion--docs).`;

describe('mdxToMarkdown', () => {
  it('keeps the prose and the code samples, drops ESM and JSX, and makes links absolute', () => {
    expect(mdxToMarkdown(PAGE, 'https://example.test/')).toEqual({
      title: 'Foundations/Colors',
      content: `# Colors

Cairn is **monochrome**.

\`\`\`ts
import { UiButton } from '@joanroucoux/cairn-ui/button';
\`\`\`

See [Motion](https://example.test/?path=/docs/foundations-motion--docs).`,
    });
  });

  it('leaves the title out when the page has no Meta', () => {
    expect(mdxToMarkdown('# Untitled', 'https://example.test/')).toEqual({ content: '# Untitled' });
  });
});

describe('readExportedTuples', () => {
  it('reads an exported array of string tuples', () => {
    expect(readExportedTuples(PAGE, 'tokens')).toEqual([
      ['background', 'Page background'],
      ['positive', 'Gain'],
    ]);
  });

  it('turns anything but a string into an empty value', () => {
    expect(readExportedTuples("export const tokens = [\n  ['a', 1],\n  'b',\n];", 'tokens')).toEqual([['a', ''], []]);
  });

  it('returns undefined for a missing or unterminated export', () => {
    expect(readExportedTuples(PAGE, 'roles')).toBeUndefined();
    expect(readExportedTuples("export const tokens = [['a', 'b']];", 'tokens')).toBeUndefined();
  });
});
