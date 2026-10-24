import { UiButton } from '@joanroucoux/cairn-ui/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiEmpty } from './empty';

type EmptyArgs = { heading: string; hint: string; announce: boolean };

const meta: Meta<EmptyArgs> = {
  title: 'Feedback/Empty',
  decorators: [moduleMetadata({ imports: [UiButton, UiEmpty] })],
  parameters: {
    docs: {
      description: {
        component: `A centered empty state: a title, a hint and an action slot.

#### When to use

* For a list or a search that has nothing to show and can offer the next step: a catalog search that matches nothing, an account with no holding.

#### When not to use

* For a block that failed to load or is loading. Use [Async](?path=/docs/feedback-async--docs).

#### Accessibility

* The title and the hint are plain text, read in order, before the projected action.
* Project a real \`<button>\` or \`<a>\` as the action.
* Content inserted with its text is not read by a screen reader. Set \`announce\` on an empty state that replaces results after a search or a filter: the title and the hint are then spoken once, through the shared live region, and again whenever either changes.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-empty class="w-[342px] lg:w-[680px]" [heading]="heading" [hint]="hint" [announce]="announce">
        <button ui-button variant="outline" size="md" type="button">Add a holding</button>
      </ui-empty>
    `,
  }),
  args: {
    heading: 'No holding matches “zzz”',
    hint: 'Search covers the name and the ISIN.',
    announce: false,
  },
  argTypes: {
    heading: { control: 'text', description: 'The title of the state.' },
    hint: { control: 'text', description: 'The line under the title. Omitted when empty.' },
    announce: {
      control: 'boolean',
      description:
        'Speaks the title and the hint to screen readers when the empty state appears and when either changes.',
    },
  },
};

export default meta;
type Story = StoryObj<EmptyArgs>;

export const Default: Story = {};

export const WithoutHint: Story = {
  args: { hint: '' },
};

const headingOnly = {
  args: { hint: '' },
  render: (args: EmptyArgs) => ({
    props: args,
    template: `<ui-empty data-testid="empty" class="w-[342px] lg:w-[680px]" [heading]="heading" [hint]="hint" />`,
  }),
};

export const HeadingOnly: Story = headingOnly;

export const EmptyActionSlotIsHidden: Story = {
  ...headingOnly,
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('empty');
    const heading = canvas.getByText('No holding matches “zzz”');

    await expect(heading).toBeVisible();
    await expect(empty.lastElementChild).not.toBe(heading);
    await expect(empty.lastElementChild).not.toBeVisible();
  },
};
