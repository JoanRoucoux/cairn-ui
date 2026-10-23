import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiIconToggle } from './icon-toggle';

const SVG_OPEN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="block size-[22px] lg:size-5">';

const EYE = `${SVG_OPEN}<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>`;

const EYE_OFF = `${SVG_OPEN}<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>`;

const rest = `<button uiIconToggle aria-label="Hide amounts" [attr.aria-pressed]="false">${EYE}</button>`;
const pressed = `<button uiIconToggle aria-label="Show amounts" [attr.aria-pressed]="true">${EYE_OFF}</button>`;

const meta: Meta = {
  title: 'Inputs/Icon toggle',
  decorators: [moduleMetadata({ imports: [UiIconToggle] })],
  parameters: {
    docs: {
      description: {
        component: `Round icon button that switches something on and off. It is the header eye that hides the
amounts: the icon changes from an eye to a crossed-out eye and the button takes a soft fill.

#### When to use

* For an action taken at a precise moment and reversed later, when it must stay one gesture away from every
  screen.

#### When not to use

* For a setting that is not toggled every day: use a \`ui-switch\` in a form.
* For an action that is not reversible, or that has no on/off state: use a \`ui-button size="icon"\`.

#### Accessibility

* The host stays a native \`<button>\`, with \`type="button"\` unless one is set.
* It has no visible text: give it an \`aria-label\`. The state is \`aria-pressed\`, which the consumer sets; when the
  label also changes with the state (“Hide” / “Show”), a screen reader reads both.
* The pressed fill is the \`--soft\` token, drawn as a background image so a fine-pointer hover (\`--glow\`) never
  replaces it. The fill changes at once: only the press scale transitions.
* 44px on a touch screen, 40px from 64rem.`,
      },
    },
  },
  render: () => ({ template: rest }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Rest: Story = {
  name: 'Rest has no fill',
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Hide amounts' });

    await expect(getComputedStyle(button).backgroundImage).toBe('none');
  },
};

export const Pressed: Story = {
  render: () => ({ template: pressed }),
};

export const PressedFill: Story = {
  name: 'Pressed has a soft fill',
  tags: ['!dev', '!autodocs'],
  render: () => ({ template: pressed }),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Show amounts' });

    await expect(getComputedStyle(button).backgroundImage).not.toBe('none');
  },
};
