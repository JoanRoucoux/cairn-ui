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

  it('honors the requested height', async () => {
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
    ['figure', 'w-65'],
    ['row', 'h-14'],
    ['chart', 'min-h-50'],
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

  it('fills a sized host with the chart, from a 200px floor', async () => {
    const { fixture } = await render('<ui-skeleton shape="chart" />', { imports: [UiSkeleton] });

    expect(fixture.nativeElement.querySelector('span')).toHaveClass('flex-1', 'min-h-50');
  });

  it('draws the ring 232px wide by default, on the donut track geometry', async () => {
    const { fixture } = await render('<ui-skeleton shape="ring" />', { imports: [UiSkeleton] });
    const ring = fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    const track = ring.querySelector('circle') as SVGCircleElement;

    expect(ring.style.width).toBe('232px');
    expect(ring.style.height).toBe('232px');
    expect(ring.style.animation).toBe('cairn-pulse var(--pulse-duration) var(--ease-out) infinite alternate');
    expect(ring.getAttribute('viewBox')).toBe('0 0 200 200');
    expect(track.getAttribute('r')).toBe('78');
    expect(track.getAttribute('stroke-width')).toBe('30');
    expect(track).toHaveClass('stroke-(--muted)');
  });

  it('sizes the ring from its size input', async () => {
    const { fixture } = await render('<ui-skeleton shape="ring" [size]="240" />', { imports: [UiSkeleton] });

    expect((fixture.nativeElement.querySelector('svg') as SVGSVGElement).style.width).toBe('240px');
  });

  it('draws the figure 260 by 40', async () => {
    const { fixture } = await render('<ui-skeleton shape="figure" />', { imports: [UiSkeleton] });

    expect(fixture.nativeElement.querySelector('span')).toHaveClass('h-10', 'w-65');
  });

  it('draws the row as a title and a caption bar on the left and an amount bar on the right', async () => {
    const { fixture } = await render('<ui-skeleton shape="row" />', { imports: [UiSkeleton] });
    const row = fixture.nativeElement.querySelector('ui-skeleton > span');

    expect(row).toHaveClass('justify-between');
    expect(row.querySelectorAll('span')).toHaveLength(4);
    expect(row.lastElementChild).toHaveClass('w-[90px]', 'h-4');
  });

  it('defaults to the text shape, which keeps the lines and height behavior', async () => {
    const { container } = await render('<ui-skeleton [lines]="2" />', { imports: [UiSkeleton] });

    expect(container.querySelectorAll('ui-skeleton > span')).toHaveLength(2);
  });

  it('draws the dot as a 12px pulsing disc', async () => {
    const { fixture } = await render('<ui-skeleton shape="dot" />', { imports: [UiSkeleton] });
    const dot = fixture.nativeElement.querySelector('ui-skeleton > span');

    expect(fixture.nativeElement.querySelectorAll('ui-skeleton > span')).toHaveLength(1);
    expect(dot).toHaveClass('size-3', 'rounded-pill', 'bg-(--muted)');
    expect(dot.style.animation).toContain('cairn-pulse');
  });
});
