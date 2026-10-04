import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  ASYNC_ALIGNS,
  ASYNC_STATES,
  ASYNC_VARIANTS,
  type AsyncAlign,
  type AsyncState,
  type AsyncVariant,
  UiAsync,
} from './async';

type AsyncArgs = {
  title: string;
  state: AsyncState;
  errorTitle: string;
  errorMessage: string;
  retryLabel: string;
  retryIcon: boolean;
  variant: AsyncVariant;
  align: AsyncAlign;
  card: boolean;
  fill: boolean;
  retry: () => void;
};

const meta: Meta<AsyncArgs> = {
  title: 'Feedback/Async',
  decorators: [moduleMetadata({ imports: [UiAsync] })],
  parameters: {
    docs: {
      description: {
        component: `The three states of a block that depends on a service call: a loading skeleton, an error
shown in place with a retry button, or an empty state. Whichever state is active, the block's own
title stays visible above it — that title is not part of this component, the caller renders it.

One call, one block, its three states: a call that fails never erases the rest of the screen.

The error block has four looks. \`elevated\` (the default) is a tinted box with the token line heights.
\`plain\` has no surface and the normal line height, for a block that sits in a card or a table the
screen already draws. \`emphasis\` is a heading, a longer message and a primary retry button, for a
list that is the whole page. \`inline\` is one row, message left and retry right, for a failure
inside a form. \`align\` centres the block (\`auto\`: from 64rem), \`card\` draws a card around it and
\`fill\` makes it fill a host the screen sizes.

#### When to use

* Around any content that comes from an HTTP call: a total, a chart, a list.
* When two blocks on the same screen depend on different calls: give each its own \`ui-async\`, so
  one failing never hides the other.

#### When not to use

* Around content that never depends on a call, such as static labels or client-side computed
  values.
* For a full-page error. \`ui-async\` covers one block; a screen where every block failed shows its
  own page-level error instead.

#### Accessibility

* The host carries \`aria-busy="true"\` while loading.
* The error block is \`role="alert"\` inside an \`aria-live="polite"\` region, so assistive technology
  announces it as soon as it appears.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="rounded-container box-content flex w-[300px] flex-col gap-2.5 bg-(--card) p-4 shadow-[inset_0_0_0_1px_var(--border)]">
        <span class="text-title font-semibold">{{ title }}</span>
        <ui-async [state]="state" [errorTitle]="errorTitle" [errorMessage]="errorMessage" [retryLabel]="retryLabel" [retryIcon]="retryIcon" [variant]="variant" [align]="align" [card]="card" [fill]="fill" (retry)="retry()">
          <div asyncLoading class="flex flex-col gap-2.5">
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-30"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
            <div class="flex justify-between py-1.5"><span class="rounded-control block h-4 bg-(--muted) w-[110px]"></span><span class="rounded-control block h-4 bg-(--muted) w-[90px]"></span></div>
          </div>
          <div asyncEmpty class="rounded-control flex flex-col items-start gap-2 bg-(--background) p-4">
            <span class="text-label text-(--muted-foreground)">Ce compte n'a encore aucune ligne. Ajoutez un titre ou importez un CSV.</span>
            <button type="button" class="rounded-control text-label h-9 bg-(--card) px-3 font-medium shadow-[inset_0_0_0_1px_var(--border)]">Ajouter une ligne</button>
          </div>
          <span class="text-body font-medium tabular-nums">8 592,00 €</span>
        </ui-async>
      </div>
    `,
  }),
  args: {
    title: 'Par enveloppe',
    state: 'ready',
    errorTitle: "Les enveloppes n'ont pas pu être chargées",
    errorMessage: "Le serveur n'a pas répondu.",
    retryLabel: 'Réessayer',
    retryIcon: true,
    variant: 'elevated',
    align: 'start',
    card: false,
    fill: false,
    retry: fn(),
  },
  argTypes: {
    title: { control: 'text', description: "The block's own title, rendered by the caller above the three states." },
    state: { control: 'inline-radio', options: [...ASYNC_STATES], description: 'Which slot is currently shown.' },
    errorTitle: { control: 'text', description: 'Error state title, next to the block name.' },
    errorMessage: { control: 'text', description: 'Error state detail sentence.' },
    retryLabel: { control: 'text', description: 'Label of the retry button.' },
    retryIcon: {
      control: 'boolean',
      description:
        'Draws the rotate icon in the retry button (default). Turn it off for a text-only retry, as in a per-source search error.',
    },
    variant: {
      control: 'inline-radio',
      options: [...ASYNC_VARIANTS],
      description:
        'Look of the error block: `elevated` tinted box, `plain` no surface, `emphasis` heading and primary retry, `inline` one row.',
    },
    align: {
      control: 'inline-radio',
      options: [...ASYNC_ALIGNS],
      description: 'Alignment of the error block. `auto` is the start below 64rem and centred from 64rem.',
    },
    card: {
      control: 'boolean',
      description: 'The error block draws its own card (background, container radius, hairline).',
    },
    fill: {
      control: 'boolean',
      description: 'The error block fills its host and centres vertically; the host sets the minimum height.',
    },
    retry: { description: 'Emitted when the retry button is pressed. Only that block reloads.' },
  },
};

export default meta;
type Story = StoryObj<AsyncArgs>;

export const Ready: Story = {};

export const Loading: Story = {
  args: { state: 'loading' },
};

export const DelayedSkeleton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The skeleton appears only once a call has lasted 150 ms and stays at least 400 ms. The 100 ms call never shows it, the 300 ms call shows it until 550 ms.',
      },
    },
  },
  render: () => ({
    props: {
      state: 'ready' as AsyncState,
      run(duration: number): void {
        this.state = 'loading';
        setTimeout(() => (this.state = 'ready'), duration);
      },
    },
    template: `
      <button type="button" class="text-label" (click)="run(100)">Appel de 100 ms</button>
      <button type="button" class="text-label ml-3" (click)="run(300)">Appel de 300 ms</button>
      <ui-async [state]="state" class="mt-3 block">
        <span asyncLoading>Chargement</span>
        <span>Contenu</span>
      </ui-async>
    `,
  }),
};

export const Empty: Story = {
  args: { state: 'empty' },
};

export const Error: Story = {
  args: { state: 'error' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Réessayer' }));
    await expect(args.retry).toHaveBeenCalledOnce();
  },
};

type Screen = {
  title: string;
  message?: string;
  width: number;
  attrs?: string;
  wrapper?: string;
  host?: string;
  surface?: 'card' | 'background';
};

const screen = (name: string, spec: Screen): Story => ({
  name,
  parameters: { layout: 'padded' },
  render: () => ({
    template: `
      <div data-frame class="p-2 ${spec.surface === 'background' ? 'bg-(--background)' : 'bg-(--card)'} ${spec.wrapper ?? ''}" style="width: ${spec.width + 16}px">
        <ui-async state="error" errorTitle="${spec.title}" errorMessage="${spec.message ?? "Le serveur n'a pas répondu."}" retryLabel="Réessayer" ${spec.attrs ?? ''} class="${spec.host ?? ''}" />
      </div>`,
  }),
});

export const ElevatedTotalPhone: Story = screen('Dashboard total, phone (elevated)', {
  title: "Le total n'a pas pu être chargé",
  width: 326,
});

export const ElevatedTotalDesktop: Story = screen('Dashboard total, desktop (elevated)', {
  title: "Le total n'a pas pu être chargé",
  width: 688,
});

export const CurveFillPhone: Story = screen('Dashboard curve, phone (center, fill)', {
  title: "La courbe n'a pas pu être chargée",
  width: 326,
  attrs: 'align="center" fill',
  host: 'min-h-63',
});

export const CurveFillDesktop: Story = screen('Dashboard curve, desktop (center, fill)', {
  title: "La courbe n'a pas pu être chargée",
  width: 688,
  attrs: 'align="center" fill',
  host: 'min-h-93',
});

export const ElevatedAutoAllocation: Story = screen('Repartition, phone and desktop (elevated, auto)', {
  title: "La répartition par classe n'a pas pu être chargée",
  width: 326,
  attrs: 'align="auto"',
  wrapper: 'lg:w-[516px]!',
});

export const PlainCard: Story = screen('Comptes, phone (plain, card)', {
  title: "Les comptes n'ont pas pu être chargés",
  width: 358,
  attrs: 'variant="plain" card',
  surface: 'background',
});

export const PlainCentered: Story = screen('Comptes, desktop (plain, center)', {
  title: "Les comptes n'ont pas pu être chargés",
  width: 1088,
  attrs: 'variant="plain" align="center"',
});

export const PlainAuto: Story = screen('Comptes, phone and desktop (plain, auto)', {
  title: "Les comptes n'ont pas pu être chargés",
  width: 358,
  attrs: 'variant="plain" align="auto"',
  wrapper: 'lg:w-[1104px]! max-lg:bg-(--background)!',
  host: 'block max-lg:rounded-container max-lg:bg-(--card) max-lg:shadow-[inset_0_0_0_1px_var(--border)]',
});

export const EmphasisCard: Story = screen('Lignes, phone (emphasis, card)', {
  title: "Les lignes n'ont pas pu être chargées",
  message: "Le serveur n'a pas répondu. Vérifiez la connexion, puis réessayez.",
  width: 358,
  attrs: 'variant="emphasis" card',
  surface: 'background',
});

export const EmphasisCentered: Story = screen('Lignes, desktop (emphasis, center)', {
  title: "Les lignes n'ont pas pu être chargées",
  message: "Le serveur n'a pas répondu. Vérifiez la connexion, puis réessayez.",
  width: 1088,
  attrs: 'variant="emphasis" align="center"',
});

export const InlineSearch: Story = screen('Ajouter une ligne, search (inline)', {
  title: '',
  message: "La recherche en ligne n'a pas répondu.",
  width: 350,
  attrs: 'variant="inline"',
});

export const InlineSearchNoIcon: Story = {
  ...screen('Ajouter une ligne, per-source retry (inline, no icon)', {
    title: '',
    message: "Yahoo Finance n'a pas répondu.",
    width: 350,
    attrs: 'variant="inline" [retryIcon]="false"',
  }),
  play: async ({ canvasElement }) => {
    const retry = within(canvasElement).getByRole('button', { name: 'Réessayer' });

    await expect(retry.querySelector('svg')).toBeNull();
    await expect(getComputedStyle(retry).paddingLeft).toBe('12px');
  },
};
