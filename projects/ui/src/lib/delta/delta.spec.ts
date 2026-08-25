import { type RenderResult, render, screen } from '@testing-library/angular';

import { type DeltaEmphasis, UiDelta } from './delta';

const renderDelta = (
  value: number | null | undefined,
  emphasis: DeltaEmphasis = 'text',
): Promise<RenderResult<unknown>> =>
  render('<ui-delta [value]="value" [emphasis]="emphasis" unknownLabel="Not available">+316.54 EUR</ui-delta>', {
    imports: [UiDelta],
    componentProperties: { value, emphasis },
  });

describe('UiDelta', () => {
  it('projects the formatted amount when a value is known', async () => {
    await renderDelta(316.54);

    expect(screen.getByText('+316.54 EUR')).toBeInTheDocument();
  });

  it('renders a dash instead of the amount when the value is null', async () => {
    const { container } = await renderDelta(null);

    expect(screen.queryByText('+316.54 EUR')).not.toBeInTheDocument();
    expect(container.textContent).toContain('—');
  });

  it('names the unknown state for screen readers', async () => {
    await renderDelta(null);

    expect(screen.getByText('Not available')).toHaveClass('sr-only');
  });

  it('treats undefined like null', async () => {
    const { container } = await renderDelta(undefined);

    expect(container.textContent).toContain('—');
  });

  it.each<[number | null, string]>([
    [316.54, 'text-(--positive)'],
    [-131.3, 'text-(--negative)'],
    [0, 'text-(--muted-foreground)'],
    [null, 'text-(--subtle-foreground)'],
  ])('paints a value of %s with %s', async (value, expectedClass) => {
    const { container } = await renderDelta(value);

    expect(container.querySelector('ui-delta')).toHaveClass(expectedClass);
  });

  it.each<[DeltaEmphasis, string]>([
    ['text', 'bg-transparent'],
    ['pill', 'bg-(--positive)/12'],
  ])('applies the %s emphasis', async (emphasis, expectedClass) => {
    const { container } = await renderDelta(316.54, emphasis);

    expect(container.querySelector('ui-delta')).toHaveClass(expectedClass);
  });
});
