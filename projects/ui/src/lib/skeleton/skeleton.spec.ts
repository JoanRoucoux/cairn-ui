import { render, screen } from '@testing-library/angular';

import { type SkeletonShape, UiSkeleton } from './skeleton';

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

  it('pulses through the duration and curve tokens, so reduced motion silences it without a media query here', async () => {
    const { container } = await render('<ui-skeleton />', { imports: [UiSkeleton] });
    const bar = container.querySelector<HTMLElement>('ui-skeleton > span');

    expect(bar?.style.animation).toBe('cairn-pulse var(--pulse-duration) var(--ease-out) infinite alternate');
  });

  it.each<[SkeletonShape, string]>([
    ['figure', 'h-11'],
    ['row', 'h-14'],
    ['chart', 'h-48'],
    ['ring', 'rounded-pill'],
  ])('draws the %s shape', async (shape, expectedClass) => {
    const { fixture } = await render('<ui-skeleton [shape]="shape" />', {
      imports: [UiSkeleton],
      componentProperties: { shape },
    });

    expect(fixture.nativeElement.querySelector('span')).toHaveClass(expectedClass);
  });

  it('defaults to the text shape, which keeps the lines and height behaviour', async () => {
    const { container } = await render('<ui-skeleton [lines]="2" />', { imports: [UiSkeleton] });

    expect(container.querySelectorAll('ui-skeleton > span')).toHaveLength(2);
  });
});
