import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiButton } from '../button/button';
import {
  ROW_GAPS,
  ROW_PADDINGS,
  ROW_SIZES,
  type RowGap,
  type RowPadding,
  type RowSize,
  UiListRow,
  UiRow,
  UiRowItem,
  UiRowTile,
} from './row';

type RowArgs = {
  selected: boolean;
  busy: boolean;
  unavailable: boolean;
  size: RowSize;
  padding: RowPadding;
  gap: RowGap;
};

const meta: Meta<RowArgs> = {
  title: 'Data display/Row',
  decorators: [moduleMetadata({ imports: [UiButton, UiListRow, UiRow, UiRowItem, UiRowTile] })],
  parameters: {
    docs: {
      description: {
        component: `A clickable row for lists: holdings, accounts, search results. It replaces the per-row cards and
text "Edit" / "Delete" buttons the previous version used.

Applies to a native \`<a>\` for navigation or a \`<button>\` for an in-place action — never a \`<div>\`
with a click handler, so keyboard and assistive technology support come for free.

#### When to use

* For every row of a list the user can open: a holding, an account, a search result.

#### When not to use

* For a row that is not clickable. A plain row of text does not need this component. A static list with a hairline between rows, such as the passkeys of a profile, takes \`uiListRow\` on its \`li\`: 72px (68px from 64rem), 12px gap, a hairline under each row.
* For a primary page action, such as "Add a holding". Use \`ui-button\`.

#### Accessibility

* \`selected\` sets \`aria-current="true"\`, for the row whose detail is open next to it.
* \`busy\` sets \`aria-busy\` and \`aria-disabled\`, shows a spinner in the trailing slot and swallows the clicks while the row keeps its focus.
* \`unavailable\` sets \`aria-disabled="true"\`, greys the row to half opacity, shows a not-allowed cursor, drops hover and press, and swallows the clicks. The row stays focusable, so a screen reader finds it and reads why it cannot be picked: put the reason in the row.
* Follows the native element's own semantics: an \`<a>\` for navigation, a \`<button>\` for an action.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <a ui-row href="#" [selected]="selected" [busy]="busy" [unavailable]="unavailable" [size]="size" [padding]="padding" [gap]="gap" class="w-[340px]">
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
    busy: false,
    unavailable: false,
    size: 'md',
    padding: 'md',
    gap: 'default',
  },
  argTypes: {
    selected: { control: 'boolean', description: 'Sets `aria-current="true"` and the soft background.' },
    busy: {
      control: 'boolean',
      description:
        'An action started from the row is in flight: a spinner turns in the trailing slot, the row sets `aria-busy` and `aria-disabled`, swallows clicks and keeps its focus, so it cannot be activated twice.',
    },
    unavailable: {
      control: 'boolean',
      description:
        'Greys the row (half opacity), forbids the cursor, drops hover and press and swallows clicks. Sets `aria-disabled="true"`.',
    },
    size: {
      control: 'select',
      options: [...ROW_SIZES],
      description:
        'Minimum height and gap: `md` 56 px, `lg` 60 px (10 px gap), `xl` 72 px on touch and 68 px with a mouse (12 px gap), `card` 68 px (8 px gap, the rows of a card), `dense` 56 px then 48 px from 64rem (12 px gap, result lists).',
    },
    gap: {
      control: 'select',
      options: [...ROW_GAPS],
      description: 'Space between the row children: the size default, or `sm` for 8 px on any size.',
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

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(canvasElement.querySelector('a[ui-row]')!);

    await expect(style.transitionProperty).toBe('scale, background-color');
    await expect(style.transitionDuration).toBe('0.12s, 0.18s');
  },
};

export const Selected: Story = {
  args: { selected: true },
};

export const Busy: Story = {
  args: { busy: true },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('a[ui-row]')!;

    await expect(row).toHaveAttribute('aria-busy', 'true');
    await expect(row).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(row.querySelector('[aria-hidden="true"]')!).animationName).toBe('cairn-spin');
  },
};

export const Unavailable: Story = {
  name: 'Unavailable result row (non-EUR candidate)',
  args: { size: 'dense', unavailable: true },
  render: (args) => ({
    props: args,
    template: `
      <button ui-row type="button" [size]="size" [unavailable]="unavailable" class="w-[340px] lg:w-[680px]">
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="text-body truncate font-medium">iShares Core MSCI World UCITS ETF USD (Acc)</span>
          <span class="text-caption text-pretty text-(--subtle-foreground)">Coté en USD. Cairn ne suit que les cotations en euros.</span>
        </span>
        <span class="flex flex-none flex-col items-end">
          <span class="text-label font-medium">London Stock Exchange</span>
          <span class="text-caption text-(--subtle-foreground)">indisponible</span>
        </span>
      </button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: /iShares Core MSCI World/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  },
};

export const Tall: Story = {
  args: { size: 'lg', padding: 'sm' },
};

export const Profile: Story = {
  args: { size: 'xl', padding: 'sm' },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[358px] px-2">
        <a ui-row href="#" [selected]="selected" [size]="size" [padding]="padding" class="-mx-2 w-auto">
          <span uiRowTile>
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

export const Card: Story = {
  name: 'Card row (Lignes iPhone)',
  args: { size: 'card', padding: 'sm' },
  render: (args) => ({
    props: args,
    template: `
      <div class="rounded-container bg-(--card) w-[340px] px-2 py-1.5 shadow-[inset_0_0_0_1px_var(--border)]">
        <a ui-row href="#" [selected]="selected" [size]="size" [padding]="padding" class="-mx-2 w-auto">
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="text-body font-medium">Amundi MSCI World</span>
            <span class="text-label text-(--muted-foreground)">500 × 28,64 €</span>
          </div>
          <div class="flex flex-col items-end whitespace-nowrap">
            <span class="text-body font-medium">14 318,40 €</span>
            <span class="text-label text-(--muted-foreground)">+0,90 %</span>
          </div>
        </a>
      </div>
    `,
  }),
};

export const NarrowGap: Story = {
  name: 'Narrow gap on a tall row (Dashboard movers)',
  args: { size: 'xl', padding: 'sm', gap: 'sm' },
  render: (args) => ({
    props: args,
    template: `
      <a ui-row href="#" [selected]="selected" [size]="size" [padding]="padding" [gap]="gap" class="w-[340px]">
        <div class="flex min-w-0 flex-1 flex-col">
          <span class="text-body font-medium">Amundi MSCI World</span>
          <span class="text-label text-(--muted-foreground)">ETF Actions</span>
        </div>
        <span class="flex flex-col items-end whitespace-nowrap">
          <span class="text-body font-medium">14 318,40 €</span>
          <span class="text-label text-(--muted-foreground)">+0,90 %</span>
        </span>
        <svg class="block size-4 flex-none fill-none stroke-(--subtle-foreground) stroke-[1.75]" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
      </a>
    `,
  }),
};

export const WithTrailingAction: Story = {
  name: 'With a trailing action (Comptes iPhone)',
  args: { size: 'xl', padding: 'sm' },
  render: (args) => ({
    props: args,
    template: `
      <div class="rounded-container bg-(--card) w-[358px] py-1.5 pr-1 pl-2 shadow-[inset_0_0_0_1px_var(--border)]">
        <div uiRowItem>
          <a ui-row href="#" [selected]="selected" [size]="size" [padding]="padding">
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-body truncate font-medium">Saxo Investor</span>
              <span class="text-label truncate text-(--subtle-foreground)">PEA · Saxo</span>
            </span>
            <span class="flex flex-col items-end whitespace-nowrap">
              <span class="text-body font-medium">61 247,83 €</span>
              <span class="text-label text-(--muted-foreground)">8 lignes</span>
            </span>
          </a>
          <button ui-button variant="quiet" size="icon-sm" aria-label="Actions sur Saxo Investor">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('link', { name: /Saxo Investor/ });
    const action = canvas.getByRole('button', { name: 'Actions sur Saxo Investor' });

    await expect(row.getBoundingClientRect().right + 4).toBeCloseTo(action.getBoundingClientRect().left, 0);
  },
};

export const Dense: Story = {
  name: 'Dense result row (add a line)',
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

export const RuledListRows: Story = {
  name: 'Hairline-separated list rows (Profil clés)',
  render: () => ({
    template: `
      <ul class="w-[326px]">
        <li uiListRow>
          <span uiRowTile><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg></span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="flex items-center gap-2">
              <span class="text-body truncate font-medium">iPhone de Joan</span>
              <span class="rounded-pill text-caption inline-flex h-[22px] flex-none items-center bg-(--muted) px-2 font-medium">Cet appareil</span>
            </span>
            <span class="text-caption text-(--subtle-foreground)">iCloud · Créée le 12/03/2025 · Utilisée aujourd'hui</span>
          </span>
          <button ui-button variant="quiet-destructive" size="icon-sm" class="-mr-2" aria-label="Supprimer la clé iPhone de Joan"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg></button>
        </li>
        <li uiListRow>
          <span uiRowTile><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg></span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="flex items-center gap-2">
              <span class="text-body truncate font-medium">MacBook Air</span>
            </span>
            <span class="text-caption text-(--subtle-foreground)">iCloud · Créée le 12/03/2025 · Utilisée hier</span>
          </span>
          <button ui-button variant="quiet-destructive" size="icon-sm" class="-mr-2" aria-label="Supprimer la clé MacBook Air"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg></button>
        </li>
        <li uiListRow>
          <span uiRowTile><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg></span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="flex items-center gap-2">
              <span class="text-body truncate font-medium">YubiKey 5C</span>
            </span>
            <span class="text-caption text-(--subtle-foreground)">Clé de sécurité · Créée le 04/11/2025 · Utilisée le 02/09/2026</span>
          </span>
          <button ui-button variant="quiet-destructive" size="icon-sm" class="-mr-2" aria-label="Supprimer la clé YubiKey 5C"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg></button>
        </li>
      </ul>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};
