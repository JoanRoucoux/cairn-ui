import { Directive } from '@angular/core';

import { holdTransitionsUntilRendered } from '@joanroucoux/cairn-ui/motion';

const CLASSES =
  "relative shrink-0 w-[51px] h-[31px] pointer-fine:w-10 pointer-fine:h-6 appearance-none cursor-pointer rounded-pill bg-(--control-border) checked:bg-(--primary) forced-colors:forced-color-adjust-none forced-colors:border forced-colors:border-[color:CanvasText] forced-colors:focus-visible:outline-[color:CanvasText] forced-colors:bg-[color:Canvas] forced-colors:checked:bg-[color:Highlight] transition-[background-color] duration-(--duration-fast) ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:h-(--row-min) before:content-[''] after:absolute after:top-0.5 after:left-0.5 after:size-[27px] pointer-fine:after:size-5 after:rounded-pill after:bg-(--card) forced-colors:after:top-px forced-colors:after:left-px forced-colors:after:bg-[color:CanvasText] forced-colors:checked:after:bg-[color:HighlightText] after:shadow-[0_1px_3px_rgb(0_0_0/0.2)] after:transition-transform after:duration-(--duration-fast) after:ease-out after:content-[''] checked:after:translate-x-[20px] pointer-fine:checked:after:translate-x-4";

/**
 * Native checkbox styled as an iOS-style switch, exposed to assistive technology as `role="switch"`.
 *
 * @example
 * <input type="checkbox" uiSwitch [checked]="hidden()" (change)="toggle()" aria-label="Hide amounts" />
 */
@Directive({
  selector: 'input[type=checkbox][uiSwitch]',
  host: {
    role: 'switch',
    '[class]': 'classes',
  },
})
export class UiSwitch {
  protected readonly classes = CLASSES;

  constructor() {
    holdTransitionsUntilRendered();
  }
}
