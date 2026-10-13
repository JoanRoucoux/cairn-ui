import { describe, expect, it } from 'vitest';

import { mdxToMarkdown, readExportedTuples } from './mdx.ts';

const URL_BASE = 'https://example.test/';

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
  ['positive', 'Gain | loss'],
];

export const ratios = [
  ['foreground', 'Default text', '16.62:1'],
];

export const Sample = ({ children }) => <span>{children}</span>;

<table style={{ width: '100%' }}>
  <thead>
    <tr>
      <th style={{ textAlign: 'left' }}>Token</th>
      <th>Role</th>
      <th>Light</th>
    </tr>
  </thead>
  <tbody>
    {tokens.map(([token, role]) => (
      <tr key={token}>
        <td>
          <code>--{token}</code>
        </td>
        <td>{role}</td>
        <td>
          <Swatch token={token} scheme="light" />
        </td>
      </tr>
    ))}
  </tbody>
</table>

<Swatch token="primary" />

<table>
  <thead>
    <tr>
      <th>Token</th>
      <th>Ground</th>
      <th>Ratio</th>
    </tr>
  </thead>
  <tbody>
    {ratios.map(([token, role, ratio]) => (
      <tr>
        <td>{role}</td>
        <td><code>{token}</code></td>
        <td><Contrast token={token} ratio={ratio} /></td>
      </tr>
    ))}
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th>Preference</th>
      <th>Attribute on &lt;html&gt;</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <code>light</code>
      </td>
      <td>
        <code>data-theme="light"</code>
      </td>
    </tr>
  </tbody>
</table>

\`\`\`ts
import { UiButton } from '@joanroucoux/cairn-ui/button';
\`\`\`

See [Motion](?path=/docs/foundations-motion--docs).`;

describe('mdxToMarkdown', () => {
  it('keeps the prose and the code samples, converts the tables, drops swatches, and makes links absolute', () => {
    expect(mdxToMarkdown(PAGE, URL_BASE)).toEqual({
      title: 'Foundations/Colors',
      problems: [],
      content: `# Colors

Cairn is **monochrome**.

| Token | Role |
| --- | --- |
| \`--background\` | Page background |
| \`--positive\` | Gain \\| loss |

| Token | Ground | Ratio |
| --- | --- | --- |
| Default text | \`foreground\` | 16.62:1 |

| Preference | Attribute on &lt;html&gt; |
| --- | --- |
| \`light\` | \`data-theme="light"\` |

\`\`\`ts
import { UiButton } from '@joanroucoux/cairn-ui/button';
\`\`\`

See [Motion](https://example.test/?path=/docs/foundations-motion--docs).`,
    });
  });

  it('leaves the title out when the page has no Meta', () => {
    expect(mdxToMarkdown('# Untitled', URL_BASE)).toEqual({ content: '# Untitled', problems: [] });
  });

  it('leaves a cell empty where only some rows hold a swatch', () => {
    const { content, problems } = mdxToMarkdown(
      '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>x</td><td>y</td></tr><tr><td>z</td><td><Badge ratio={r} /></td></tr></tbody></table>',
      URL_BASE,
    );

    expect(problems).toEqual([]);
    expect(content).toBe(['| A | B |', '| --- | --- |', '| x | y |', '| z |  |'].join('\n'));
  });

  it('reports what it would drop instead of dropping it', () => {
    const { problems } = mdxToMarkdown(
      [
        'export const unused = [',
        "  ['a', 'b'],",
        '];',
        'export const label = 1;',
        'export default {};',
        '<p>Lost prose.</p>',
        '<table><tbody><tr><td>{value}</td></tr></tbody></table>',
        '<table>',
        '  <tbody>{missing.map(([a]) => (<tr><td>{a}</td></tr>))}</tbody>',
        '</table>',
        '<table>',
        '  <thead><tr><th>One</th></tr></thead>',
        '  <tbody><tr><td>a</td><td>b</td></tr></tbody>',
        '</table>',
      ].join('\n'),
      URL_BASE,
    );

    expect(problems).toEqual([
      'has an export it cannot convert: export const label = 1;',
      'has an export it cannot convert: export default {};',
      'has a <p> block it cannot convert',
      'has a table cell it cannot convert: {value}',
      'has a table mapped over missing, which is not an exported array of string tuples with a row',
      'has a table whose header row does not match its rows',
      'exports unused, which no table renders',
    ]);
  });
});

describe('readExportedTuples', () => {
  it('reads an exported array of string tuples', () => {
    expect(readExportedTuples(PAGE, 'tokens')).toEqual([
      ['background', 'Page background'],
      ['positive', 'Gain | loss'],
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
