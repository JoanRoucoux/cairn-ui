import { UiAnnouncer } from '@joanroucoux/cairn-ui/announcer';
import { render, screen } from '@testing-library/angular';

import { UiAlert } from './alert';

const renderWithSpy = async (template: string): Promise<ReturnType<typeof vi.fn>> => {
  const announce = vi.fn();
  await render(template, { imports: [UiAlert], providers: [{ provide: UiAnnouncer, useValue: { announce } }] });

  return announce;
};

describe('UiAlert', () => {
  it('fades in when it appears', async () => {
    await render('<ui-alert>Text</ui-alert>', { imports: [UiAlert] });

    expect(screen.getByRole('alert')).toHaveClass('ui-enter-fade');
  });

  it('shows without motion when fadeIn is off, for an alert present as the page opens', async () => {
    await render('<ui-alert [fadeIn]="false">Text</ui-alert>', { imports: [UiAlert] });

    expect(screen.getByRole('alert')).not.toHaveClass('ui-enter-fade');
  });

  it('is an alert on the card surface by default', async () => {
    await render('<ui-alert>Incorrect username or password.</ui-alert>', { imports: [UiAlert] });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(
      'bg-(--card)',
      'rounded-control',
      'shadow-[inset_0_0_0_1px_var(--border)]',
      'px-3.5',
      'py-3',
    );
    expect(alert).toHaveTextContent('Incorrect username or password.');
  });

  it('draws the circle-alert icon in the negative color, hidden from assistive technology', async () => {
    await render('<ui-alert>Text</ui-alert>', { imports: [UiAlert] });

    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('stroke-width', '1.75');
    expect(icon).toHaveClass('stroke-(--negative)');
    expect(icon?.querySelector('circle')).not.toBeNull();
  });

  it('renders the heading above muted text when one is given', async () => {
    await render('<ui-alert heading="Sign-in failed">Try again.</ui-alert>', { imports: [UiAlert] });

    expect(screen.getByText('Sign-in failed')).toHaveClass('font-medium');
    expect(screen.getByText('Try again.')).toHaveClass('text-(--muted-foreground)');
  });

  it('keeps the text in the foreground color without a heading', async () => {
    await render('<ui-alert>Text</ui-alert>', { imports: [UiAlert] });

    expect(screen.getByText('Text')).not.toHaveClass('text-(--muted-foreground)');
  });

  it('turns the warning variant into a bare inline notice with the triangle icon and no live role', async () => {
    const { container } = await render('<ui-alert variant="warning">This can’t be undone.</ui-alert>', {
      imports: [UiAlert],
    });

    const warning = container.querySelector('ui-alert')!;
    expect(warning).not.toHaveClass('bg-(--card)');
    expect(warning).not.toHaveAttribute('role');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(warning.querySelector('svg')).toHaveClass('stroke-(--negative)');
    expect(warning.querySelector('circle')).toBeNull();
    expect(warning.querySelector('path')).not.toBeNull();
  });

  it('announces a warning once, heading then message, when it appears', async () => {
    const announce = await renderWithSpy(
      '<ui-alert variant="warning" heading="Irreversible">This can’t be undone.</ui-alert>',
    );

    expect(announce).toHaveBeenCalledExactlyOnceWith('Irreversible. This can’t be undone.');
  });

  it('reads nested markup in the message once', async () => {
    const announce = await renderWithSpy('<ui-alert variant="warning">Sell <span>all 310 shares</span>.</ui-alert>');

    expect(announce).toHaveBeenCalledExactlyOnceWith('Sell all 310 shares.');
  });

  it('announces a warning without a heading by its message alone', async () => {
    const announce = await renderWithSpy('<ui-alert variant="warning">This can’t be undone.</ui-alert>');

    expect(announce).toHaveBeenCalledExactlyOnceWith('This can’t be undone.');
  });

  it('stays silent for a warning present as the page opens', async () => {
    const announce = await renderWithSpy('<ui-alert variant="warning" [fadeIn]="false">Text</ui-alert>');

    expect(announce).not.toHaveBeenCalled();
  });

  it('stays silent for a warning with no text', async () => {
    const announce = await renderWithSpy('<ui-alert variant="warning"></ui-alert>');

    expect(announce).not.toHaveBeenCalled();
  });

  it('leaves the error to its own alert role and announces nothing', async () => {
    const announce = await renderWithSpy('<ui-alert>Incorrect username or password.</ui-alert>');

    expect(announce).not.toHaveBeenCalled();
  });
});

describe('UiAlert info', () => {
  it('is a note on the muted surface, not a live region', async () => {
    await render('<ui-alert variant="info">Cairn can’t verify this ISIN before it’s added.</ui-alert>', {
      imports: [UiAlert],
    });

    const note = screen.getByRole('note');
    expect(note).toHaveClass('bg-(--muted)', 'rounded-control', 'p-3', 'text-(--foreground)', 'gap-2.5');
    expect(note).not.toHaveClass('bg-(--card)');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(note).toHaveTextContent('Cairn can’t verify this ISIN before it’s added.');
  });

  it('announces nothing', async () => {
    const announce = await renderWithSpy('<ui-alert variant="info">Text</ui-alert>');

    expect(announce).not.toHaveBeenCalled();
  });

  it('draws the 18 px circle-info icon in the current color, hidden from assistive technology', async () => {
    await render('<ui-alert variant="info">Text</ui-alert>', { imports: [UiAlert] });

    const icon = screen.getByRole('note').querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('height', '18');
    expect(icon).toHaveClass('stroke-current');
    expect(icon?.querySelector('path[d="M12 8h.01"]')).not.toBeNull();
  });
});
