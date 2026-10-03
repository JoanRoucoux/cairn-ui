import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiExternalLink } from './external-link';

type ExternalLinkArgs = { label: string };

const meta: Meta<ExternalLinkArgs> = {
  title: 'Navigation/External link',
  decorators: [moduleMetadata({ imports: [UiExternalLink] })],
  parameters: {
    docs: {
      description: {
        component: `A link that leaves the application: its label followed by an external-link icon.

#### When to use

* For a link to another site, such as the issuer's page for a holding.

#### When not to use

* For navigation inside the application. Use a plain link, [Row](?path=/docs/data-display-row--docs) or
  [Nav item](?path=/docs/data-display-nav-item--docs).

#### Accessibility

* A native \`<a>\`. Add \`target="_blank"\` with \`rel="noopener"\` when it opens a new tab, and name the
  destination in the label ("Fiche sur amundietf.fr").
* The icon is decorative and hidden from assistive technologies.
* The target is 44 px high on touch and the text height with a mouse, which underlines on hover.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<a ui-external-link href="https://amundietf.fr" target="_blank" rel="noopener">{{ label }}</a>`,
  }),
  args: { label: 'Fiche sur amundietf.fr' },
  argTypes: { label: { control: 'text', description: 'Projected text: names the destination.' } },
};

export default meta;
type Story = StoryObj<ExternalLinkArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: 'Fiche sur amundietf.fr' })).toBeVisible();
  },
};
