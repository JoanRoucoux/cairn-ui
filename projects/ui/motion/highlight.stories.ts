import { UiButton } from '@joanroucoux/cairn-ui/button';
import { UiRow } from '@joanroucoux/cairn-ui/row';
import { UiGroupCell, UiTable, UiTd, UiTh, UiTr } from '@joanroucoux/cairn-ui/table';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiHighlight } from './highlight';

const meta: Meta = {
  title: 'Foundations/Highlight',
  decorators: [moduleMetadata({ imports: [UiButton, UiHighlight, UiRow, UiTable, UiTr, UiTh, UiTd, UiGroupCell] })],
  parameters: {
    docs: {
      description: {
        component: `\`[uiHighlight]="token"\` draws the eye to what just changed: it scrolls the element into view when it is
off screen, holds the \`--soft\` fill for 200 ms, then fades back to the element's own background over
\`--duration-highlight\` with \`--ease-out\`. It is the one place where \`background-color\` animates.

#### When to use

* After Buy, Sell, Edit or Add, on the row that changed.
* On arrival at a precise place, on the heading of the account the user came for.
* On \`ui-row\`, \`tr[uiTr]\` (it paints the cells), \`td[ui-group-cell]\` (it paints the band) or any plain element.
* Give the element \`scroll-margin-top\` and \`scroll-margin-bottom\` equal to what is pinned above and below it
  (header, tab bar, action bar): a row hidden under them counts as off screen and is scrolled out.
* For an arrival, scroll to the element at once first (\`scrollIntoView\` in \`afterNextRender\`), then set the
  token: a token present at first render scrolls smoothly from where the page is.
* On a new row with \`animate.enter\`, on the same element: the highlight starts once the enter animation has
  finished, so the row fades in, then lights up.

#### When not to use

* To signal a price going up or down: nothing flashes green or red.
* On page open without a cause: a null token does nothing.

#### Accessibility

* Under \`prefers-reduced-motion: reduce\` the scroll is instant and the fade lasts 600 ms.
* The highlight is decoration only: it carries no information a screen reader would miss.`,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const ROWS = ['Livret A', 'LDDS', 'PEA', 'Assurance vie'];

export const AfterAnAction: Story = {
  render: () => ({
    props: {
      rows: ROWS,
      token: null as unknown,
      target: 'PEA',
      fire(this: { token: unknown }) {
        this.token = {};
      },
    },
    template: `
      <div class="flex w-[340px] flex-col gap-3 p-4">
        <button ui-button type="button" (click)="fire()">Highlight PEA</button>
        @for (row of rows; track row) {
          <a ui-row href="#" [uiHighlight]="row === target ? token : null" [attr.data-testid]="row">{{ row }}</a>
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByTestId('PEA');

    await expect(row.getAnimations()).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Highlight PEA' }));

    await waitFor(() => expect(row.getAnimations().length).toBeGreaterThan(0));
    const effect = row.getAnimations()[0]?.effect as KeyframeEffect;
    await expect(effect.getKeyframes()[0]?.['backgroundColor']).toBeTruthy();
  },
};

export const OnTableRowAndGroupHeading: Story = {
  render: () => ({
    props: {
      token: null as unknown,
      fire(this: { token: unknown }) {
        this.token = {};
      },
    },
    template: `
      <div class="flex w-[560px] flex-col gap-3 p-4">
        <button ui-button type="button" (click)="fire()">Highlight row and heading</button>
        <table uiTable>
          <thead><tr><th uiTh>Name</th><th uiTh numeric>Value</th></tr></thead>
          <tbody>
            <tr uiTr group><td ui-group-cell colspan="2" name="Northwind PEA" meta="PEA" [uiHighlight]="token">11 700,00 €</td></tr>
            <tr uiTr data-testid="tr" [uiHighlight]="token"><td uiTd primary>Amundi MSCI World</td><td uiTd numeric>8 400,00 €</td></tr>
            <tr uiTr><td uiTd primary>Air Liquide</td><td uiTd numeric>3 300,00 €</td></tr>
          </tbody>
        </table>
        <h2 class="text-body m-0 font-semibold" data-testid="heading" [uiHighlight]="token">Plain heading</h2>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Highlight row and heading' }));

    await waitFor(() => expect(canvas.getByTestId('heading').getAnimations().length).toBeGreaterThan(0));
    await expect(canvas.getByTestId('tr').children[0]?.getAnimations().length).toBeGreaterThan(0);
    await expect(canvas.getByTestId('tr').getAnimations()).toHaveLength(0);
  },
};

export const EnterThenHighlight: Story = {
  render: () => ({
    props: {
      rows: ['Livret A', 'LDDS'],
      added: 'PEA',
      token: null as unknown,
      add(this: { rows: string[]; added: string; token: unknown }) {
        this.rows = [...this.rows, this.added];
        this.token = {};
      },
    },
    template: `
      <div class="flex w-[340px] flex-col gap-3 p-4">
        <button ui-button type="button" (click)="add()">Add PEA</button>
        @for (row of rows; track row) {
          <a ui-row href="#" animate.enter="ui-enter-fade" [uiHighlight]="row === added ? token : null" [attr.data-testid]="row">{{ row }}</a>
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ended: string[] = [];
    const onEnd = (event: AnimationEvent): void => {
      if ((event.target as HTMLElement).dataset['testid'] === 'PEA') {
        ended.push(event.animationName);
      }
    };
    document.addEventListener('animationend', onEnd, true);

    await userEvent.click(canvas.getByRole('button', { name: 'Add PEA' }));
    const row = await canvas.findByTestId('PEA');

    await waitFor(() => expect(ended).toContain('cairn-fade-in'));
    await waitFor(() =>
      expect(
        row.getAnimations().some((animation) => {
          const keyframes = (animation.effect as KeyframeEffect).getKeyframes();
          return keyframes[0]?.['backgroundColor'] !== undefined;
        }),
      ).toBe(true),
    );
    await expect(row.classList.contains('ui-enter-fade')).toBe(false);
    document.removeEventListener('animationend', onEnd, true);
  },
};

export const ScrollThenHighlight: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({
    props: {
      rows: Array.from({ length: 40 }, (_, index) => `Line ${index + 1}`),
      token: null as unknown,
      fire(this: { token: unknown }) {
        this.token = {};
      },
    },
    template: `
      <div class="flex w-[340px] flex-col gap-1 p-4">
        <button ui-button type="button" class="sticky top-2 z-10" (click)="fire()">Highlight line 38</button>
        @for (row of rows; track row) {
          <a ui-row href="#" class="scroll-mt-16" [uiHighlight]="row === 'Line 38' ? token : null" [attr.data-testid]="row">{{ row }}</a>
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = canvas.getByTestId('Line 38');

    await expect(target.getBoundingClientRect().top).toBeGreaterThan(window.innerHeight);
    await userEvent.click(canvas.getByRole('button', { name: 'Highlight line 38' }));

    await waitFor(() => expect(target.getAnimations().length).toBeGreaterThan(0), { timeout: 3000 });
    await expect(target.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
  },
};
