import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiTable, UiTd, UiTh } from './table';

type TableArgs = Record<string, never>;

const meta: Meta<TableArgs> = {
  title: 'Data display/Table',
  decorators: [moduleMetadata({ imports: [UiTable, UiTd, UiTh] })],
  parameters: {
    docs: {
      description: {
        component: `Styled native \`<table>\`. The rows and cells stay plain \`<tr>\` and \`<td>\`, with \`uiTable\`,
\`uiTh\` and \`uiTd\` applied as attributes.

\`numeric\` right aligns a column and lines its digits up. Set it on the \`<th>\` and on every \`<td>\`
of that column, since they carry it independently. \`from\` holds a secondary column back until the
viewport is wide enough for it, which keeps a narrow screen honest instead of truncating.

#### When to use

* For data with more than one dimension, where a row and a column both mean something.

#### When not to use

* For layout. A table announces relationships that a layout does not have.
* For a single list of values, where a list carries the same content with less structure.

#### Accessibility

* The semantics come from the real \`<table>\`, so rows, columns and header association work without
  any ARIA.
* Prefer \`from\` over hiding a column outright: content dropped at a breakpoint is gone for everyone
  at that width, including screen reader users.
* A column held back by \`from\` must be held back on its header and its cells together, or the
  remaining cells shift under the wrong headers.`,
      },
    },
  },
  render: () => ({
    template: `
      <table uiTable>
        <thead>
          <tr>
            <th uiTh>Ligne</th>
            <th uiTh numeric from="md">Quantite</th>
            <th uiTh numeric from="lg">Prix de revient</th>
            <th uiTh numeric>Valeur</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td uiTd>BNP Paribas Easy S&amp;P 500</td>
            <td uiTd numeric from="md">676</td>
            <td uiTd numeric from="lg">26,6540</td>
            <td uiTd numeric>22 515,47</td>
          </tr>
          <tr>
            <td uiTd>Livret A</td>
            <td uiTd numeric from="md">20 010</td>
            <td uiTd numeric from="lg">&mdash;</td>
            <td uiTd numeric>20 010,00</td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};

export default meta;
type Story = StoryObj<TableArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('table')).toBeInTheDocument();
  },
};
