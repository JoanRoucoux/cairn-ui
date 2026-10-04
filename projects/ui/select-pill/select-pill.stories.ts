import { UiMenu, UiMenuItem } from '@joanroucoux/cairn-ui/menu';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { UiSelectPill } from './select-pill';

type SelectPillArgs = {
  active: boolean;
  clearLabel: string;
  cleared: () => void;
};

const meta: Meta<SelectPillArgs> = {
  title: 'Inputs/Select pill',
  decorators: [moduleMetadata({ imports: [UiSelectPill, UiMenu, UiMenuItem] })],
  parameters: {
    docs: {
      description: {
        component: `Compact pill that opens a [Menu](?path=/docs/surfaces-menu--docs) of exclusive choices, to head a
row of [Filter chips](?path=/docs/inputs-filter-chips--docs), for a filter with too many values for chips, such as an
account. The projected text is the pill label and the projected \`ui-menu\` is what it opens, as a sheet on a phone
like the \`…\` menus. At rest it is outlined on the card surface with a chevron; once a value other than the "all"
choice is picked (\`[active]="true"\`) it is solid primary and a separate 14 px cross replaces the chevron: it
emits \`cleared\`, so the list goes back to every value in one tap. It is 34 px tall inside a 44 px target on touch,
32 px with a fine pointer.

#### When to use

* To filter a list by one value among several, next to the chips of another filter.

#### When not to use

* A choice made in a form. Use [Select](?path=/docs/inputs-select--docs).
* A handful of values that all deserve to be visible. Use [Filter chips](?path=/docs/inputs-filter-chips--docs).

#### Accessibility

* The trigger is named by its label, and \`aria-haspopup\`, \`aria-expanded\` and \`aria-controls\` come from the
  menu. Give the menu its own \`label\`; its choices are \`menuitemradio\` items, the current one \`aria-checked\`.
* The cross is a real button named by \`clearLabel\`, which the app passes in its own language, and it is a
  tab stop of its own, outside the trigger.
* The trigger's focus ring sits 2 px outside the pill; the cross's is a 24 px circle around its icon, in the pill's
  text colour so it shows on the solid pill. Both are outlines, so they show in forced colors; the pill keeps a
  border there.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-select-pill [active]="active" [clearLabel]="clearLabel" contextLabel="Compte" (cleared)="cleared()">
        {{ active ? 'Northwind PEA' : 'Tous les comptes' }}
        <ui-menu label="Compte" sheet heading="Compte">
          <button uiMenuItem type="button" [checked]="!active">Tous les comptes</button>
          <button uiMenuItem type="button" [checked]="active">Northwind PEA</button>
          <button uiMenuItem type="button">Contoso CTO</button>
        </ui-menu>
      </ui-select-pill>
    `,
  }),
  args: { active: false, clearLabel: 'Retirer le filtre de compte', cleared: fn() },
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Solid primary pill with a cross in place of the chevron, for a value other than "all".',
    },
    clearLabel: {
      control: 'text',
      description: 'Accessible name of the cross, in the language of the app. Required.',
    },
    cleared: {
      control: false,
      description: 'Emits when the cross is pressed. Only drawn when `active`.',
    },
  },
};

export default meta;
type Story = StoryObj<SelectPillArgs>;

export const Rest: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Tous les comptes' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

export const Active: Story = {
  args: { active: true },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Retirer le filtre de compte' }));

    await expect(args.cleared).toHaveBeenCalledTimes(1);
  },
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const trigger = within(canvasElement).getByRole('button', { name: 'Tous les comptes' });

    await expect(trigger).toHaveFocus();
    await expect(getComputedStyle(trigger).outlineStyle).toBe('solid');
    await expect(getComputedStyle(trigger).outlineWidth).toBe('2px');
  },
};

export const ActiveFocus: Story = {
  name: 'Active, focus on the cross',
  args: { active: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cross = canvas.getByRole('button', { name: 'Retirer le filtre de compte' });
    const pill = canvasElement.querySelector('[data-pill]')!;

    await userEvent.tab();
    await userEvent.tab();

    await expect(cross).toHaveFocus();
    await expect(getComputedStyle(cross).outlineStyle).toBe('solid');
    await expect(getComputedStyle(cross).outlineWidth).toBe('2px');
    await expect(getComputedStyle(cross).outlineColor).toBe(getComputedStyle(pill).color);
    await expect(getComputedStyle(cross).outlineColor).not.toBe(getComputedStyle(pill).backgroundColor);
  },
};
