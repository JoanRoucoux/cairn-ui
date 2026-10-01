import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiAsync } from './async';

type Drawn = {
  host: HTMLElement;
  alert: HTMLElement;
  title: HTMLElement | null;
  message: HTMLElement;
  retry: HTMLElement;
};

describe('UiAsync', () => {
  const template = `
    <ui-async [state]="state" errorTitle="Total could not be loaded" errorMessage="The server did not answer." retryLabel="Retry" (retry)="retried()">
      <span asyncLoading>loading-skeleton</span>
      <span asyncEmpty>nothing yet</span>
      <span>the content</span>
    </ui-async>`;

  it.each([
    ['loading', 'loading-skeleton'],
    ['empty', 'nothing yet'],
    ['ready', 'the content'],
  ])('shows only the %s slot', async (state, visible) => {
    await render(template, { imports: [UiAsync], componentProperties: { state, retried: vi.fn() } });

    expect(screen.getByText(visible)).toBeInTheDocument();
    for (const other of ['loading-skeleton', 'nothing yet', 'the content'].filter((t) => t !== visible)) {
      expect(screen.queryByText(other)).not.toBeInTheDocument();
    }
  });

  it('marks itself busy while loading', async () => {
    const { fixture } = await render(template, {
      imports: [UiAsync],
      componentProperties: { state: 'loading', retried: vi.fn() },
    });

    expect(fixture.nativeElement.querySelector('ui-async')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the error in place and retries only on request', async () => {
    const retried = vi.fn();
    await render(template, { imports: [UiAsync], componentProperties: { state: 'error', retried } });

    expect(screen.getByText('Total could not be loaded')).toBeInTheDocument();
    expect(screen.getByText('The server did not answer.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retried).toHaveBeenCalledTimes(1);
  });

  it('draws the retry button with the rotate-cw icon and 12px of left padding', async () => {
    await render(template, { imports: [UiAsync], componentProperties: { state: 'error', retried: vi.fn() } });

    const button = screen.getByRole('button', { name: 'Retry' });
    const icon = button.querySelector('svg');

    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('width', '18');
    expect(icon?.querySelector('path[d="M21 3v5h-5"]')).not.toBeNull();
    expect(button).toHaveClass('pl-3', 'pr-4');
  });

  it('pads the error box 16px whatever the card inset', async () => {
    await render(template, { imports: [UiAsync], componentProperties: { state: 'error', retried: vi.fn() } });

    expect(screen.getByRole('alert')).toHaveClass('p-4');
  });

  describe('variants', () => {
    const draw = async (attrs: string): Promise<Drawn> => {
      const { fixture } = await render(
        `<ui-async state="error" errorTitle="Title" errorMessage="Message" retryLabel="Retry" ${attrs}></ui-async>`,
        { imports: [UiAsync] },
      );

      return {
        host: fixture.nativeElement.querySelector('ui-async') as HTMLElement,
        alert: screen.getByRole('alert'),
        title: screen.queryByText('Title'),
        message: screen.getByText('Message'),
        retry: screen.getByRole('button', { name: 'Retry' }),
      };
    };

    it('keeps the elevated look by default', async () => {
      const { alert, title, message, retry } = await draw('');

      expect(alert).toHaveClass('bg-(--elevated)', 'rounded-control', 'p-4', 'gap-1', 'items-start');
      expect(title?.tagName).toBe('SPAN');
      expect(title).toHaveClass('text-body', 'font-medium');
      expect(title).not.toHaveClass('leading-[normal]');
      expect(message).toHaveClass('text-label', 'text-(--muted-foreground)');
      expect(retry).toHaveClass('bg-(--card)', 'mt-2');
    });

    it('draws plain without surface and with the normal line height', async () => {
      const { alert, title, message } = await draw('variant="plain"');

      expect(alert).not.toHaveClass('bg-(--elevated)');
      expect(alert).toHaveClass('px-4', 'py-5', 'gap-1');
      expect(title).toHaveClass('text-body', 'font-medium', 'leading-[normal]');
      expect(message).toHaveClass('text-label', 'leading-[normal]', 'text-(--muted-foreground)');
    });

    it('draws emphasis with a heading, a 12px gap and a primary retry', async () => {
      const { alert, title, retry } = await draw('variant="emphasis"');

      expect(alert).toHaveClass('gap-3', 'px-4', 'py-6');
      expect(title?.tagName).toBe('H2');
      expect(title).toHaveClass('text-title', 'font-semibold');
      expect(retry).toHaveClass('bg-(--primary)', 'text-(--primary-foreground)', 'hover:bg-(--primary-to)', 'mt-1');
      expect(retry).not.toHaveClass('bg-(--card)');
    });

    it('draws inline as one row with the message only', async () => {
      const { alert, title, message, retry } = await draw('variant="inline"');

      expect(title).toBeNull();
      expect(alert).toHaveClass('flex-row', 'justify-between', 'gap-3');
      expect(message).toHaveClass('text-label', 'text-(--muted-foreground)');
      expect(retry).toHaveClass('h-11', 'pointer-fine:h-8', 'gap-1.5', 'pl-2.5', 'pr-3');
      expect(retry.querySelector('svg')).toHaveAttribute('width', '16');
    });

    it.each([
      ['elevated', ['px-4', 'py-10']],
      ['plain', ['px-4', 'py-12']],
      ['emphasis', ['px-4', 'py-14']],
    ])('centres %s with its own padding', async (variant, padding) => {
      const { alert } = await draw(`variant="${variant}" align="center"`);

      expect(alert).toHaveClass('items-center', 'text-center', ...padding);
      expect(alert).not.toHaveClass('items-start');
    });

    it.each([
      ['elevated', ['p-4', 'lg:py-10']],
      ['plain', ['px-4', 'py-5', 'lg:py-12']],
      ['emphasis', ['px-4', 'py-6', 'lg:py-14']],
    ])('switches %s to centred from 64rem with align auto', async (variant, padding) => {
      const { alert } = await draw(`variant="${variant}" align="auto"`);

      expect(alert).toHaveClass('items-start', 'lg:items-center', 'lg:text-center', ...padding);
    });

    it('keeps the emphasis message at label size when aligned to the start', async () => {
      const { message, retry } = await draw('variant="emphasis"');

      expect(message).toHaveClass('text-label');
      expect(message).not.toHaveClass('leading-[normal]');
      expect(retry).toHaveClass('mt-1');
    });

    it('uses the body message with a normal line height when emphasis is centred', async () => {
      const { message, retry } = await draw('variant="emphasis" align="center"');

      expect(message).toHaveClass('text-body', 'leading-[normal]');
      expect(retry).toHaveClass('mt-2');
    });

    it('draws its own card on request', async () => {
      const { alert } = await draw('card');

      expect(alert).toHaveClass('bg-(--card)', 'rounded-container', 'shadow-[inset_0_0_0_1px_var(--border)]');
      expect(alert).not.toHaveClass('bg-(--elevated)');
    });

    it('fills and vertically centres in its host while in error', async () => {
      const { host, alert } = await draw('fill');

      expect(host).toHaveClass('flex', 'flex-col');
      expect(alert).toHaveClass('flex-1', 'justify-center');
    });

    it('does not turn the host into a flex column outside the error state', async () => {
      const { fixture } = await render('<ui-async state="ready" fill><span>content</span></ui-async>', {
        imports: [UiAsync],
      });

      expect(fixture.nativeElement.querySelector('ui-async')).not.toHaveClass('flex');
    });

    it('leaves the box unfilled by default', async () => {
      const { alert, host } = await draw('');

      expect(alert).not.toHaveClass('flex-1');
      expect(host).not.toHaveClass('flex');
    });
  });
});
