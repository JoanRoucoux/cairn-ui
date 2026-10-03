import { UiButton } from '@joanroucoux/cairn-ui/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiEmpty } from './empty';

type EmptyArgs = { heading: string; hint: string };

const meta: Meta<EmptyArgs> = {
  title: 'Feedback/Empty',
  decorators: [moduleMetadata({ imports: [UiButton, UiEmpty] })],
  parameters: {
    docs: {
      description: {
        component: `A centred empty state: a title, a hint and an action slot.

#### When to use

* For a list or a search that has nothing to show and can offer the next step: a catalogue search that matches nothing, an account with no line.

#### When not to use

* For a block that failed to load or is loading. Use [Async](?path=/docs/feedback-async--docs).

#### Accessibility

* The title and the hint are plain text, read in order, before the projected action.
* Project a real \`<button>\` or \`<a>\` as the action.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-empty class="w-[342px] lg:w-[680px]" [heading]="heading" [hint]="hint">
        <button ui-button variant="outline" size="md" type="button">Ajouter une ligne</button>
      </ui-empty>
    `,
  }),
  args: {
    heading: 'Aucun instrument ne correspond à « zzz »',
    hint: "La recherche porte sur le nom et l'ISIN.",
  },
  argTypes: {
    heading: { control: 'text', description: 'The title of the state.' },
    hint: { control: 'text', description: 'The line under the title. Omitted when empty.' },
  },
};

export default meta;
type Story = StoryObj<EmptyArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Aucun instrument ne correspond à « zzz »')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Ajouter une ligne' })).toBeVisible();
  },
};

export const WithoutHint: Story = {
  args: { hint: '' },
};

export const HeadingOnly: Story = {
  args: { hint: '' },
  render: (args) => ({
    props: args,
    template: `<ui-empty data-testid="empty" class="w-[342px] lg:w-[680px]" [heading]="heading" [hint]="hint" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('empty');
    const heading = canvas.getByText('Aucun instrument ne correspond à « zzz »');

    await expect(heading).toBeVisible();
    await expect(empty.lastElementChild).not.toBe(heading);
    await expect(empty.lastElementChild).not.toBeVisible();
  },
};
