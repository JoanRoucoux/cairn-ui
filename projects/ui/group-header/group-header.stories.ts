import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiGroupHeader } from './group-header';

type GroupHeaderArgs = {
  name: string;
  meta: string;
  collapsible: boolean;
  expanded: boolean;
  toggleDisabled: boolean;
  headingLevel: number;
};

const CARD = 'w-[390px] rounded-container bg-(--card) p-2 shadow-[inset_0_0_0_1px_var(--border)]';

const PHONE = {
  globals: { viewport: { value: '390x300', isRotated: false } },
  parameters: {
    viewport: { options: { '390x300': { name: '390 x 300', styles: { width: '390px', height: '300px' } } } },
  },
};

const meta: Meta<GroupHeaderArgs> = {
  title: 'Data display/Group header',
  decorators: [moduleMetadata({ imports: [UiGroupHeader] })],
  parameters: {
    docs: {
      description: {
        component: `The header of a grouped card on a phone: the name, its meta underneath, the total on the right
(projected, usually a \`ui-amount\`). It sits on the bottom line of the block, 44px tall at least.

With \`collapsible\` it is one button inside the heading (\`h2 > button[aria-expanded]\`) with a 20px chevron that
turns to -90 degrees when folded, and a press scale. \`expanded\` is a \`model()\`: bind \`[(expanded)]\`, keep the fold
memory in the page and hide the card body yourself, with \`hidden\` rather than removing it. \`toggleDisabled\` keeps
the button focusable and announced while a click does nothing, for a group a filter holds open. \`controls\` is the id
of the body it folds.

#### When to use

* To head a card of rows on a phone, folded or not, where the table band of a desktop screen would not fit.

#### When not to use

* On desktop, where \`td[ui-group-cell]\` heads a group of table rows.

#### Accessibility

* The button sits inside the heading, so the heading structure survives. \`aria-expanded\` carries the state, and
  \`aria-disabled\` the held-open one, which keeps the button reachable by keyboard.
* The name is an \`h2\`; \`headingLevel\` (2 to 6) sets \`aria-level\` so the card fits the outline of the page.
* The chevron is decorative and hidden from assistive technology.
* A masked (\`••••\`) or missing (\`—\`) amount in \`meta\` is read through \`UiAmountText\` as the \`UI_AMOUNT_LABELS\` texts.`,
      },
    },
  },
  argTypes: {
    name: { control: 'text', description: 'The group name, title weight.' },
    meta: { control: 'text', description: 'The line under the name, muted.' },
    collapsible: { control: 'boolean', description: 'Makes the header a button that folds the group.' },
    expanded: { control: 'boolean', description: 'Two-way model: whether the group is open.' },
    toggleDisabled: { control: 'boolean', description: 'Keeps the button announced but ignores a click.' },
    headingLevel: {
      control: { type: 'number', min: 2, max: 6 },
      description: 'Heading level, 2 to 6. The element stays an `h2` and `aria-level` carries any other level.',
    },
  },
  args: {
    name: 'Northwind PEA',
    meta: 'PEA · Northwind Bank · 3 holdings',
    collapsible: true,
    expanded: true,
    toggleDisabled: false,
    headingLevel: 2,
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="${CARD}">
        <ui-group-header [name]="name" [meta]="meta" [collapsible]="collapsible" [(expanded)]="expanded" [toggleDisabled]="toggleDisabled" [headingLevel]="headingLevel">48 215,60 €</ui-group-header>
        <p class="m-0 px-1 pb-1 text-label text-(--muted-foreground)" [hidden]="!expanded">Ferrari, Amundi MSCI World, Accor</p>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<GroupHeaderArgs>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: { expanded: false },
};

export const Static: Story = {
  args: { collapsible: false },
};

export const HeldOpenByAFilter: Story = {
  name: 'Held open ignores the click and keeps the default cursor',
  tags: ['!dev', '!autodocs'],
  ...PHONE,
  args: { toggleDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);

    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(getComputedStyle(button).cursor).not.toBe('pointer');
  },
};
