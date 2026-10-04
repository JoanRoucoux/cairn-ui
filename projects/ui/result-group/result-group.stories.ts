import { UiCard } from '@joanroucoux/cairn-ui/card';
import { UiRow } from '@joanroucoux/cairn-ui/row';
import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { UiResultGroup } from './result-group';

type ResultGroupArgs = {
  label: string;
  hint: string;
  state: 'loading' | 'error' | 'empty' | 'ready';
  errorMessage: string;
  retryLabel: string;
  retry: () => void;
};

const meta: Meta<ResultGroupArgs> = {
  title: 'Data display/Result group',
  decorators: [moduleMetadata({ imports: [UiCard, UiResultGroup, UiRow] })],
  parameters: {
    docs: {
      description: {
        component: `One source of a title search: a heading in two tones (the source in 600 \`--foreground\`, then what its
price is in \`--subtle-foreground\`), and under it the rows the source answered, a two-row skeleton while it
answers, a message when it has nothing, or an inline error with a text-only retry.

It wraps [Async](?path=/docs/feedback-async--docs) in its \`inline\` variant: the group reloads alone, the other
sources stay on screen. Project the rows as the default content (\`ui-row size="dense"\`, an unavailable
foreign-currency row last) and the empty message with the \`resultGroupMessage\` attribute.

#### When to use

* In a search that asks several sources at once, one group per source, inside a bordered list.

#### When not to use

* For a single list: use rows directly. For a failed block that is not a search result, use \`ui-async\`.

#### Accessibility

* The host is \`role="group"\` named by its heading.
* The loading state sets \`aria-busy\`; the error is \`role="alert"\` so a failing source is announced.`,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-card variant="inset" border="hairline" padding="xs" class="w-[350px]">
        <ui-result-group [label]="label" [hint]="hint" [state]="state" [errorMessage]="errorMessage" [retryLabel]="retryLabel" (retry)="retry()">
          <button ui-row size="dense" type="button">
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-body truncate font-medium">Contoso Global Equity UCITS ETF</span>
              <span class="text-caption text-(--subtle-foreground)">CGEQ · Northwind Exchange</span>
            </span>
            <span class="flex flex-none flex-col items-end">
              <span class="text-label font-medium">112,40 €</span>
              <span class="text-caption text-(--subtle-foreground)">en continu</span>
            </span>
          </button>
          <button ui-row size="dense" type="button" unavailable>
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-body truncate font-medium">Woodgrove Holdings</span>
              <span class="text-caption text-(--subtle-foreground)">WGRV · Contoso Exchange</span>
            </span>
            <span class="flex flex-none flex-col items-end">
              <span class="text-label font-medium">Contoso Exchange</span>
              <span class="text-caption text-(--subtle-foreground)">indisponible</span>
            </span>
          </button>
          <span resultGroupMessage>Aucun résultat chez Northwind Markets.</span>
        </ui-result-group>
      </ui-card>
    `,
  }),
  args: {
    label: 'Northwind Markets',
    hint: 'cours en continu',
    state: 'ready',
    errorMessage: "Northwind Markets n'a pas répondu.",
    retryLabel: 'Réessayer',
    retry: fn(),
  },
  argTypes: {
    label: { control: 'text', description: 'The source, in 600 `--foreground`. It names the group.' },
    hint: { control: 'text', description: 'What its price is, in `--subtle-foreground` after the label.' },
    state: {
      control: 'inline-radio',
      options: ['loading', 'error', 'empty', 'ready'],
      description:
        '`ready` shows the projected rows, `loading` the two-row skeleton, `empty` the `resultGroupMessage`, `error` the message and the retry.',
    },
    errorMessage: { control: 'text', description: 'Sentence shown when the source failed.' },
    retryLabel: { control: 'text', description: 'Text-only retry button label.' },
    retry: { description: 'Emitted when the retry is pressed. Only this group reloads.' },
  },
};

export default meta;
type Story = StoryObj<ResultGroupArgs>;

export const Results: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('group', { name: 'Northwind Markets' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Woodgrove Holdings/ })).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Loading: Story = {
  args: { state: 'loading' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('ui-async')).toHaveAttribute('aria-busy', 'true'));
    await waitFor(() => expect(canvasElement.querySelectorAll('ui-async > div > span.flex')).toHaveLength(2));
  },
};

export const Empty: Story = {
  args: { state: 'empty' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Aucun résultat chez Northwind Markets.')).toBeVisible();
  },
};

export const Error: Story = {
  args: { state: 'error' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const retry = await canvas.findByRole('button', { name: 'Réessayer' });

    await expect(retry.querySelector('svg')).toBeNull();
    await userEvent.click(retry);
    await expect(args.retry).toHaveBeenCalledOnce();
  },
};

export const SeveralGroups: Story = {
  name: 'Several groups in one list',
  render: () => ({
    template: `
      <ui-card variant="inset" border="hairline" padding="xs" class="w-[350px]">
        <ui-result-group label="Déjà suivi" hint="dans vos lignes">
          <button ui-row size="dense" type="button">
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="text-body truncate font-medium">Fabrikam Bond Fund</span>
              <span class="text-caption text-(--subtle-foreground)">Northwind PEA</span>
            </span>
          </button>
        </ui-result-group>
        <ui-result-group label="Northwind Markets" hint="cours en continu" state="loading" />
        <ui-result-group label="Contoso Coins" hint="cours en continu" state="error" errorMessage="Contoso Coins n'a pas répondu." retryLabel="Réessayer" />
        <ui-result-group label="Woodgrove Funds" hint="valeur liquidative" state="empty">
          <span resultGroupMessage>Saisissez un ISIN complet, 12 caractères : Woodgrove Funds ne cherche pas par nom.</span>
        </ui-result-group>
      </ui-card>
    `,
  }),
};
