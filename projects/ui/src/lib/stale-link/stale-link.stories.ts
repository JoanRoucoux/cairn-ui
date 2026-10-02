import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiStaleLink } from './stale-link';

type StaleLinkArgs = { chevron: boolean; label: string };

const meta: Meta<StaleLinkArgs> = {
  title: 'Navigation/Stale link',
  decorators: [moduleMetadata({ imports: [UiStaleLink] })],
  parameters: {
    docs: {
      description: {
        component: `A link in the stale tone, for a caption about data that is late or left out of a total.

#### When to use

* For a caption that leads to the lines concerned: "1 cours en retard", "1 ligne sans cours, non comptée".

#### When not to use

* For a caption that leads nowhere. Use the stale tone of [Facts](?path=/docs/data-display-facts--docs) or of the table sub line.
* For a link that leaves the application. Use [External link](?path=/docs/navigation-external-link--docs).

#### Accessibility

* A native \`<a>\`: the caption names the destination. The optional chevron is a decoration drawn by CSS, so it is not read.
* Underlined on hover, with a 2px ring on keyboard focus.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<a uiStaleLink href="#" [chevron]="chevron">{{ label }}</a>`,
  }),
  args: { chevron: false, label: '1 cours en retard' },
  argTypes: {
    chevron: { control: 'boolean', description: 'Adds a trailing chevron.' },
    label: { control: 'text', description: 'Projected text: names what is late or left out.' },
  },
};

export default meta;
type Story = StoryObj<StaleLinkArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: '1 cours en retard' })).toBeVisible();
  },
};

export const WithChevron: Story = {
  args: { chevron: true, label: '1 ligne sans cours, non comptée' },
};
