import { UiButton } from '@joanroucoux/cairn-ui/button';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, waitFor, within } from 'storybook/test';

import {
  ROW_GAPS,
  ROW_PADDINGS,
  ROW_SIZES,
  ROW_TRAILINGS,
  type RowGap,
  type RowPadding,
  type RowSize,
  type RowTrailing,
  UiListRow,
  UiRow,
  UiRowGroup,
  UiRowItem,
  UiRowTile,
} from './row';

type RowArgs = {
  selected: boolean;
  busy: boolean;
  busyLabel: string;
  unavailable: boolean;
  size: RowSize;
  padding: RowPadding;
  gap: RowGap;
  trailing: RowTrailing;
};

const DESKTOP = {
  globals: { viewport: { value: '1440x900', isRotated: false } },
  parameters: {
    viewport: { options: { '1440x900': { name: '1440 x 900', styles: { width: '1440px', height: '900px' } } } },
  },
};

const meta: Meta<RowArgs> = {
  title: 'Data display/Row',
  decorators: [moduleMetadata({ imports: [UiButton, UiListRow, UiRow, UiRowGroup, UiRowItem, UiRowTile] })],
  parameters: {
    docs: {
      description: {
        component: `A clickable row for lists: holdings, accounts, search results. It replaces the per-row cards and
text "Edit" / "Delete" buttons the previous version used.

Applies to a native \`<a>\` for navigation or a \`<button>\` for an in-place action, never a \`<div>\`
with a click handler, so keyboard and assistive technology support come for free.

#### When to use

* For every row of a list the user can open: a holding, an account, a search result.

#### When not to use

* For a row that is not clickable. A plain row of text does not need this component. A static list with a hairline between rows, such as the passkeys of a profile, takes \`uiListRow\` on its \`li\`: 72px (68px from 64rem), 12px gap, a hairline under each row.
* For a primary page action, such as "Add a holding". Use \`ui-button\`.

#### Accessibility

* A selected row adds an inset \`--control-border\` ring to its soft fill, so the state does not rely on a faint tint. In forced colors it takes the \`Highlight\` / \`HighlightText\` pair.
* \`selected\` sets \`aria-current="true"\`, for the row whose detail is open next to it.
* \`busy\` sets \`aria-busy\` and \`aria-disabled\`, shows a spinner in the trailing slot with a hidden \`busyLabel\` (default "Loading") so the name of the row says why it is disabled, and swallows the clicks while the row keeps its focus.
* \`unavailable\` sets \`aria-disabled="true"\`, grays the row to half opacity, shows a not-allowed cursor, drops hover and press, and swallows the clicks. The row stays focusable, so a screen reader finds it and reads why it cannot be picked: put the reason in the row.
* Follows the native element's own semantics: an \`<a>\` for navigation, a \`<button>\` for an action.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <a ui-row href="#" [selected]="selected" [busy]="busy" [busyLabel]="busyLabel" [unavailable]="unavailable" [size]="size" [padding]="padding" [gap]="gap" [trailing]="trailing" class="w-[340px]">
        <div class="flex min-w-0 flex-1 flex-col">
          <span class="text-body font-medium">Amundi MSCI World</span>
          <span class="text-label text-(--muted-foreground)">300 × 28,64 €</span>
        </div>
        <div class="flex flex-col items-end whitespace-nowrap">
          <span class="text-body font-medium">8 592,00 €</span>
          <span class="text-label text-(--muted-foreground)">+0,90 %</span>
        </div>
      </a>
    `,
  }),
  args: {
    selected: false,
    busy: false,
    busyLabel: 'Loading',
    unavailable: false,
    size: 'md',
    padding: 'md',
    gap: 'default',
    trailing: 'none',
  },
  argTypes: {
    selected: { control: 'boolean', description: 'Sets `aria-current="true"` and the soft background.' },
    busyLabel: {
      control: 'text',
      description:
        'Text read by assistive technologies while the row is busy, next to the spinner. Defaults to `Loading`.',
    },
    busy: {
      control: 'boolean',
      description:
        'An action started from the row is in flight: a spinner turns in the trailing slot, the row sets `aria-busy` and `aria-disabled`, swallows clicks and keeps its focus, so it cannot be activated twice.',
    },
    unavailable: {
      control: 'boolean',
      description:
        'Grays the row (half opacity), forbids the cursor, drops hover and press and swallows clicks. Sets `aria-disabled="true"`.',
    },
    size: {
      control: 'select',
      options: [...ROW_SIZES],
      description:
        'Minimum height and gap: `md` 56 px, `lg` 60 px (10 px gap), `xl` 72 px on touch and 68 px with a mouse (12 px gap), `card` 68 px (8 px gap, the rows of a card), `dense` 56 px at every width (12 px gap, result lists).',
    },
    gap: {
      control: 'select',
      options: [...ROW_GAPS],
      description: 'Space between the row children: the size default, or `sm` for 8 px on any size.',
    },
    trailing: {
      control: 'inline-radio',
      options: [...ROW_TRAILINGS],
      description:
        '`chevron` makes a flush link row: a 16 px chevron in `--subtle-foreground` at the end, no side padding, a minimum height of `--row-min`, and the text turns `--muted-foreground` on hover instead of the glow. `size`, `padding` and `gap` are ignored.',
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

export const Busy: Story = {
  args: { busy: true },
};

export const Dense: Story = {
  name: 'Dense result row',
  args: { size: 'dense' },
  render: (args) => ({
    props: args,
    template: `
      <button ui-row type="button" [size]="size" [padding]="padding" class="w-[340px]">
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="text-body truncate font-medium">Amundi MSCI World</span>
          <span class="text-caption text-(--subtle-foreground)">LU1681043599 · ETF</span>
        </span>
        <span class="text-caption flex-none text-(--muted-foreground)">Yahoo Finance</span>
      </button>
    `,
  }),
};

export const WithTrailingAction: Story = {
  name: 'With a trailing action',
  args: { size: 'xl', padding: 'sm' },
  render: (args) => ({
    props: args,
    template: `
      <div class="rounded-container bg-(--card) w-[358px] py-1.5 pr-1 pl-2 shadow-[inset_0_0_0_1px_var(--border)]">
        <div uiRowItem>
          <a ui-row href="#" [selected]="selected" [size]="size" [padding]="padding">
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-body truncate font-medium">Northwind PEA</span>
              <span class="text-label truncate text-(--subtle-foreground)">PEA · Northwind Bank</span>
            </span>
            <span class="flex flex-col items-end whitespace-nowrap">
              <span class="text-body font-medium">48 215,60 €</span>
              <span class="text-label text-(--muted-foreground)">8 holdings</span>
            </span>
          </a>
          <button ui-button variant="quiet" size="icon-sm" aria-label="Northwind PEA actions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </button>
        </div>
      </div>
    `,
  }),
};

export const Link: Story = {
  name: 'Link row',
  args: { trailing: 'chevron' },
  render: (args) => ({
    props: args,
    template: `
      <div uiRowGroup class="w-[360px]">
        <button ui-row type="button" [trailing]="trailing">
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-label font-medium">SG Sirius structured product</span>
            <span class="text-caption text-(--subtle-foreground)">No search: enter the ISIN</span>
          </span>
        </button>
        <button ui-row type="button" [trailing]="trailing">
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-label font-medium">Enter manually</span>
            <span class="text-caption text-(--subtle-foreground)">For a security with no source, priced by you</span>
          </span>
        </button>
      </div>
    `,
  }),
};

export const TransitionsFadeFillAndScalePress: Story = {
  name: 'Hover fill fades and press scales',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(canvasElement.querySelector('a[ui-row]')!);

    await waitFor(() => expect(style.transitionProperty).toBe('scale, background-color'));
    await expect(style.transitionDuration).toBe('0.12s, 0.18s');
  },
};

export const BusySpinnerTurns: Story = {
  name: 'Busy spinner turns',
  args: { busy: true },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('a[ui-row]')!;

    await expect(row).toHaveAttribute('aria-busy', 'true');
    await expect(row).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(row.querySelector('[aria-hidden="true"]')!).animationName).toBe('cairn-spin');
  },
};

export const TrailingActionSitsBesideTheRow: Story = {
  ...WithTrailingAction,
  name: 'Trailing action sits 4 px after the row',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('link', { name: /Northwind PEA/ });
    const action = canvas.getByRole('button', { name: 'Northwind PEA actions' });

    await expect(row.getBoundingClientRect().right + 4).toBeCloseTo(action.getBoundingClientRect().left, 0);
  },
};

export const DenseOnDesktop: Story = {
  ...Dense,
  name: 'Dense row keeps 56 px on a wide viewport',
  tags: ['!dev', '!autodocs'],
  ...DESKTOP,
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole('button', { name: /Amundi MSCI World/ });

    await expect(row.getBoundingClientRect().height).toBe(56);
  },
};

export const LinkRowIsFlushWithAChevron: Story = {
  ...Link,
  name: 'Link row is flush with a chevron',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: /Enter manually/ });

    await expect(getComputedStyle(row).paddingLeft).toBe('0px');
    await expect(getComputedStyle(row.parentElement as HTMLElement).boxShadow).toContain('inset');
    await expect(row.querySelector('svg')).toHaveAttribute('width', '16');
  },
};
