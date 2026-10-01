import { type RenderResult, render, screen } from '@testing-library/angular';

import { type FactSize, type FactSubTone, UiFact, UiFacts } from './fact';

const template = `
  <dl uiFacts [ruled]="ruled">
    <div ui-fact label="Quantité" [size]="size">500</div>
    <div ui-fact label="Cours" [size]="size" sub="24/09 · Yahoo" [subTone]="tone">28,64 €</div>
  </dl>`;

const renderFacts = (
  props: { ruled?: boolean; size?: FactSize; tone?: FactSubTone } = {},
): Promise<RenderResult<unknown>> =>
  render(template, {
    imports: [UiFacts, UiFact],
    componentProperties: { ruled: false, size: 'md', tone: 'subtle', ...props },
  });

describe('UiFact', () => {
  it('reads as a term and its value', async () => {
    await renderFacts();

    expect(screen.getByText('Quantité').tagName).toBe('DT');
    expect(screen.getByText('500').closest('dd')).not.toBeNull();
  });

  it('puts the label left and the value right, aligned on the baseline', async () => {
    const { container } = await renderFacts();

    expect(container.querySelector('[ui-fact]')).toHaveClass('flex', 'justify-between', 'items-baseline', 'gap-4');
    expect(screen.getByText('Quantité')).toHaveClass('text-label', 'text-(--muted-foreground)');
    expect(screen.getByText('500').closest('dd')).toHaveClass('items-end', 'text-right');
  });

  it('draws no hairline between the rows of the small size', async () => {
    const { container } = await renderFacts({ size: 'sm' });

    expect(container.querySelector('[ui-fact]')?.className).not.toContain('shadow');
  });

  it('draws a hairline above every row but the first', async () => {
    const { container } = await renderFacts();

    expect(container.querySelector('[ui-fact]')).toHaveClass(
      '[&:not(:first-child)]:shadow-[inset_0_1px_0_var(--hairline)]',
    );
  });

  it('shows an optional sub-line under the value, subtle by default', async () => {
    await renderFacts();

    expect(screen.getByText('24/09 · Yahoo')).toHaveClass('text-caption', 'text-(--subtle-foreground)');
  });

  it('paints a stale sub-line in the stale colour', async () => {
    await renderFacts({ tone: 'stale' });

    const sub = screen.getByText('24/09 · Yahoo');
    expect(sub).toHaveClass('text-(--stale)');
    expect(sub).not.toHaveClass('text-(--subtle-foreground)');
  });

  it('draws no sub-line without one', async () => {
    await renderFacts();

    expect(screen.getByText('500').closest('dd')?.children).toHaveLength(1);
  });

  it.each<[FactSize, string[]]>([
    ['md', ['py-3', 'text-body']],
    ['sm', ['py-2.5', 'text-label']],
  ])('applies the %s size', async (size, classes) => {
    const { container } = await renderFacts({ size });

    expect(container.querySelector('[ui-fact]')).toHaveClass(classes[0]!);
    expect(screen.getByText('500')).toHaveClass(classes[1]!, 'tabular-nums');
  });
});

describe('UiFacts', () => {
  it('stacks the rows without margin', async () => {
    const { container } = await renderFacts();

    expect(container.querySelector('dl')).toHaveClass('flex', 'flex-col', 'm-0');
    expect(container.querySelector('dl')?.className).not.toContain('shadow');
  });

  it('can draw a hairline above the first row too', async () => {
    const { container } = await renderFacts({ ruled: true });

    expect(container.querySelector('dl')).toHaveClass('shadow-[inset_0_1px_0_var(--hairline)]');
  });
});
