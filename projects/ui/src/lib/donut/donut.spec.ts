import { fireEvent, render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type DonutSlice, UiDonut } from './donut';

const threeSlices: DonutSlice[] = [
  { id: 'a', label: 'ETF', value: 60, sublabel: '6 lignes' },
  { id: 'b', label: 'Fonds', value: 30, sublabel: '8 lignes' },
  { id: 'c', label: 'Actions', value: 10, sublabel: '4 lignes' },
];

const sevenSlices: DonutSlice[] = [
  { id: 'a', label: 'Saxo Investor', value: 61247.83 },
  { id: 'b', label: 'Esalia', value: 38512.4 },
  { id: 'c', label: 'Sharinbox', value: 17914.06 },
  { id: 'd', label: 'Fortuneo', value: 15402.18 },
  { id: 'e', label: 'Binance', value: 13806.52 },
  { id: 'f', label: 'Fortuneo Vie', value: 9718.35 },
  { id: 'g', label: 'Sogeretraite', value: 7692.94 },
];

const pct = (share: number): string => `${(share * 100).toFixed(1)}%`;
const eur = (value: number): string => `${value.toFixed(2)} EUR`;

describe('UiDonut', () => {
  it('renders one arc per ranked slice, filled from the grey ramp by rank', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const paths = fixture.nativeElement.querySelectorAll('svg path');

    expect(paths).toHaveLength(3);
    expect(paths[0]).toHaveClass('fill-(--ramp-1)');
    expect(paths[1]).toHaveClass('fill-(--ramp-2)');
    expect(paths[2]).toHaveClass('fill-(--ramp-3)');
  });

  it('shows the largest slice at the centre by default', async () => {
    const { fixture } = await render(
      `<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" [valueFormat]="eur" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, eur, pct } },
    );
    const centre = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    expect(centre.getByText('ETF')).toBeInTheDocument();
    expect(centre.getByText('60.0%')).toBeInTheDocument();
    expect(centre.getByText('60.00 EUR')).toBeInTheDocument();
  });

  it('moves the centre and thickens the arc when a legend row is hovered, focused or touched', async () => {
    const { fixture } = await render(
      `<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" [valueFormat]="eur" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, eur, pct } },
    );
    const row = screen.getByRole('button', { name: /Fonds/ });
    const centre = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    await userEvent.hover(row);

    expect(centre.getByText('Fonds')).toBeInTheDocument();
    const groups = fixture.nativeElement.querySelectorAll('svg g');
    expect((groups[1] as SVGGElement).style.transform).toContain('scale(1.08)');

    await userEvent.unhover(row);
    fireEvent.focus(row);

    expect(centre.getByText('Fonds')).toBeInTheDocument();

    fireEvent.blur(row);
    fireEvent.pointerEnter(row, { pointerType: 'touch' });

    expect(centre.getByText('Fonds')).toBeInTheDocument();
  });

  it('hovering an arc highlights its legend row and leaving it clears the highlight', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const paths = fixture.nativeElement.querySelectorAll('svg path');
    const row = screen.getByRole('button', { name: /Fonds/ });

    fireEvent.pointerEnter(paths[1]);

    expect(row).toHaveClass('bg-(--soft)');

    fireEvent.pointerLeave(paths[1]);

    expect(row).not.toHaveClass('bg-(--soft)');
  });

  it('ignores a leave event for a row that is no longer the active one', async () => {
    await render(`<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const rowA = screen.getByRole('button', { name: /^ETF/ });
    const rowB = screen.getByRole('button', { name: /Fonds/ });

    fireEvent.pointerEnter(rowA);
    fireEvent.pointerEnter(rowB);
    fireEvent.pointerLeave(rowA);

    expect(rowB).toHaveClass('bg-(--soft)');
  });

  it('emits sliceSelect with the slice id when a legend row is clicked', async () => {
    const onSelect = vi.fn();
    await render(
      `<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" (sliceSelect)="onSelect($event)" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, onSelect } },
    );

    await userEvent.click(screen.getByRole('button', { name: /Actions/ }));

    expect(onSelect).toHaveBeenCalledWith('c');
  });

  it('emits sliceSelect when a legend row is activated with Enter', async () => {
    const onSelect = vi.fn();
    await render(
      `<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" (sliceSelect)="onSelect($event)" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, onSelect } },
    );

    screen.getByRole('button', { name: /ETF/ }).focus();
    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it("keeps the SVG's aria-label detailed with every original slice, not only the grouped ones", async () => {
    const { fixture } = await render(
      `<ui-donut [slices]="slices" label="Par compte" othersLabel="Autres" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: sevenSlices, pct } },
    );
    const svg = fixture.nativeElement.querySelector('svg');
    const label = svg.getAttribute('aria-label') as string;

    for (const slice of sevenSlices) {
      expect(label).toContain(slice.label);
    }
    expect(label).not.toContain('Autres');
  });

  it('groups the smallest accounts into an Others legend row on seven slices', async () => {
    await render(`<ui-donut [slices]="slices" label="Par compte" othersLabel="Autres" [shareFormat]="pct" />`, {
      imports: [UiDonut],
      componentProperties: { slices: sevenSlices, pct },
    });

    expect(screen.getAllByRole('button')).toHaveLength(6);
    expect(screen.getByRole('button', { name: /Autres/ })).toHaveTextContent('Fortuneo Vie, Sogeretraite');
  });

  it('gives every legend row the name, sub-label, share and value, and drops a zero-value slice', async () => {
    const withZero: DonutSlice[] = [...threeSlices, { id: 'z', label: 'Zero', value: 0 }];
    await render(
      `<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" [valueFormat]="eur" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: withZero, eur, pct } },
    );

    expect(screen.getAllByRole('button')).toHaveLength(3);
    const row = screen.getByRole('button', { name: /ETF/ });
    expect(row).toHaveTextContent('ETF');
    expect(row).toHaveTextContent('6 lignes');
    expect(row).toHaveTextContent('60.0%');
    expect(row).toHaveTextContent('60.00 EUR');
    expect(screen.queryByText('Zero')).not.toBeInTheDocument();
  });

  it('formats the value and the share as-is when no formatter is given', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const centre = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    expect(centre.getByText('60%')).toBeInTheDocument();
    expect(centre.getByText('60')).toBeInTheDocument();
  });

  it('renders nothing to draw and no centre for an empty series, still naming the ring', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="Empty" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: [] as DonutSlice[] },
    });

    expect(fixture.nativeElement.querySelectorAll('svg path')).toHaveLength(0);
    expect(screen.getByRole('img', { name: 'Empty' })).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
