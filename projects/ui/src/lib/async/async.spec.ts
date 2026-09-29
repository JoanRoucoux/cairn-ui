import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiAsync } from './async';

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
});
