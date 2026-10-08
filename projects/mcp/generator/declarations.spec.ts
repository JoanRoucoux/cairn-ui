import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { readEntryExports, readSlots } from './declarations.ts';
import { VIRTUAL_ROOT, collector, virtualProgram } from './testing.ts';

const BUTTON = `
import { Component, booleanAttribute, input, model, output } from '@angular/core';

export const SIZES = ['sm', 'md'] as const;
export type Size = (typeof SIZES)[number];
type Tone = 'neutral' | 'positive' | undefined;

/**
 * A button.
 *
 * @example
 * <button ui-button>Save</button>
 */
@Component({
  selector: 'button[ui-button]',
  exportAs: 'uiButton',
  template: \`<ng-content select="[icon]" /><ng-content></ng-content><ng-content />\`,
})
export class UiButton {
  /** Visual size. */
  readonly size = input<Size>('md');
  readonly tone = input<Tone>(undefined);
  readonly label = input.required<string>({ alias: 'ariaLabel' });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly level = input<1 | 2 | number>(1);
  readonly value = model.required<string>();
  readonly open = model(false);
  /** Fires on press. */
  readonly pressed = output<Size>();
  readonly renamed = output<void>({ alias: 'done' });
  readonly plain = 'not a signal';
  readonly computedLater = this.size.toString();
  protected readonly hidden = input(1);
  readonly #secret = input(2);
}
`;

describe('readEntryExports', () => {
  it('describes a component, its signals, its slots, and the constants and types beside it', () => {
    const { report, problems } = collector();
    const program = virtualProgram({ 'button.ts': BUTTON, 'index.ts': "export * from './button';" });

    expect(readEntryExports(program, join(VIRTUAL_ROOT, 'index.ts'), report)).toEqual({
      declarations: [
        {
          kind: 'component',
          className: 'UiButton',
          selector: 'button[ui-button]',
          exportAs: 'uiButton',
          description: 'A button.',
          examples: ['<button ui-button>Save</button>'],
          inputs: [
            {
              name: 'size',
              type: "'sm' | 'md'",
              required: false,
              default: "'md'",
              twoWay: false,
              description: 'Visual size.',
            },
            { name: 'tone', type: "'neutral' | 'positive' | undefined", required: false, twoWay: false },
            { name: 'ariaLabel', type: 'string', required: true, twoWay: false },
            { name: 'loading', type: 'boolean', required: false, default: 'false', twoWay: false },
            { name: 'level', type: 'number', required: false, default: '1', twoWay: false },
            { name: 'value', type: 'string', required: true, twoWay: true },
            { name: 'open', type: 'boolean', required: false, default: 'false', twoWay: true },
          ],
          outputs: [
            { name: 'pressed', type: "'sm' | 'md'", description: 'Fires on press.' },
            { name: 'done', type: 'void' },
          ],
          slots: ['[icon]', '*'],
        },
      ],
      services: [],
      functions: [],
      constants: [{ name: 'SIZES', type: 'readonly string[]', values: ['sm', 'md'] }],
      types: [{ name: 'Size', type: "'sm' | 'md'" }],
    });
    expect(problems).toEqual([]);
  });

  it('describes directives, services, functions, constants and types', () => {
    const { report, problems } = collector();
    const program = virtualProgram({
      'index.ts': `
        import { Directive, Injectable, InjectionToken, signal } from '@angular/core';

        export const LEVELS = [1, 2] as const;
        export const MIXED = ['a', 1 + 1] as const;
        export const EMPTY = [] as const;
        /** Token for the level. */
        export const LEVEL = new InjectionToken<number>('level');
        export const LABELS: Record<string, string> = {};

        /** Two levels. */
        export type Level = (typeof LEVELS)[number];
        export type Shape = { readonly id: number };
        export type Aliased = Level;
        export type Indexed = Shape['id'];
        export type Queried = typeof LEVELS[number];
        export type Wrapped = (Shape)['id'];
        export type FromFunction = (typeof double)['length'];
        export interface Named { readonly name: string; }

        /**
         * Makes a host focusable.
         *
         * @example
         * <div uiFocus></div>
         */
        @Directive({ selector: '[uiFocus]' })
        export class UiFocus {}

        /**
         * Queues messages.
         *
         * @example
         * inject(UiQueue).push('Saved');
         */
        @Injectable({ providedIn: 'root' })
        export class UiQueue {
          readonly #items = signal<string[]>([]);
          private readonly hidden = 1;
          /** The queued messages. */
          readonly items = this.#items.asReadonly();
          readonly level: Level = 1;
          /** Adds a message. */
          push(message: string, level?: Level): void {}
          protected flush(): void {}
          constructor() {}
        }

        /**
         * Doubles a number.
         *
         * @example
         * double(2);
         */
        export function double(value: number): number {
          return value * 2;
        }
      `,
    });
    const exports = readEntryExports(program, join(VIRTUAL_ROOT, 'index.ts'), report);

    expect(problems).toEqual([]);
    expect(exports.declarations).toEqual([
      {
        kind: 'directive',
        className: 'UiFocus',
        selector: '[uiFocus]',
        description: 'Makes a host focusable.',
        examples: ['<div uiFocus></div>'],
        inputs: [],
        outputs: [],
        slots: [],
      },
    ]);
    expect(exports.services).toEqual([
      {
        className: 'UiQueue',
        providedIn: 'root',
        description: 'Queues messages.',
        examples: ["inject(UiQueue).push('Saved');"],
        members: [
          { name: 'items', signature: 'items: Signal<string[]>', description: 'The queued messages.' },
          { name: 'level', signature: 'level: 1 | 2' },
          { name: 'push', signature: 'push(message: string, level?: Level): void', description: 'Adds a message.' },
        ],
      },
    ]);
    expect(exports.functions).toEqual([
      {
        name: 'double',
        signature: 'double(value: number): number',
        description: 'Doubles a number.',
        examples: ['double(2);'],
      },
    ]);
    expect(exports.constants).toEqual([
      { name: 'LEVELS', type: 'readonly number[]', values: [1, 2] },
      { name: 'MIXED', type: "readonly ['a', number]" },
      { name: 'EMPTY', type: 'readonly []' },
      { name: 'LEVEL', type: 'InjectionToken<number>', description: 'Token for the level.' },
      { name: 'LABELS', type: 'Record<string, string>' },
    ]);
    expect(exports.types).toEqual([
      { name: 'Level', type: '1 | 2', description: 'Two levels.' },
      { name: 'Shape', type: '{ readonly id: number }' },
      { name: 'Aliased', type: '1 | 2' },
      { name: 'Indexed', type: "Shape['id']" },
      { name: 'Queried', type: 'typeof LEVELS[number]' },
      { name: 'Wrapped', type: "(Shape)['id']" },
      { name: 'FromFunction', type: "(typeof double)['length']" },
      { name: 'Named', type: '{ readonly name: string; }' },
    ]);
  });

  it('leaves out what is tagged @internal', () => {
    const { report } = collector();
    const program = virtualProgram({
      'index.ts': `
        /** @internal Shared with a sibling entry. */
        export class Helper {}
        /** @internal */
        export type HelperConfig = { readonly open: boolean };
      `,
    });

    expect(readEntryExports(program, join(VIRTUAL_ROOT, 'index.ts'), report)).toEqual({
      declarations: [],
      services: [],
      functions: [],
      constants: [],
      types: [],
    });
  });

  it('reports what an application could not use without documentation', () => {
    const { report, problems } = collector();
    const program = virtualProgram({
      'index.ts': `
        import { Component, Directive } from '@angular/core';

        const SELECTOR = 'ui-dynamic';

        @Component({ template: '' })
        export class UiBare {}

        /** Has a computed selector. */
        @Directive({ selector: SELECTOR })
        export class UiDynamic {}

        @Directive(undefined as never)
        export class UiNoMetadata {}

        export class Plain {}

        @Reflect.metadata('a', 'b')
        export class Decorated {}

        export function undocumented(): void {}

        export enum Mode { A }
        export * as nested from './nested';
      `,
      'nested.ts': 'export const NESTED = 1;',
    });

    readEntryExports(program, join(VIRTUAL_ROOT, 'index.ts'), report);

    const file = join(VIRTUAL_ROOT, 'index.ts');

    expect(problems).toEqual([
      `${file}: undocumented has no JSDoc description`,
      `${file}: UiBare has no JSDoc description`,
      `${file}: UiBare has no @example`,
      `${file}: UiBare has no static selector`,
      `${file}: UiDynamic has no @example`,
      `${file}: UiDynamic has no static selector`,
      `${file}: UiNoMetadata has no JSDoc description`,
      `${file}: UiNoMetadata has no @example`,
      `${file}: UiNoMetadata has no static selector`,
      `${file}: Plain is exported but is neither a component, a directive nor an injectable`,
      `${file}: Decorated is exported but is neither a component, a directive nor an injectable`,
      `${file}: exports Mode, which the manifest cannot describe`,
      `${file}: exports nested, which the manifest cannot describe`,
    ]);
  });

  it('reports an index the program does not contain', () => {
    const { report, problems } = collector();

    readEntryExports(virtualProgram({}), join(VIRTUAL_ROOT, 'index.ts'), report);

    expect(problems).toEqual([`${join(VIRTUAL_ROOT, 'index.ts')}: is missing or exports nothing`]);
  });
});

describe('readSlots', () => {
  it('has no slot without a template', () => {
    expect(readSlots(undefined)).toEqual([]);
  });
});
