import { render, screen } from '@testing-library/angular';

import { UiSkeleton } from './skeleton';

describe('UiSkeleton', () => {
  it('draws a single bar by default', async () => {
    const { container } = await render('<ui-skeleton />', { imports: [UiSkeleton] });

    expect(container.querySelectorAll('ui-skeleton > span')).toHaveLength(1);
  });

  it('draws one bar per requested line', async () => {
    const { container } = await render('<ui-skeleton [lines]="4" />', { imports: [UiSkeleton] });

    expect(container.querySelectorAll('ui-skeleton > span')).toHaveLength(4);
  });

  it('shortens the last bar so that it reads as a paragraph', async () => {
    const { container } = await render('<ui-skeleton [lines]="3" />', { imports: [UiSkeleton] });

    const bars = [...container.querySelectorAll<HTMLElement>('ui-skeleton > span')];

    expect(bars.at(-1)?.style.width).toBe('62%');
    expect(bars[0]?.style.width).toBe('100%');
  });

  it('keeps a single bar at full width', async () => {
    const { container } = await render('<ui-skeleton />', { imports: [UiSkeleton] });

    expect(container.querySelector<HTMLElement>('ui-skeleton > span')?.style.width).toBe('100%');
  });

  it('honours the requested height', async () => {
    const { container } = await render('<ui-skeleton [height]="200" />', { imports: [UiSkeleton] });

    expect(container.querySelector<HTMLElement>('ui-skeleton > span')?.style.height).toBe('200px');
  });

  it('hides itself from assistive technology', async () => {
    const { container } = await render('<ui-skeleton />', { imports: [UiSkeleton] });

    expect(container.querySelector('ui-skeleton')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('applies the motion-safe pulse class', async () => {
    const { container } = await render('<ui-skeleton />', { imports: [UiSkeleton] });

    expect(container.querySelector('ui-skeleton > span')).toHaveClass('motion-safe:animate-pulse');
  });
});
