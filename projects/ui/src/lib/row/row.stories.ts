import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import { ROW_PADDINGS, ROW_SIZES, type RowPadding, type RowSize, UiRow } from './row';

type RowArgs = {
  selected: boolean;
  size: RowSize;
  padding: RowPadding;
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
      <a ui-row href="#" [selected]="selected" [size]="size" [padding]="padding" class="w-[340px]">
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
    size: 'md',
    padding: 'md',
  },
  argTypes: {
    selected: { control: 'boolean', description: 'Sets `aria-current="true"` and the soft background.' },
    size: {
      control: 'select',
      options: [...ROW_SIZES],
      description: 'Minimum height: `md` 56 px, `lg` 60 px, `xl` 72 px on touch and 68 px with a mouse (12 px gap).',
    },
    padding: {
      control: 'select',
      options: [...ROW_PADDINGS],
      description: 'Side padding: `md` 10 px, `sm` 8 px, `none` 0.',
    },
  },
};

export default meta;
type Story = StoryObj<RowArgs>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

export const Tall: Story = {
  args: { size: 'lg', padding: 'sm' },
};

export const Profile: Story = {
  args: { size: 'xl', padding: 'sm' },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[340px] px-2">
        <a ui-row href="#" [selected]="selected" [size]="size" [padding]="padding" class="-mx-2 w-auto">
          <span class="rounded-control bg-(--muted) grid size-9 flex-none place-items-center">
            <svg class="block size-[18px] flex-none fill-none stroke-current stroke-[1.75]" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path></svg>
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-body font-medium">Exporter le portefeuille</span>
            <span class="text-caption text-(--subtle-foreground)">Toutes les lignes en CSV, au cours du jour</span>
          </span>
          <svg class="block size-4 flex-none fill-none stroke-(--subtle-foreground) stroke-[1.75]" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
        </a>
      </div>
    `,
  }),
};
