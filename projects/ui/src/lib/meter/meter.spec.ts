import { type RenderResult, render, screen } from '@testing-library/angular';

import { type MeterTone, UiMeter } from './meter';

const renderMeter = (
  props: Partial<{ value: number; label: string; valueText: string; tone: MeterTone }> = {},
): Promise<RenderResult<unknown>> =>
  render('<ui-meter [value]="value" [label]="label" [valueText]="valueText" [tone]="tone" />', {
    imports: [UiMeter],
    componentProperties: {
      value: 0.463,
      label: 'Funds',
      valueText: '46.3% - 128,656.00 EUR',
      tone: 1 as MeterTone,
      ...props,
    },
  });

describe('UiMeter', () => {
  it('exposes a meter under its label', async () => {
    await renderMeter();

    expect(screen.getByRole('meter', { name: 'Funds' })).toBeInTheDocument();
  });

  it('reports the fraction on the ARIA value attributes', async () => {
    await renderMeter();
    const meter = screen.getByRole('meter', { name: 'Funds' });

    expect(meter).toHaveAttribute('aria-valuenow', '0.463');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '1');
  });

  it('reads out the human text rather than the raw fraction', async () => {
    await renderMeter();

    expect(screen.getByRole('meter', { name: 'Funds' })).toHaveAttribute('aria-valuetext', '46.3% - 128,656.00 EUR');
  });

  it.each<[MeterTone, string]>([
    [1, 'bg-(--ramp-1)'],
    [3, 'bg-(--ramp-3)'],
    [6, 'bg-(--ramp-6)'],
  ])('paints the fill with ramp step %s', async (tone, expectedClass) => {
    await renderMeter({ tone });

    expect(screen.getByTestId('meter-fill')).toHaveClass(expectedClass);
  });

  it.each([
    [-0.5, '0%'],
    [0.25, '25%'],
    [1.5, '100%'],
  ])('clamps a fraction of %s to %s', async (value, expectedWidth) => {
    await renderMeter({ value });

    expect(screen.getByTestId('meter-fill')).toHaveStyle({ width: expectedWidth });
  });
});
