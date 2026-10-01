import {
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';

const MENU_CLASSES =
  'm-0 min-w-44 p-1 rounded-container bg-(--elevated) shadow-[0_8px_24px_rgb(0_0_0/0.16),inset_0_0_0_1px_var(--border)] text-(--foreground) transition-[opacity,transform,overlay,display] transition-discrete duration-(--duration-fast) ease-out starting:open:opacity-0 starting:open:scale-(--enter-scale) opacity-0 scale-(--enter-scale) open:opacity-100 open:scale-100';

const ITEM_CLASSES =
  'flex w-full items-center gap-3 pointer-fine:gap-2.5 min-h-11 pointer-fine:min-h-9 px-3 pointer-fine:px-2.5 rounded-[calc(var(--radius-container)-4px)] text-body pointer-fine:text-label hover:bg-(--glow) focus-visible:bg-(--glow) outline-none';

const nextId = (() => {
  let count = 0;

  return () => `ui-menu-${++count}`;
})();

/**
 * One action of a `ui-menu`; `destructive` paints it in `--negative`.
 *
 * @example
 * <button uiMenuItem destructive (click)="remove()">Delete the line</button>
 */
@Directive({
  selector: 'button[uiMenuItem]',
  host: {
    role: 'menuitem',
    tabindex: '-1',
    '[class]': 'classes()',
    '(click)': 'onClick()',
  },
})
export class UiMenuItem {
  readonly destructive = input(false, { transform: booleanAttribute });

  readonly #host = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;
  readonly #menu = inject(UiMenu);

  protected readonly classes = computed(() => `${ITEM_CLASSES}${this.destructive() ? ' text-(--negative)' : ''}`);

  focus(): void {
    this.#host.focus();
  }

  hasFocus(): boolean {
    return this.#host === document.activeElement;
  }

  protected onClick(): void {
    this.#menu.close();
  }
}

/**
 * Secondary actions menu, opened from its trigger through the native Popover API.
 *
 * @example
 * <button ui-button size="icon" aria-label="More" [uiMenuTrigger]="menu">...</button>
 * <ui-menu #menu label="Line actions">
 *   <button uiMenuItem (click)="edit()">Edit</button>
 *   <button uiMenuItem destructive (click)="remove()">Delete the line</button>
 * </ui-menu>
 */
@Component({
  selector: 'ui-menu',
  template: '<ng-content />',
  host: {
    role: 'menu',
    popover: 'auto',
    '[id]': 'menuId',
    '[class]': 'classes',
    '[attr.aria-label]': 'label()',
    '(toggle)': 'onToggle($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class UiMenu {
  readonly label = input.required<string>();

  readonly menuId = nextId();
  readonly isOpen = signal(false);

  protected readonly classes = MENU_CLASSES;
  protected readonly items = contentChildren(UiMenuItem);

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  #trigger: HTMLElement | null = null;

  open(trigger: HTMLElement): void {
    this.#trigger = trigger;
    this.isOpen.set(true);
    if (typeof this.#host.showPopover === 'function') {
      this.#host.showPopover();
    }
    this.#position(trigger);
    this.items()[0]?.focus();
  }

  close(): void {
    const wasOpen = this.isOpen();

    this.#applyClosed();

    if (wasOpen && typeof this.#host.hidePopover === 'function') {
      this.#host.hidePopover();
    }
  }

  #applyClosed(): void {
    this.isOpen.set(false);
    this.#trigger?.focus();
    this.#trigger = null;
  }

  protected onToggle(event: Event): void {
    if ((event as ToggleEvent).newState === 'closed') {
      this.#applyClosed();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' || event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    const items = this.items();
    const currentIndex = items.findIndex((item) => item.hasFocus());
    const lastIndex = items.length - 1;

    let nextIndex: number | undefined;
    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
    }

    if (nextIndex === undefined) {
      return;
    }
    event.preventDefault();
    items[nextIndex]?.focus();
  }

  #position(trigger: HTMLElement): void {
    const margin = 8;
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = this.#host.getBoundingClientRect();
    const fitsBelow = window.innerHeight - triggerRect.bottom >= menuRect.height + margin;

    const top = fitsBelow ? triggerRect.bottom + 4 : Math.max(margin, triggerRect.top - menuRect.height - 4);
    const left = Math.min(
      Math.max(triggerRect.right - menuRect.width, margin),
      window.innerWidth - menuRect.width - margin,
    );

    this.#host.style.position = 'fixed';
    this.#host.style.top = `${Math.min(top, window.innerHeight - menuRect.height - margin)}px`;
    this.#host.style.left = `${left}px`;
    this.#host.style.transformOrigin = fitsBelow ? 'top right' : 'bottom right';
  }
}

/**
 * Opens a `ui-menu` from a trigger element and wires `aria-haspopup`, `aria-expanded` and
 * `aria-controls` on it.
 *
 * @example
 * <button ui-button size="icon" aria-label="More" [uiMenuTrigger]="menu">...</button>
 */
@Directive({
  selector: '[uiMenuTrigger]',
  host: {
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'uiMenuTrigger().isOpen()',
    '[attr.aria-controls]': 'uiMenuTrigger().menuId',
    '(click)': 'toggle()',
  },
})
export class UiMenuTrigger {
  readonly uiMenuTrigger = input.required<UiMenu>();

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected toggle(): void {
    const menu = this.uiMenuTrigger();

    if (menu.isOpen()) {
      menu.close();
    } else {
      menu.open(this.#host);
    }
  }
}
