import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

const meta: Meta = {
  title: 'Foundations/Type scale',
  parameters: {
    docs: {
      description: {
        component: `The six \`text-{size}\` utilities registered by \`theme.css\`. Each one sets its size, its line height and
its tracking, so a size switched at a breakpoint (\`text-caption lg:text-label\`) takes the tracking of the new size
with no reset.

#### When to use

* For every text in the interface: the sizes and their roles are listed on the Typography page.

#### When not to use

* With a \`tracking-*\` utility to undo a size's tracking: each size already carries its own.

#### Accessibility

* \`text-caption\` opens up by 0.01em to stay legible at 12px; the other sizes keep the font's own spacing or
  tighten the display sizes.`,
      },
    },
  },
  render: () => ({
    template: `
      <div class="flex flex-col gap-2 p-4">
        <span class="text-caption">text-caption</span>
        <span class="text-label">text-label</span>
        <span class="text-body">text-body</span>
        <span class="text-title">text-title</span>
        <span class="text-heading">text-heading</span>
        <span class="text-display">text-display</span>
        <p class="text-caption lg:text-label text-(--subtle-foreground)">Caption under 64rem, label from 64rem</p>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj;

const tracking = (canvasElement: HTMLElement, text: string): string =>
  getComputedStyle(within(canvasElement).getByText(text)).letterSpacing;

export const SwitchedToLabelOnDesktop: Story = {
  name: 'Caption then label at 1440, tracking normal',
  parameters: { viewport: { width: 1440, height: 900 } },
  play: async ({ canvasElement }) => {
    await expect(tracking(canvasElement, 'text-label')).toBe('normal');
    await expect(tracking(canvasElement, 'Caption under 64rem, label from 64rem')).toBe('normal');
  },
};

export const CaptionOnIphone: Story = {
  name: 'Caption at 390, tracking 0.01em',
  parameters: { viewport: { width: 390, height: 844 } },
  play: async ({ canvasElement }) => {
    await expect(tracking(canvasElement, 'Caption under 64rem, label from 64rem')).toBe('0.12px');
  },
};
