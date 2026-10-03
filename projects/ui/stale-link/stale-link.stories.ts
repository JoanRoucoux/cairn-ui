import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { STALE_LINK_SIZES, type StaleLinkSize, UiStaleLink } from './stale-link';

type StaleLinkArgs = { chevron: boolean; label: string; size: StaleLinkSize };

const meta: Meta<StaleLinkArgs> = {
  title: 'Navigation/Stale link',
  decorators: [moduleMetadata({ imports: [UiStaleLink] })],
  parameters: {
    docs: {
      description: {
        component: `A link in the stale tone, for a caption about data that is late or left out of a total.

#### When to use

* For a caption that leads to the lines concerned: "1 cours en retard", "1 ligne sans cours, non comptée".
* \`size="label"\` (14/20) where the link sits in a 14px line, as the dashboard total draws "1 cours en retard ›"; the default \`caption\` (12/17) elsewhere.

#### When not to use

* For a caption that leads nowhere. Use the stale tone of [Facts](?path=/docs/data-display-facts--docs) or of the table sub line.
* For a link that leaves the application. Use [External link](?path=/docs/navigation-external-link--docs).

#### Accessibility

* A native \`<a>\`: the caption names the destination. The optional chevron is a decoration drawn by CSS, so it is not read.
* Underlined on hover, with a 2px ring on keyboard focus.
* The text keeps its size (12/17, or 14/20 with \`size="label"\`), but a \`::before\` pseudo-element extends the hit area to 44px high (40px with a mouse), centred on the text.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<a uiStaleLink href="#" [chevron]="chevron" [size]="size">{{ label }}</a>`,
  }),
  args: { chevron: false, label: '1 cours en retard', size: 'caption' },
  argTypes: {
    chevron: { control: 'boolean', description: 'Adds a trailing chevron.' },
    label: { control: 'text', description: 'Projected text: names what is late or left out.' },
    size: {
      control: 'inline-radio',
      options: STALE_LINK_SIZES,
      description:
        'Text size: `caption` 12/17 (default) or `label` 14/20, both at weight 500. The hit area stays 44px high (40px with a mouse).',
    },
  },
};

export default meta;
type Story = StoryObj<StaleLinkArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: '1 cours en retard' });
    await expect(link).toBeVisible();

    const box = link.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    await expect(document.elementFromPoint(x, y - 19)).toBe(link);
    await expect(document.elementFromPoint(x, y + 19)).toBe(link);
    await expect(box.height).toBeLessThan(24);
  },
};

export const WithChevron: Story = {
  args: { chevron: true, label: '1 ligne sans cours, non comptée' },
};

export const LabelSize: Story = {
  name: 'Label size (dashboard total)',
  args: { chevron: true, label: '1 cours en retard', size: 'label' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: '1 cours en retard' });
    const style = getComputedStyle(link);

    await expect(style.fontSize).toBe('14px');
    await expect(style.lineHeight).toBe('20px');
    await expect(style.fontWeight).toBe('500');

    const box = link.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    await expect(document.elementFromPoint(x, y - 19)).toBe(link);
    await expect(document.elementFromPoint(x, y + 19)).toBe(link);
    await expect(getComputedStyle(link, '::after').width).toBe('16px');
  },
};
