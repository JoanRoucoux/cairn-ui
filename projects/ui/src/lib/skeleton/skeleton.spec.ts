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
    ['figure', 'h-10'],
    ['row', 'h-14'],
    ['chart', 'h-35'],
    ['ring', 'size-30'],
  ])('draws the %s shape', async (shape, expectedClass) => {
    const { fixture } = await render('<ui-skeleton [shape]="shape" />', {
      imports: [UiSkeleton],
      componentProperties: { shape },
    });

    expect(fixture.nativeElement.querySelector('span')).toHaveClass(expectedClass);
  });

  it('draws the chart on the control radius', async () => {
    const { fixture } = await render('<ui-skeleton shape="chart" />', { imports: [UiSkeleton] });

    expect(fixture.nativeElement.querySelector('span')).toHaveClass('rounded-control', 'w-full');
  });

  it('draws the ring as an inset band', async () => {
    const { fixture } = await render('<ui-skeleton shape="ring" />', { imports: [UiSkeleton] });

    expect(fixture.nativeElement.querySelector('span')).toHaveClass(
      'rounded-pill',
      'shadow-[inset_0_0_0_22px_var(--muted)]',
    );
  });

  it('draws the row as a title and a caption bar on the left and an amount bar on the right', async () => {
    const { fixture } = await render('<ui-skeleton shape="row" />', { imports: [UiSkeleton] });
    const row = fixture.nativeElement.querySelector('ui-skeleton > span');

    expect(row).toHaveClass('justify-between');
    expect(row.querySelectorAll('span')).toHaveLength(4);
    expect(row.lastElementChild).toHaveClass('w-[90px]', 'h-4');
  });

  it('defaults to the text shape, which keeps the lines and height behaviour', async () => {
    const { container } = await render('<ui-skeleton [lines]="2" />', { imports: [UiSkeleton] });

    expect(container.querySelectorAll('ui-skeleton > span')).toHaveLength(2);
  });
});
