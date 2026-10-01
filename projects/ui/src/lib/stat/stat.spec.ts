import { type RenderResult, render, screen } from '@testing-library/angular';

import { type StatSize, UiStat } from './stat';

const renderStat = (size?: StatSize): Promise<RenderResult<unknown>> =>
  render(
    `<ui-stat label="Net worth" [size]="size">
       <span uiStatValue>128,656 EUR</span>
       <span uiStatDelta>+316.54 EUR</span>
       <span uiStatCaption>today</span>
       <span uiStatAside>Sparkline</span>
     </ui-stat>`,
    { imports: [UiStat], componentProperties: { size } },
  );

describe('UiStat', () => {
  it('renders the label', async () => {
    await renderStat();

    expect(screen.getByText('Net worth')).toBeInTheDocument();
  });

  it('projects the value, delta, caption and aside slots', async () => {
    await renderStat();

    expect(screen.getByText('128,656 EUR')).toBeInTheDocument();
    expect(screen.getByText('+316.54 EUR')).toBeInTheDocument();
    expect(screen.getByText('today')).toBeInTheDocument();
    expect(screen.getByText('Sparkline')).toBeInTheDocument();
  });

  it('renders without the optional delta and aside slots', async () => {
    await render(
      `<ui-stat label="Net worth">
         <span uiStatValue>128,656 EUR</span>
       </ui-stat>`,
      { imports: [UiStat] },
    );

    expect(screen.getByText('128,656 EUR')).toBeInTheDocument();
  });

  it.each<[StatSize, string]>([
    ['hero', 'text-display'],
    ['tile', 'text-title'],
  ])('sizes the %s value accordingly', async (size, expectedClass) => {
    const { container } = await renderStat(size);

    expect(container.querySelector('dd')).toHaveClass(expectedClass);
  });

  it.each<[StatSize, string]>([
    ['hero', 'font-medium'],
    ['tile', 'font-normal'],
  ])('sets the %s label to %s on the muted color', async (size, weight) => {
    const { container } = await renderStat(size);

    expect(container.querySelector('dt')).toHaveClass(weight, 'text-(--muted-foreground)');
  });

  it.each<[StatSize, string]>([
    ['hero', 'gap-1'],
    ['tile', 'gap-0.5'],
  ])('stacks the %s label, value and delta on %s', async (size, gap) => {
    const { container } = await renderStat(size);

    expect(container.querySelector('dl')).toHaveClass(gap);
    expect(container.querySelector('dl')?.parentElement).toHaveClass(gap);
  });

  it.each<[StatSize, string]>([
    ['hero', 'tracking-(--tracking-display)'],
    ['tile', 'tabular-nums'],
  ])('sets %s value typography %s', async (size, expectedClass) => {
    const { container } = await renderStat(size);

    expect(container.querySelector('dd')).toHaveClass(expectedClass);
  });

  it('never sets tabular-nums on the hero value', async () => {
    const { container } = await renderStat('hero');

    expect(container.querySelector('dd')).not.toHaveClass('tabular-nums');
  });
});
