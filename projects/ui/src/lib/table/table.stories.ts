import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiTable, UiTd, UiTh } from './table';

type TableArgs = Record<string, never>;

const meta: Meta<TableArgs> = {
  title: 'Data display/Table',
  decorators: [moduleMetadata({ imports: [UiTable, UiTd, UiTh] })],
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
