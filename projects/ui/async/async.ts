import { Component, booleanAttribute, computed, input, output } from '@angular/core';

import { holdTransitionsUntilRendered } from '@joanroucoux/cairn-ui/motion';

import { delayedState } from './delayed-state';

/** Available async block states. */
export const ASYNC_STATES = ['loading', 'error', 'empty', 'ready'] as const;
export type AsyncState = (typeof ASYNC_STATES)[number];

/** Looks of the error block. */
export const ASYNC_VARIANTS = ['elevated', 'plain', 'emphasis', 'inline'] as const;
export type AsyncVariant = (typeof ASYNC_VARIANTS)[number];

/** Alignments of the error block; `auto` is centred from 64rem. */
export const ASYNC_ALIGNS = ['start', 'center', 'auto'] as const;
export type AsyncAlign = (typeof ASYNC_ALIGNS)[number];

const RETRY_BASE_CLASSES =
  'relative inline-flex items-center justify-center rounded-control font-medium whitespace-nowrap cursor-pointer select-none touch-manipulation transition-[scale,background-color] [transition-duration:var(--duration-press),var(--duration-fast)] ease-out active:scale-(--press-scale) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) text-label';

const RETRY_OUTLINE_CLASSES =
  'bg-(--card) text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow)';

const RETRY_PRIMARY_CLASSES = 'bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-to)';

const RETRY_BLOCK_CLASSES = 'min-h-(--row-min) gap-2 pl-3 pr-4';

const RETRY_INLINE_CLASSES = 'h-11 pointer-fine:h-8 flex-none';

const RETRY_INLINE_ICON_CLASSES = 'gap-1.5 pl-2.5 pr-3';

const RETRY_INLINE_TEXT_CLASSES = 'px-3';

const ELEVATED_SURFACE_CLASSES = 'rounded-control bg-(--elevated)';

const CARD_SURFACE_CLASSES = 'rounded-container bg-(--card) shadow-[inset_0_0_0_1px_var(--border)]';

type BlockSpec = {
  surface: string;
  gap: string;
  padding: Record<AsyncAlign, string>;
  title: string;
  message: Record<AsyncAlign, string>;
  retryMargin: Record<AsyncAlign, string>;
  retry: string;
};

const BLOCK_SPECS: Record<Exclude<AsyncVariant, 'inline'>, BlockSpec> = {
  elevated: {
    surface: ELEVATED_SURFACE_CLASSES,
    gap: 'gap-1',
    padding: { start: 'p-4', center: 'px-4 py-10', auto: 'p-4 lg:py-10' },
    title: 'text-body font-medium',
    message: { start: 'text-label', center: 'text-label', auto: 'text-label' },
    retryMargin: { start: 'mt-2', center: 'mt-2', auto: 'mt-2' },
    retry: RETRY_OUTLINE_CLASSES,
  },
  plain: {
    surface: '',
    gap: 'gap-1',
    padding: { start: 'px-4 py-5', center: 'px-4 py-12', auto: 'px-4 py-5 lg:py-12' },
    title: 'text-body leading-[normal] font-medium',
    message: {
      start: 'text-label leading-[normal]',
      center: 'text-label leading-[normal]',
      auto: 'text-label leading-[normal]',
    },
    retryMargin: { start: 'mt-2', center: 'mt-2', auto: 'mt-2' },
    retry: RETRY_OUTLINE_CLASSES,
  },
  emphasis: {
    surface: '',
    gap: 'gap-3',
    padding: { start: 'px-4 py-6', center: 'px-4 py-14', auto: 'px-4 py-6 lg:py-14' },
    title: 'text-title font-semibold',
    message: {
      start: 'text-label',
      center: 'text-body leading-[normal]',
      auto: 'text-label lg:text-body lg:leading-[normal]',
    },
    retryMargin: { start: 'mt-1', center: 'mt-2', auto: 'mt-1 lg:mt-2' },
    retry: RETRY_PRIMARY_CLASSES,
  },
};

const ALIGN_CLASSES: Record<AsyncAlign, string> = {
  start: 'items-start',
  center: 'items-center text-center',
  auto: 'items-start lg:items-center lg:text-center',
};

const INLINE_BOX_CLASSES = 'flex-row items-center justify-between gap-3 pt-1.5 pr-1.5 pb-2 pl-2.5';

/**
 * The three states of a block that depends on a service call, next to the ready content.
 *
 * @example
 * <ui-async [state]="totalState()" errorTitle="Total could not be loaded" errorMessage="The server did not answer." retryLabel="Retry" (retry)="reload()">
 *   <span asyncLoading><ui-skeleton shape="figure" /></span>
 *   <span asyncEmpty>Add a holding to see your total.</span>
 *   <span>{{ total() }}</span>
 * </ui-async>
 */
@Component({
  selector: 'ui-async',
  template: `
    @switch (shown()) {
      @case (null) {}
      @case ('loading') {
        <ng-content select="[asyncLoading]" />
      }
      @case ('error') {
        <div aria-live="polite" role="alert" [class]="boxClasses()">
          @if (variant() === 'inline') {
            <span class="text-label text-(--muted-foreground)">{{ errorMessage() }}</span>
          } @else {
            @if (variant() === 'emphasis') {
              <h2 [class]="titleClasses()">{{ errorTitle() }}</h2>
            } @else {
              <span [class]="titleClasses()">{{ errorTitle() }}</span>
            }
            <span class="text-(--muted-foreground)" [class]="messageClasses()">{{ errorMessage() }}</span>
          }
          <button type="button" [class]="retryButtonClasses()" (click)="retry.emit()">
            @if (retryIcon()) {
              <svg
                aria-hidden="true"
                class="block flex-none fill-none stroke-current"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
                viewBox="0 0 24 24"
                [attr.height]="iconSize()"
                [attr.width]="iconSize()"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            }
            {{ retryLabel() }}
          </button>
        </div>
      }
      @case ('empty') {
        <ng-content select="[asyncEmpty]" />
      }
      @default {
        <ng-content />
      }
    }
  `,
  host: {
    '[attr.aria-busy]': "state() === 'loading' || null",
    '[class.flex]': 'filling()',
    '[class.flex-col]': 'filling()',
  },
})
export class UiAsync {
  readonly state = input.required<AsyncState>();
  readonly errorTitle = input<string>();
  readonly errorMessage = input<string>();
  readonly retryLabel = input<string>();
  readonly retryIcon = input(true, { transform: booleanAttribute });
  readonly variant = input<AsyncVariant>('elevated');
  readonly align = input<AsyncAlign>('start');
  readonly card = input(false, { transform: booleanAttribute });
  readonly fill = input(false, { transform: booleanAttribute });
  readonly retry = output<void>();

  protected readonly shown = delayedState(this.state);

  protected readonly filling = computed(() => this.fill() && this.shown() === 'error');

  protected readonly iconSize = computed(() => (this.variant() === 'inline' ? 16 : 18));

  readonly #spec = computed(() => {
    const variant = this.variant();

    return variant === 'inline' ? null : BLOCK_SPECS[variant];
  });

  protected readonly boxClasses = computed(() => {
    const spec = this.#spec();
    const fill = this.fill() ? ' flex-1 justify-center' : '';

    if (spec === null) {
      return `flex ${INLINE_BOX_CLASSES}${this.card() ? ` ${CARD_SURFACE_CLASSES}` : ''}${this.fill() ? ' flex-1' : ''}`;
    }

    const surface = this.card() ? CARD_SURFACE_CLASSES : spec.surface;

    return `flex flex-col ${surface} ${spec.gap} ${ALIGN_CLASSES[this.align()]} ${spec.padding[this.align()]}${fill}`;
  });

  protected readonly titleClasses = computed(() => this.#spec()!.title);

  protected readonly messageClasses = computed(() => this.#spec()!.message[this.align()]);

  protected readonly retryButtonClasses = computed(() => {
    const spec = this.#spec();

    if (spec === null) {
      const spacing = this.retryIcon() ? RETRY_INLINE_ICON_CLASSES : RETRY_INLINE_TEXT_CLASSES;

      return `${RETRY_BASE_CLASSES} ${RETRY_OUTLINE_CLASSES} ${RETRY_INLINE_CLASSES} ${spacing}`;
    }

    return `${RETRY_BASE_CLASSES} ${spec.retry} ${RETRY_BLOCK_CLASSES} ${spec.retryMargin[this.align()]}`;
  });

  constructor() {
    holdTransitionsUntilRendered();
  }
}
