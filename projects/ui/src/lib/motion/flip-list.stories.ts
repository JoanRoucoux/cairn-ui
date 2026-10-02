import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { UiButton } from '../button/button';
import { UiListRow } from '../row/row';
import { UiFlipList } from './flip-list';

const meta: Meta = {
  title: 'Foundations/Flip list',
  decorators: [moduleMetadata({ imports: [UiButton, UiFlipList, UiListRow] })],
  parameters: {
    docs: {
      description: {
        component: `\`[uiFlipList]\` on a list container slides the remaining children into place when one is removed or
inserted. It measures every child before and after the change (FLIP), then animates the shift in
\`translateY\` over \`--duration-base\` with \`--ease-out\`.

#### When to use

* On the list of a deletable item: a holding, a passkey. Put \`animate.leave="ui-leave-fade"\` on the item so it fades out first, then the others move up.
* When an item comes back in its place: the ones after it slide down.

#### When not to use

* To reorder or filter a long list: only direct children added or removed are followed.

#### Accessibility

* Under \`prefers-reduced-motion: reduce\` nothing moves: the list closes up at once.`,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const RemoveThenReinsert: Story = {
  render: () => ({
    props: {
      all: ['Livret A', 'LDDS', 'PEA', 'Assurance vie'],
      items: ['Livret A', 'LDDS', 'PEA', 'Assurance vie'],
      remove(this: { items: string[] }) {
        this.items = this.items.filter((item) => item !== 'LDDS');
      },
      restore(this: { items: string[]; all: string[] }) {
        this.items = [...this.all];
      },
    },
    template: `
      <div class="flex w-[340px] flex-col gap-3 p-4">
        <div class="flex gap-2">
          <button ui-button type="button" (click)="remove()">Remove LDDS</button>
          <button ui-button type="button" (click)="restore()">Put it back</button>
        </div>
        <ul uiFlipList class="m-0 list-none p-0" data-testid="list">
          @for (item of items; track item) {
            <li uiListRow class="ui-enter-fade" animate.leave="ui-leave-fade" [attr.data-testid]="item">{{ item }}</li>
          }
        </ul>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pea = canvas.getByTestId('PEA');

    await userEvent.click(canvas.getByRole('button', { name: 'Remove LDDS' }));
    await waitFor(() => expect(canvas.queryByTestId('LDDS')).toBeNull());
    await waitFor(() =>
      expect(
        pea
          .getAnimations()
          .some(
            (animation) =>
              animation instanceof Animation &&
              'transform' in ((animation.effect as KeyframeEffect).getKeyframes()[0] ?? {}),
          ),
      ).toBe(true),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Put it back' }));
    await waitFor(() => expect(canvas.queryByTestId('LDDS')).not.toBeNull());
  },
};
