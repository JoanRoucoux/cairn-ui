import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiNavItem } from './nav-item';

type NavItemArgs = {
  active: boolean;
  label: string;
};

const meta: Meta<NavItemArgs> = {
  title: 'Data display/Nav item',
  decorators: [moduleMetadata({ imports: [UiNavItem] })],
  parameters: {
    docs: {
      description: {
        component: `One destination of the sidebar navigation shown from \`64rem\`: Portfolio, Holdings,
Allocation, Accounts. \`ui-tab-bar\` is its counterpart below that width and reuses the same active,
hover, rest and focus states.

The icon is projected in \`[navIcon]\`; cairn-ui carries no icon family of its own, so the app sizes
and colors it (Lucide, stroke 1.75, following the active state's text color through \`currentColor\`).

#### When to use

* For each entry of the sidebar's primary navigation.

#### When not to use

* For a secondary action within a page. Use \`ui-row\` or \`ui-menu\` instead.

#### Accessibility

* \`active\` sets \`aria-current="page"\`, following the [current page pattern](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/).
* Renders on a native \`<a>\`, so keyboard focus and navigation come from the platform.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <a ui-nav-item href="#" [active]="active" class="w-52">
        <svg navIcon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
        {{ label }}
      </a>
    `,
  }),
  args: {
    active: false,
    label: 'Portfolio',
  },
  argTypes: {
    active: {
      control: 'boolean',
      description: 'Sets `aria-current="page"` and the soft background, at once (no fade).',
    },
    label: { control: 'text', description: 'Projected label.' },
  },
};

export default meta;
type Story = StoryObj<NavItemArgs>;

export const Rest: Story = {};

export const Active: Story = {
  args: { active: true },
};

const transitionsDuring = async (element: Element, act: () => Promise<void>): Promise<string[]> => {
  const runs: string[] = [];
  const record = (event: Event): void => {
    runs.push((event as TransitionEvent).propertyName);
  };

  element.addEventListener('transitionrun', record);
  await act();
  await new Promise((resolve) => setTimeout(resolve, 50));
  element.removeEventListener('transitionrun', record);

  return runs;
};

export const ActiveChangeIsImmediate: Story = {
  name: 'Becoming active is immediate, the hover fill still fades',
  render: () => ({
    props: { current: 'portfolio' },
    template: `
      <nav class="flex w-56 flex-col gap-1">
        <a ui-nav-item href="#" [active]="current === 'portfolio'">Portfolio</a>
        <a ui-nav-item href="#" [active]="current === 'holdings'">Holdings</a>
      </nav>
      <button type="button" (click)="current = current === 'portfolio' ? 'holdings' : 'portfolio'">Navigate</button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvasElement.querySelector('nav')!;
    await new Promise((resolve) => setTimeout(resolve, 100));

    const onNavigate = await transitionsDuring(nav, () =>
      userEvent.click(canvas.getByRole('button', { name: 'Navigate' })),
    );
    await expect(canvas.getByRole('link', { name: 'Holdings' })).toHaveAttribute('aria-current', 'page');
    await expect(onNavigate).toEqual([]);

    const style = getComputedStyle(canvas.getByRole('link', { name: 'Portfolio' }));
    await expect(style.transitionProperty).toBe('scale, background-color');
    await expect(style.transitionDuration).toBe('0.12s, 0.18s');
  },
};
