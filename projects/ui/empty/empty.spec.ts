import { signal } from '@angular/core';

import { UiAnnouncer } from '@joanroucoux/cairn-ui/announcer';
import { render, screen } from '@testing-library/angular';

import { UiEmpty } from './empty';

describe('UiEmpty', () => {
  const markup = `
    <ui-empty heading="No holding matches “zzz”" hint="Search covers the name and the ISIN.">
      <button type="button">Add a holding</button>
    </ui-empty>`;

  it('shows the title and the hint', async () => {
    await render(markup, { imports: [UiEmpty] });

    expect(screen.getByText('No holding matches “zzz”')).toHaveClass('text-body', 'font-medium', 'text-pretty');
    expect(screen.getByText('Search covers the name and the ISIN.')).toHaveClass(
      'text-label',
      'text-(--muted-foreground)',
    );
  });

  it('projects the action below the text', async () => {
    await render(markup, { imports: [UiEmpty] });

    expect(screen.getByRole('button', { name: 'Add a holding' })).toBeInTheDocument();
  });

  it('is centered with 24 px of padding, 48 px from 64rem', async () => {
    const { container } = await render(markup, { imports: [UiEmpty] });

    expect(container.querySelector('ui-empty')).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'text-center',
      'gap-1.5',
      'px-2',
      'py-6',
      'lg:py-12',
    );
  });

  it('omits the hint and leaves the action slot empty when absent', async () => {
    const { container } = await render('<ui-empty heading="Nothing" />', { imports: [UiEmpty] });
    const host = container.querySelector('ui-empty')!;

    expect(host).toHaveTextContent(/^Nothing$/);
    expect(screen.queryByRole('button')).toBeNull();
    expect(host.lastElementChild).not.toBe(screen.getByText('Nothing'));
    expect(host.lastElementChild).toBeEmptyDOMElement();
  });

  describe('announce', () => {
    const renderAnnounced = async (
      source: string,
      componentProperties: Record<string, unknown> = {},
    ): Promise<{ announce: ReturnType<typeof vi.fn>; fixture: { whenStable: () => Promise<unknown> } }> => {
      const announce = vi.fn();
      const { fixture } = await render(source, {
        imports: [UiEmpty],
        providers: [{ provide: UiAnnouncer, useValue: { announce } }],
        componentProperties,
      });
      await fixture.whenStable();

      return { announce, fixture };
    };

    it('stays silent by default', async () => {
      const { announce } = await renderAnnounced('<ui-empty heading="Nothing" hint="Try again" />');

      expect(announce).not.toHaveBeenCalled();
    });

    it('announces the heading and the hint when it appears', async () => {
      const { announce } = await renderAnnounced(
        '<ui-empty announce heading="No holding matches “zzz”" hint="Search covers the name and the ISIN." />',
      );

      expect(announce).toHaveBeenCalledExactlyOnceWith(
        'No holding matches “zzz”. Search covers the name and the ISIN.',
      );
    });

    it('announces the heading alone without a hint', async () => {
      const { announce } = await renderAnnounced('<ui-empty announce heading="Nothing" />');

      expect(announce).toHaveBeenCalledExactlyOnceWith('Nothing');
    });

    it('announces again when the heading or the hint changes', async () => {
      const heading = signal('No holding matches “zzz”');
      const hint = signal('Search covers the name.');
      const { announce, fixture } = await renderAnnounced(
        '<ui-empty announce [heading]="heading()" [hint]="hint()" />',
        { heading, hint },
      );

      heading.set('No holding matches “zzzz”');
      await fixture.whenStable();
      hint.set('Search covers the name and the ISIN.');
      await fixture.whenStable();

      expect(announce).toHaveBeenCalledTimes(3);
      expect(announce).toHaveBeenLastCalledWith('No holding matches “zzzz”. Search covers the name and the ISIN.');
    });
  });
});
