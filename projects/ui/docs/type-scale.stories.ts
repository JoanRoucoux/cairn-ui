import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

const DESKTOP = {
  globals: { viewport: { value: '1440x900', isRotated: false } },
  parameters: {
    viewport: { options: { '1440x900': { name: '1440 x 900', styles: { width: '1440px', height: '900px' } } } },
  },
};

const PHONE = {
  globals: { viewport: { value: '390x844', isRotated: false } },
  parameters: {
    viewport: { options: { '390x844': { name: '390 x 844', styles: { width: '390px', height: '844px' } } } },
  },
};

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
  tags: ['!dev', '!autodocs'],
  name: 'Caption then label at 1440, tracking normal',
  ...DESKTOP,
  play: async ({ canvasElement }) => {
    await expect(tracking(canvasElement, 'text-label')).toBe('normal');
    await expect(tracking(canvasElement, 'Caption under 64rem, label from 64rem')).toBe('normal');
  },
};

export const CaptionOnIphone: Story = {
  tags: ['!dev', '!autodocs'],
  name: 'Caption at 390, tracking 0.01em',
  ...PHONE,
  play: async ({ canvasElement }) => {
    await expect(tracking(canvasElement, 'Caption under 64rem, label from 64rem')).toBe('0.12px');
  },
};
