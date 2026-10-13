import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { UiIconToggle } from './icon-toggle';

const SVG_OPEN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="block size-[22px] lg:size-5">';

const EYE = `${SVG_OPEN}<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>`;

const EYE_OFF = `${SVG_OPEN}<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></svg>`;

const rest = `<button uiIconToggle aria-label="Masquer les montants" [attr.aria-pressed]="false">${EYE}</button>`;
const pressed = `<button uiIconToggle aria-label="Afficher les montants" [attr.aria-pressed]="true">${EYE_OFF}</button>`;

const PHONE = { viewport: { width: 390, height: 240 } };
const DESKTOP = { viewport: { width: 1440, height: 240 } };
const LIGHT = { themes: { themeOverride: 'light' } };
const DARK = { themes: { themeOverride: 'dark' } };

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
  label also changes with the state ("Masquer" / "Afficher"), a screen reader reads both.
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

export const Rest: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Masquer les montants' });

    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toHaveAttribute('type', 'button');
    await expect(getComputedStyle(button).backgroundImage).toBe('none');
  },
};

export const Pressed: Story = {
  render: () => ({ template: pressed }),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Afficher les montants' });

    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(getComputedStyle(button).backgroundImage).not.toBe('none');
  },
};

export const Toggles: Story = {
  render: () => ({
    props: { hidden: false },
    template: `<button uiIconToggle [attr.aria-label]="hidden ? 'Afficher les montants' : 'Masquer les montants'" [attr.aria-pressed]="hidden" (click)="hidden = !hidden">${EYE}</button>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Masquer les montants' }));

    await expect(canvas.getByRole('button', { name: 'Afficher les montants' })).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();

    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};

export const HoverPressed: Story = {
  render: () => ({ template: pressed }),
  play: Hover.play,
};

export const RestPhoneLight: Story = { parameters: { ...PHONE, ...LIGHT } };
export const RestPhoneDark: Story = { parameters: { ...PHONE, ...DARK } };
export const RestDesktopLight: Story = { parameters: { ...DESKTOP, ...LIGHT } };
export const RestDesktopDark: Story = { parameters: { ...DESKTOP, ...DARK } };

export const PressedPhoneLight: Story = { render: Pressed.render, parameters: { ...PHONE, ...LIGHT } };
export const PressedPhoneDark: Story = { render: Pressed.render, parameters: { ...PHONE, ...DARK } };
export const PressedDesktopLight: Story = { render: Pressed.render, parameters: { ...DESKTOP, ...LIGHT } };
export const PressedDesktopDark: Story = { render: Pressed.render, parameters: { ...DESKTOP, ...DARK } };

export const FocusPhoneDark: Story = { ...Focus, parameters: { ...PHONE, ...DARK } };
export const FocusDesktopLight: Story = { ...Focus, parameters: { ...DESKTOP, ...LIGHT } };

export const HoverDesktopLight: Story = { ...Hover, parameters: { ...DESKTOP, ...LIGHT } };
export const HoverDesktopDark: Story = { ...Hover, parameters: { ...DESKTOP, ...DARK } };
export const HoverPressedDesktopLight: Story = { ...HoverPressed, parameters: { ...DESKTOP, ...LIGHT } };
export const HoverPressedDesktopDark: Story = { ...HoverPressed, parameters: { ...DESKTOP, ...DARK } };
