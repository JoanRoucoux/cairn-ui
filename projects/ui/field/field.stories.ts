import { UiInput } from '@joanroucoux/cairn-ui/input';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { UiField, UiFieldLeading, UiFieldTrailing } from './field';

type FieldArgs = {
  label: string;
  labelHidden: boolean;
  hint: string;
  error: string;
  unit: string;
  optional: string;
  invalid: boolean;
};

const meta: Meta<FieldArgs> = {
  title: 'Inputs/Field',
  decorators: [moduleMetadata({ imports: [UiField, UiFieldLeading, UiFieldTrailing, UiInput] })],
  parameters: {
    docs: {
      description: {
        component: `Label, hint and error message wrapped around a projected control as a single unit.

The control stays a plain native element such as \`uiInput\` or \`uiSelect\`. The field finds it in
its own projected content and wires the ARIA attributes onto it, instead of replacing it with a
custom component that would have to reimplement every native forms behaviour.

\`unit\` renders a unit such as \`EUR\` or \`parts\` inside the control's right edge. It is decorative
text, not part of the control's value.

\`uiFieldLeading\` marks an element, typically an 18px svg icon, as the control's leading content. It
sits 12px from the left edge, in \`--muted-foreground\`, and the control's text is inset by 38px
(12px padding, 18px icon, 8px gap) to clear it. It is decorative and hidden from assistive technologies.

A field shows a message from one of two places. \`error\` is the caller's own, and always wins. Where
none is set, the field shows the first message among the projected control's \`errors\`, once that
control is touched: Angular's \`[formField]\` fills a \`uiInput\`, \`uiSelect\` or \`uiTextarea\` with its
validation state on its own, so a form field needs no binding here at all.

#### When to use

* Around every form control the user is expected to fill in.
* Whenever a control needs a hint or can show a validation error.
* With \`labelHidden\`, around a control whose purpose the page already makes plain, such as a
  search box above the list it filters. The label is still what a screen reader announces.

#### When not to use

* Around more than one control. One field wires one control.

#### Accessibility

* The label's \`for\` points at the control's id, generated when the control has none, so clicking
  the label focuses the control.
* \`labelHidden\` hides the label from sight only: it stays in the accessibility tree and keeps
  naming the control. A placeholder is not a substitute for it, it disappears as soon as the user types.
* \`hint\` and \`error\` are joined into the control's \`aria-describedby\`.
* A non empty \`error\` marks the control \`aria-invalid\` and renders the message with \`role="alert"\`,
  so a screen reader announces it as soon as it appears.
* A control outside a field shows no message. It has nowhere to put one.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-field [label]="label" [labelHidden]="labelHidden" [hint]="hint" [error]="error" [unit]="unit" [optional]="optional" [invalid]="invalid">
        <input uiInput type="number" step="0.0001" />
      </ui-field>
    `,
  }),
  args: {
    label: 'Average unit cost',
    labelHidden: false,
    hint: '',
    error: '',
    unit: '',
    optional: '',
    invalid: false,
  },
  argTypes: {
    label: { control: 'text', description: "The field's label, wired to the control via `for`/`id`." },
    labelHidden: {
      control: 'boolean',
      description: 'Hides the label from sight while it keeps naming the control for assistive technologies.',
    },
    hint: { control: 'text', description: 'Optional helper text below the control, joined into `aria-describedby`.' },
    error: {
      control: 'text',
      description:
        'Optional validation message. When set, also marks the control `aria-invalid` and renders with `role="alert"`.',
    },
    optional: {
      control: 'text',
      description:
        'Lighter suffix after the label, such as `(facultatif)`. It stays part of the control accessible name.',
    },
    invalid: {
      control: 'boolean',
      description:
        'Marks the control `aria-invalid` without any message, for a failure the form reports elsewhere. A message from `error` or the control marks it too.',
    },
    unit: { control: 'text', description: "Unit shown inside the control's right edge, such as `EUR` or `parts`." },
  },
};

export default meta;
type Story = StoryObj<FieldArgs>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: 'Leave empty if you do not know it.' },
};

export const WithUnit: Story = {
  args: { label: 'Quantity sold', unit: 'parts' },
};

export const WithError: Story = {
  args: { error: 'The price must be positive.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
  },
};

export const LabelHidden: Story = {
  render: () => ({
    template: `
      <ui-field label="Search holdings" labelHidden>
        <input uiInput type="search" placeholder="Instrument or account" />
      </ui-field>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const search = canvas.getByRole('searchbox', { name: 'Search holdings' });
    const label = canvasElement.querySelector('label')!;

    await expect(search).toBeVisible();
    await expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  },
};

export const InARow: Story = {
  render: () => ({
    template: `
      <div class="flex items-start gap-3">
        <ui-field class="grow" label="Quantity">
          <input uiInput type="number" />
        </ui-field>
        <ui-field class="grow" label="Price" error="The price must be positive.">
          <input uiInput type="number" />
        </ui-field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const valid = canvas.getByLabelText('Quantity');
    const refused = canvas.getByLabelText('Price');

    await expect(valid.getBoundingClientRect().top).toBeCloseTo(refused.getBoundingClientRect().top, 0);
  },
};

const SEARCH_ICON = `<svg uiFieldLeading width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`;

export const Recherche: Story = {
  render: () => ({
    template: `
      <div class="flex max-w-sm flex-col gap-6">
        <ui-field label="Rechercher une ligne" labelHidden>
          ${SEARCH_ICON}
          <input uiInput surface="card" type="search" placeholder="Rechercher une ligne" />
        </ui-field>
        <ui-field label="Rechercher une ligne (rempli)" labelHidden>
          ${SEARCH_ICON}
          <input uiInput surface="card" type="search" value="msci world" />
        </ui-field>
        <ui-field label="Rechercher une ligne (focus)" labelHidden>
          ${SEARCH_ICON}
          <input uiInput surface="card" type="search" placeholder="Rechercher une ligne" data-story-focus />
        </ui-field>
        <ui-field label="Rechercher une ligne (désactivé)" labelHidden>
          ${SEARCH_ICON}
          <input uiInput surface="card" type="search" placeholder="Rechercher une ligne" disabled />
        </ui-field>
        <ui-field label="Rechercher une ligne (erreur)" labelHidden error="Saisissez au moins 3 caractères.">
          ${SEARCH_ICON}
          <input uiInput surface="card" type="search" value="ms" />
        </ui-field>
        <ui-field label="Rechercher une ligne (compact)" labelHidden>
          ${SEARCH_ICON}
          <input uiInput surface="card" [size]="'sm'" type="search" placeholder="Rechercher une ligne" />
        </ui-field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const empty = canvas.getByRole('searchbox', { name: 'Rechercher une ligne' });
    const icon = canvasElement.querySelector('svg')!;

    canvasElement.querySelector<HTMLElement>('[data-story-focus]')!.focus();

    await expect(empty).toHaveAttribute('placeholder', 'Rechercher une ligne');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(empty).paddingLeft).toBe('38px');
    await expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(
      empty.getBoundingClientRect().left + parseFloat(getComputedStyle(empty).paddingLeft),
    );
  },
};

const EYE_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>`;

export const SignIn: Story = {
  name: 'Sign-in: xl inputs, trailing action, invalid',
  render: () => ({
    template: `
      <div class="flex max-w-sm flex-col gap-4">
        <ui-field label="Identifiant">
          <input uiInput surface="card" size="xl" value="alex" />
        </ui-field>
        <ui-field label="Mot de passe" invalid>
          <input uiInput surface="card" size="xl" type="password" value="motdepasse" />
          <button uiFieldTrailing type="button" aria-label="Afficher le mot de passe" aria-pressed="false">${EYE_ICON}</button>
        </ui-field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const password = canvas.getByLabelText('Mot de passe');
    const action = canvas.getByRole('button', { name: 'Afficher le mot de passe' });

    await expect(password).toHaveAttribute('aria-invalid', 'true');
    await expect(action.getBoundingClientRect().height).toBe(password.getBoundingClientRect().height);
    await expect(action.getBoundingClientRect().width).toBe(action.getBoundingClientRect().height);
    await expect(parseFloat(getComputedStyle(password).paddingRight)).toBeGreaterThanOrEqual(
      action.getBoundingClientRect().width,
    );
  },
};

export const OptionalSheetForm: Story = {
  name: 'Sheet form: lg inputs, optional suffix',
  render: () => ({
    template: `
      <div class="flex max-w-sm flex-col gap-4">
        <ui-field label="Nom du compte">
          <input uiInput size="lg" placeholder="Livret A" />
        </ui-field>
        <ui-field label="Établissement" optional="(facultatif)">
          <input uiInput size="lg" placeholder="Northwind Bank" />
        </ui-field>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Établissement (facultatif)')).toBeVisible();
  },
};
