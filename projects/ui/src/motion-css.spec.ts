import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const motion = readFileSync(join(dirname(expect.getState().testPath ?? ''), '..', 'styles', 'motion.css'), 'utf8');

const rule = (selector: string): string => {
  const start = motion.indexOf(`${selector} {`);

  return start === -1 ? '' : motion.slice(start, motion.indexOf('}', start));
};

describe('motion.css', () => {
  it.each(['cairn-spin', 'cairn-pulse'])('declares @keyframes %s', (name) => {
    expect(motion).toContain(`@keyframes ${name}`);
  });

  it.each([
    ['.ui-enter-fade', '--duration-fast'],
    ['.ui-enter-fade-up', '--duration-fast'],
    ['.ui-enter-panel', '--duration-base'],
    ['.ui-leave-fade', '--duration-exit'],
  ])('ships %s on %s', (selector, duration) => {
    expect(rule(selector)).toContain(`var(${duration})`);
    expect(rule(selector)).toContain('var(--ease-out)');
  });

  it('offsets the entries by the distances of the handoff', () => {
    expect(motion).toContain('translateY(4px)');
    expect(motion).toContain('translateX(8px)');
  });

  it('keeps the leave class on its last frame so the element does not flash back', () => {
    expect(rule('.ui-leave-fade')).toContain('forwards');
  });

  it('cross-fades the root view transition on the motion tokens', () => {
    expect(rule('::view-transition-old(root),\n::view-transition-new(root)')).toContain('var(--duration-base)');
    expect(motion).toContain('@view-transition');
    expect(motion).toContain('navigation: auto');
  });

  it('turns view transitions and entry offsets off under reduced motion', () => {
    const reduced = motion.slice(motion.indexOf('prefers-reduced-motion'));

    expect(reduced).toContain('::view-transition-group(*)');
    expect(reduced).toContain('animation: none');
    expect(reduced).toMatch(/\.ui-enter-fade-up,\s*\.ui-enter-panel\s*\{\s*animation-name: cairn-fade-in;/);
  });

  it('removes every transition while the theme switches', () => {
    expect(rule('[data-theme-switching] *')).toContain('transition: none !important');
  });
});
