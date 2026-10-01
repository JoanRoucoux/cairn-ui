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
    ['soft', 'bg-(--muted)'],
    ['soft', 'lg:bg-transparent'],
    ['soft', 'lg:hover:bg-(--glow)'],
    ['muted', 'text-(--muted-foreground)'],
    ['muted', 'hover:bg-(--glow)'],
    ['muted', 'hover:text-(--foreground)'],
    ['quiet', 'text-(--muted-foreground)'],
    ['quiet', 'hover:bg-(--soft)'],
    ['quiet-destructive', 'hover:text-(--negative)'],
    ['quiet-destructive', 'hover:bg-(--glow)'],
    ['outline-destructive', 'text-(--negative)'],
    ['outline-destructive', 'shadow-[inset_0_0_0_1px_var(--border)]'],
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
    ['compact', 'h-8'],
    ['compact', 'lg:h-7'],
    ['compact', 'lg:px-2'],
    ['compact', 'before:-inset-y-1.5'],
    ['xs', 'h-8'],
    ['xs', 'px-2.5'],
    ['sm', 'h-9'],
    ['sm', 'px-3'],
    ['icon-sm', 'size-11'],
    ['icon-sm', 'pointer-fine:size-9'],
    ['tall', 'h-12'],
    ['tall', 'lg:h-10'],
    ['block', 'h-[50px]'],
    ['block', 'lg:h-11'],
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

  it('steps xxl down from 52 px to 44 px at 64rem, with body text', async () => {
    await render('<button ui-button size="xxl">Go</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass(
      'h-[52px]',
      'lg:h-11',
      'px-6',
      'lg:px-5',
      'lg:has-[>svg:first-child]:pl-4',
      'text-body',
    );
  });

  it('draws no pressed fill on the muted variant', async () => {
    await render('<button ui-button variant="muted" size="icon-sm" aria-label="Fermer">x</button>', {
      imports: [UiButton],
    });
    const button = screen.getByRole('button', { name: 'Fermer' });

    expect(button.className).not.toContain('active:bg-');
    expect(button).toHaveClass('focus-visible:-outline-offset-2');
  });

  it('keeps the quiet variants focus ring inside the button', async () => {
    await render('<button ui-button variant="quiet" size="icon-sm" aria-label="Edit">E</button>', {
      imports: [UiButton],
    });
    const button = screen.getByRole('button', { name: 'Edit' });

    expect(button).toHaveClass('focus-visible:-outline-offset-2', 'active:bg-(--soft)');
    expect(button).not.toHaveClass('focus-visible:outline-offset-2');
  });

  it('keeps the outer focus ring offset on the other variants', async () => {
    await render('<button ui-button>Go</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('focus-visible:outline-offset-2');
  });

  describe('busy', () => {
    it('announces busy and swallows clicks without a spinner', async () => {
      const clicked = vi.fn();
      const { container } = await render('<button ui-button busy (click)="clicked()">Connexion</button>', {
        imports: [UiButton],
        componentProperties: { clicked },
      });
      const button = screen.getByRole('button', { name: 'Connexion' });

      await userEvent.click(button);

      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveClass('opacity-70', 'pointer-events-none');
      expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
      expect(clicked).not.toHaveBeenCalled();
    });

    it('is off by default and when false', async () => {
      await render('<button ui-button [busy]="false">Go</button>', { imports: [UiButton] });
      const button = screen.getByRole('button', { name: 'Go' });

      expect(button).not.toHaveAttribute('aria-busy');
      expect(button).not.toHaveClass('opacity-70');
    });

    it('leaves loading its spinner', async () => {
      const { container } = await render('<button ui-button loading>Go</button>', { imports: [UiButton] });

      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    });
  });
});
