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
* The host adds no margin: place it with \`-mx-2\` or \`-ml-1\` so the chevron lines up with the
  content edge while the hit area stays full size.`,
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
        '`md` is 44 px high in the foreground colour (screen header on iPhone); `sm` is 36 px, muted, with a hover glow (desktop header).',
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
  args: { size: 'sm', label: 'Instruments' },
};
