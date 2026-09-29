import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import { UiRow } from './row';

type RowArgs = {
  selected: boolean;
};

const meta: Meta<RowArgs> = {
  title: 'Data display/Row',
  decorators: [moduleMetadata({ imports: [UiRow] })],
  parameters: {
    docs: {
      description: {
        component: `A clickable row for lists: holdings, envelopes, accounts. It replaces the per-row cards and
text "Edit" / "Delete" buttons the previous version used.

Applies to a native \`<a>\` for navigation or a \`<button>\` for an in-place action — never a \`<div>\`
with a click handler, so keyboard and assistive technology support come for free.

#### When to use

* For every row of a list the user can open: a holding, an account, an envelope.

#### When not to use

* For a row that is not clickable. A plain row of text does not need this component.
* For a primary page action, such as "Add a holding". Use \`ui-button\`.

#### Accessibility

* \`selected\` sets \`aria-current="true"\`, for the row whose detail is open next to it.
* Follows the native element's own semantics: an \`<a>\` for navigation, a \`<button>\` for an action.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <a ui-row href="#" [selected]="selected" class="w-[340px]">
        <div class="flex min-w-0 flex-1 flex-col">
          <span class="text-body font-medium">Amundi MSCI World</span>
          <span class="text-label text-(--muted-foreground)">500 × 28,64 €</span>
        </div>
        <div class="flex flex-col items-end whitespace-nowrap">
          <span class="text-body font-medium">14 318,40 €</span>
          <span class="text-label text-(--muted-foreground)">+0,90 %</span>
        </div>
      </a>
    `,
  }),
  args: {
    selected: false,
  },
  argTypes: {
    selected: { control: 'boolean', description: 'Sets `aria-current="true"` and the soft background.' },
  },
};

export default meta;
type Story = StoryObj<RowArgs>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};
