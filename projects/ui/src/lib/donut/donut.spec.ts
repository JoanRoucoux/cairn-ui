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
  it('renders one arc per ranked slice, stroked from the grey ramp by rank', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const paths = fixture.nativeElement.querySelectorAll('svg circle[data-slice]');

    expect(paths).toHaveLength(3);
    expect((paths[0] as SVGElement).style.stroke).toBe('var(--ramp-1)');
    expect((paths[1] as SVGElement).style.stroke).toBe('var(--ramp-2)');
    expect((paths[2] as SVGElement).style.stroke).toBe('var(--ramp-3)');
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

  it('moves the centre and thickens the stroke on the same ring when a legend row is hovered, focused or touched', async () => {
    const { fixture } = await render(
      `<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" [valueFormat]="eur" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, eur, pct } },
    );
    const row = screen.getByRole('button', { name: /Fonds/ });
    const centre = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));
    const arcs = fixture.nativeElement.querySelectorAll('svg circle[data-slice]');

    expect(arcs[0].getAttribute('style')).toContain('stroke-width: 38');
    expect(arcs[1].getAttribute('style')).toContain('stroke-width: 30');

    await userEvent.hover(row);

    expect(centre.getByText('Fonds')).toBeInTheDocument();
    expect(arcs[1].getAttribute('style')).toContain('stroke-width: 38');
    expect(arcs[0].getAttribute('style')).toContain('stroke-width: 30');
    expect(fixture.nativeElement.querySelector('svg [style*="scale"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('svg [style*="translate"]')).toBeNull();

    await userEvent.unhover(row);
    fireEvent.focus(row);

    expect(centre.getByText('Fonds')).toBeInTheDocument();

    fireEvent.blur(row);
    fireEvent.pointerEnter(row, { pointerType: 'touch' });

    expect(centre.getByText('Fonds')).toBeInTheDocument();
  });

  it('draws a muted track and every slice on the same r=78 circle', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const circles = Array.from(fixture.nativeElement.querySelectorAll('svg circle')) as SVGCircleElement[];

    expect(circles).toHaveLength(4);
    expect(circles.every((circle) => circle.getAttribute('r') === '78')).toBe(true);
    expect(circles[0]).toHaveClass('stroke-(--muted)');
  });

  it('sets the centre name at 14px 500 muted, the share at 28px 600 and the amount as a muted caption', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const centre = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    expect(centre.getByText('ETF')).toHaveClass('text-label', 'font-medium', 'text-(--muted-foreground)');
    expect(centre.getByText('60%')).toHaveClass('text-heading', 'font-semibold');
    expect(centre.getByText('60')).toHaveClass('text-caption', 'text-(--muted-foreground)');
  });

  it('hovering an arc highlights its legend row and leaving it clears the highlight', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const paths = fixture.nativeElement.querySelectorAll('svg circle[data-slice]');
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

    expect(fixture.nativeElement.querySelectorAll('svg circle[data-slice]')).toHaveLength(0);
    expect(screen.getByRole('img', { name: 'Empty' })).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
  it('stretches the legend to the full width on a narrow screen so rows run edge to edge', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Autres" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });

    expect(fixture.nativeElement.querySelector('[data-testid="donut-legend"]')).toHaveClass('w-full', 'sm:w-auto');
  });
});

describe('UiDonut legend links', () => {
  const href = (id: string): string => `/holdings?classe=${id}`;
  const linkTemplate = `<ui-donut [slices]="slices" label="Par classe d'actif" othersLabel="Autres" [legendHref]="href" (sliceSelect)="onSelect($event)" />`;

  it('renders each legend row as a link to its href instead of a button', async () => {
    await render(linkTemplate, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, href, onSelect: vi.fn() },
    });

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByRole('link', { name: /Fonds/ })).toHaveAttribute('href', '/holdings?classe=b');
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('keeps a button for a row whose href is null', async () => {
    await render(linkTemplate, {
      imports: [UiDonut],
      componentProperties: {
        slices: threeSlices,
        href: (id: string) => (id === 'c' ? null : href(id)),
        onSelect: vi.fn(),
      },
    });

    expect(screen.getByRole('button', { name: /Actions/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('hands a plain click to sliceSelect and cancels the page load, so the caller can route', async () => {
    const onSelect = vi.fn();
    await render(linkTemplate, { imports: [UiDonut], componentProperties: { slices: threeSlices, href, onSelect } });
    const link = screen.getByRole('link', { name: /Actions/ });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(onSelect).toHaveBeenCalledWith('c');
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }])(
    'leaves a modified click %o to the browser',
    async (init) => {
      const onSelect = vi.fn();
      await render(linkTemplate, { imports: [UiDonut], componentProperties: { slices: threeSlices, href, onSelect } });
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
      let prevented = true;
      const swallow = (event: Event): void => {
        prevented = event.defaultPrevented;
        event.preventDefault();
      };
      document.addEventListener('click', swallow, { once: true });

      screen.getByRole('link', { name: /Actions/ }).dispatchEvent(click);

      expect(prevented).toBe(false);
      expect(onSelect).not.toHaveBeenCalled();
    },
  );

  it('still highlights the slice on hover and focus', async () => {
    const { fixture } = await render(linkTemplate, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, href, onSelect: vi.fn() },
    });
    const link = screen.getByRole('link', { name: /Fonds/ });
    const centre = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    await userEvent.hover(link);
    expect(link).toHaveClass('bg-(--soft)');
    expect(centre.getByText('Fonds')).toBeInTheDocument();

    await userEvent.unhover(link);
    fireEvent.focus(link);
    expect(link).toHaveClass('bg-(--soft)');

    fireEvent.blur(link);
    expect(link).not.toHaveClass('bg-(--soft)');
  });

  it('shares the row geometry and the focus ring with the button rows', async () => {
    await render(linkTemplate, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, href, onSelect: vi.fn() },
    });

    expect(screen.getByRole('link', { name: /ETF/ })).toHaveClass(
      'min-h-14',
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-2',
      'focus-visible:outline-(--ring)',
    );
  });

  it('activates a link with Enter', async () => {
    const onSelect = vi.fn();
    await render(linkTemplate, { imports: [UiDonut], componentProperties: { slices: threeSlices, href, onSelect } });

    screen.getByRole('link', { name: /ETF/ }).focus();
    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith('a');
  });
});
