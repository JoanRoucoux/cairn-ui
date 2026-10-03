import { Component, Directive, computed, input } from '@angular/core';

/** Available avatar sizes. `AvatarSize` is derived from this tuple. */
export const AVATAR_SIZES = ['sm', 'md', 'lg', 'auto'] as const;
export type AvatarSize = (typeof AVATAR_SIZES)[number];

const BASE_CLASSES = 'inline-flex items-center justify-center rounded-pill bg-(--muted) font-medium tabular-nums';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'size-8 text-caption',
  md: 'size-[34px] text-label',
  lg: 'size-14 text-title',
  auto: 'size-[34px] text-label lg:size-8 lg:text-caption',
};

/**
 * Initials in a disc, standing in for a person. Single-user application: there is exactly one.
 *
 * @example
 * <ui-avatar initials="JR" label="My account" />
 */
@Component({
  selector: 'ui-avatar',
  template: '<span aria-hidden="true">{{ initials() }}</span>',
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[class]': 'classes()',
  },
})
export class UiAvatar {
  readonly initials = input.required<string>();
  readonly label = input.required<string>();
  readonly size = input<AvatarSize>('md');

  protected readonly classes = computed(() => `${BASE_CLASSES} ${SIZE_CLASSES[this.size()]}`);
}

/**
 * Round hit area around a `ui-avatar` that links somewhere: 44px on touch, 40px from 64rem, with a
 * glow on hover and the press scale. On the current page (`aria-current="page"`, which `routerLinkActive`
 * sets through `ariaCurrentWhenActive`) it holds a soft halo, drawn at once when the route changes. The avatar
 * itself keeps its own size.
 *
 * @example
 * <a uiAvatarLink routerLink="/profile"><ui-avatar initials="JR" label="Profile" size="auto" /></a>
 */
@Directive({
  selector: 'a[uiAvatarLink], button[uiAvatarLink]',
  host: {
    class:
      'rounded-pill grid size-11 lg:size-10 place-items-center cursor-pointer select-none touch-manipulation transition-[scale,background-color] [transition-duration:var(--duration-press),var(--duration-fast)] ease-out hover:bg-(--glow) aria-[current=page]:bg-transparent aria-[current=page]:bg-[image:linear-gradient(var(--soft),var(--soft))] active:scale-(--press-scale) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)',
  },
})
export class UiAvatarLink {}
