import { render, screen } from '@testing-library/angular';

import { type ButtonSize, type ButtonVariant, UiButton } from './button';

describe('UiButton', () => {
  it('renders projected content on a native button', async () => {
    await render('<button ui-button>Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('applies the primary variant and a 44px target by default', async () => {
    await render('<button ui-button>Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('bg-(--primary)', 'h-11');
  });

  it('carries the gradient on the primary variant, and only there', async () => {
    await render('<button ui-button>Save</button><button ui-button variant="outline">Cancel</button>', {
      imports: [UiButton],
    });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('to-(--primary-to)');
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toHaveClass('to-(--primary-to)');
  });

  it.each<[ButtonVariant, string]>([
    ['primary', 'bg-(--primary)'],
    ['secondary', 'bg-(--secondary)'],
    ['outline', 'border-(--border)'],
    ['destructive', 'bg-(--destructive)'],
    ['ghost', 'hover:bg-(--accent)'],
  ])('applies the %s variant classes', async (variant, expectedClass) => {
    await render('<button ui-button [variant]="variant">Save</button>', {
      imports: [UiButton],
      componentProperties: { variant },
    });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(expectedClass);
  });

  it.each<[ButtonSize, string]>([
    ['sm', 'h-9'],
    ['md', 'h-11'],
    ['lg', 'h-12'],
  ])('applies the %s size classes', async (size, expectedClass) => {
    await render('<button ui-button [size]="size">Save</button>', {
      imports: [UiButton],
      componentProperties: { size },
    });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(expectedClass);
  });

  it('draws its focus ring from the ring token', async () => {
    await render('<button ui-button>Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('focus-visible:outline-(--ring)');
  });

  it('keeps the classes the template put on the element', async () => {
    await render('<button ui-button class="w-full">Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('w-full', 'h-11');
  });

  it('styles a link that acts as a button without turning it into one', async () => {
    await render('<a ui-button variant="outline" href="/export">Export</a>', { imports: [UiButton] });

    const link = screen.getByRole('link', { name: 'Export' });

    expect(link).toHaveClass('border-(--border)', 'h-11');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
