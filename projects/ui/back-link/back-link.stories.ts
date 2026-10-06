import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { BACK_LINK_SIZES, type BackLinkSize, UiBackLink } from './back-link';

type BackLinkArgs = {
  size: BackLinkSize;
  label: string;
};

const meta: Meta<BackLinkArgs> = {
  title: 'Navigation/Back link',
  decorators: [moduleMetadata({ imports: [UiBackLink] })],
  parameters: {
    docs: {
      description: {
        component: `Link back to the parent screen: a chevron and the name of the destination.

#### When to use

* On a detail or form screen reached from a list, to return to that list.
* \`md\` heads a screen on iPhone; \`sm\` is the quieter desktop breadcrumb in a header.

#### When not to use

* For navigation between sibling destinations. \`ui-nav-item\` and \`ui-tab-bar\` cover that.
* For undoing an action. That is a button.

#### Accessibility

* A native \`<a>\`: it is announced as a link named by its label, which should name the destination
  ("Comptes"), not the gesture ("Retour").
* The chevron is decorative and hidden from assistive technologies.
* \`md\`, \`sm\` and \`header\` add no margin: place them with \`-mx-2\` or \`-ml-1\` so the chevron lines up
  with the content edge while the hit area stays full size. \`inline\` carries its own outset (-8px top, -4px
  bottom, -6px left, at the start of a flex column): put it at the top of a form column as it is.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<a ui-back-link href="#" [size]="size">{{ label }}</a>`,
  }),
  args: { size: 'md', label: 'Comptes' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: [...BACK_LINK_SIZES],
      description:
        '`md` is 44 px high in the foreground colour (screen header on iPhone); `sm` is 36 px, muted, with a hover glow (desktop header); `header` has the `md` metrics with a 24 px chevron and a focus ring drawn inside (a screen header); `inline` is the 14 px 500 muted back step of a form, 44 px high (36 px with a mouse), 18 px chevron, hover to the foreground colour, on a `button`, with its own outset at the top of a form column.',
    },
    label: { control: 'text', description: 'Projected text: the name of the destination.' },
  },
};

export default meta;
type Story = StoryObj<BackLinkArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'Comptes' })).toBeVisible();
  },
};

export const Small: Story = {
  args: { size: 'sm', label: 'Comptes' },
};

export const Header: Story = {
  name: 'Header (Lignes detail)',
  args: { size: 'header', label: 'Lignes' },
};

export const InlineButton: Story = {
  name: 'Inline button (Ajouter une ligne)',
  args: { size: 'inline', label: 'Retour à la recherche' },
  render: (args) => ({
    props: args,
    template: `<button ui-back-link [size]="size">{{ label }}</button>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Retour à la recherche' });

    await expect(button).toHaveAttribute('type', 'button');
    await expect(getComputedStyle(button).fontSize).toBe('14px');
    await expect(getComputedStyle(button).fontWeight).toBe('500');
  },
};

export const InlineAtTheTopOfAForm: Story = {
  name: 'Inline button at the top of a form column',
  args: { size: 'inline', label: 'Retour à la recherche' },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex w-[340px] flex-col gap-4 p-6" data-story-column>
        <button ui-back-link [size]="size">{{ label }}</button>
        <span class="text-body font-semibold" data-story-title>Saisie manuelle</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Retour à la recherche' }).getBoundingClientRect();
    const column = (canvasElement.querySelector('[data-story-column]') as HTMLElement).getBoundingClientRect();
    const title = (canvasElement.querySelector('[data-story-title]') as HTMLElement).getBoundingClientRect();

    await expect(button.left).toBe(column.left + 24 - 6);
    await expect(button.top).toBe(column.top + 24 - 8);
    await expect(title.top).toBe(button.bottom - 4 + 16);
    await expect(button.width).toBeLessThan(column.width - 48);
  },
};
