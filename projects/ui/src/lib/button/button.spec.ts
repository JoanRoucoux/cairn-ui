import { render, screen } from '@testing-library/angular';

import { type ButtonSize, type ButtonVariant, UiButton } from './button';

describe('UiButton', () => {
  it('renders projected content on a native button', async () => {
    await render('<button ui-button>Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('applies the primary variant and medium size by default', async () => {
    await render('<button ui-button>Save</button>', { imports: [UiButton] });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('bg-(--primary)', 'h-9');
  });

  it.each<[ButtonVariant, string]>([
    ['primary', 'bg-(--primary)'],
    ['secondary', 'bg-(--secondary)'],
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
    ['sm', 'h-8'],
    ['md', 'h-9'],
    ['lg', 'h-10'],
  ])('applies the %s size classes', async (size, expectedClass) => {
    await render('<button ui-button [size]="size">Save</button>', {
      imports: [UiButton],
      componentProperties: { size },
    });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(expectedClass);
  });
});
