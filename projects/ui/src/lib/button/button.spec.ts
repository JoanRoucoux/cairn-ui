import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type ButtonSize, type ButtonVariant, UiButton } from './button';

describe('UiButton', () => {
  it('renders projected content on a native button', async () => {
    await render('<button ui-button>Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('is primary and sized to the touch target by default', async () => {
    await render('<button ui-button>Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('bg-(--primary)', 'min-h-(--row-min)');
  });

  it.each<[ButtonVariant, string]>([
    ['primary', 'bg-(--primary)'],
    ['outline', 'shadow-[inset_0_0_0_1px_var(--border)]'],
    ['ghost', 'bg-transparent'],
    ['destructive', 'bg-(--destructive)'],
  ])('applies the %s variant', async (variant, expectedClass) => {
    await render('<button ui-button [variant]="variant">Save</button>', {
      imports: [UiButton],
      componentProperties: { variant },
    });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(expectedClass);
  });

  it.each<[ButtonSize, string]>([
    ['md', 'min-h-(--row-min)'],
    ['lg', 'h-11'],
    ['xl', 'h-[50px]'],
    ['icon', 'size-(--row-min)'],
    ['xxl', 'gap-2.5'],
    ['xxl', 'h-[52px]'],
  ])('applies the %s size', async (size, expectedClass) => {
    await render('<button ui-button [size]="size" aria-label="Save">S</button>', {
      imports: [UiButton],
      componentProperties: { size },
    });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(expectedClass);
  });

  it('scales on press and not otherwise', async () => {
    await render('<button ui-button>Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('active:scale-(--press-scale)');
  });

  it('announces a loading button as busy, dims it and swallows clicks', async () => {
    const clicked = vi.fn();
    await render('<button ui-button [loading]="true" (click)="clicked()">Sell</button>', {
      imports: [UiButton],
      componentProperties: { clicked },
    });
    const button = screen.getByRole('button', { name: /Sell/ });

    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('opacity-70', 'aria-disabled:not-aria-busy:opacity-40');
    expect(clicked).not.toHaveBeenCalled();
  });

  it('treats the bare loading attribute as true, not as the empty string it actually holds', async () => {
    await render('<button ui-button loading>Sell</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: /Sell/ })).toHaveAttribute('aria-busy', 'true');
  });

  it('lets a click through when not loading', async () => {
    const clicked = vi.fn();
    await render('<button ui-button (click)="clicked()">Save</button>', {
      imports: [UiButton],
      componentProperties: { clicked },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it('keeps a native link a link', async () => {
    await render('<a ui-button variant="outline" href="/export" download>Export</a>', { imports: [UiButton] });

    expect(screen.getByRole('link', { name: 'Export' })).toBeInTheDocument();
  });

  it.each<[ButtonVariant, string]>([
    ['primary', 'hover:bg-(--primary-to)'],
    ['outline', 'active:bg-(--soft)'],
    ['ghost', 'active:bg-(--soft)'],
  ])('moves the %s variant to its own hover or press colour', async (variant, expectedClass) => {
    await render('<button ui-button [variant]="variant">Save</button>', {
      imports: [UiButton],
      componentProperties: { variant },
    });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(expectedClass);
  });

  it('tightens the start padding when an icon leads the label', async () => {
    await render('<button ui-button>Add</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass('has-[>svg:first-child]:pl-3');
  });
});
