const GRACE = 50;

export function afterExit(element: HTMLElement, done: () => void): () => void {
  const style = getComputedStyle(element);
  const wait = longest(style.transitionDuration) + longest(style.transitionDelay);

  if (wait === 0) {
    done();
    return () => undefined;
  }

  const onEnd = (event: TransitionEvent): void => {
    if (event.target === element && !event.pseudoElement) {
      cancel();
      done();
    }
  };
  const timer = setTimeout(() => {
    cancel();
    done();
  }, wait + GRACE);
  const cancel = (): void => {
    clearTimeout(timer);
    element.removeEventListener('transitionend', onEnd);
  };

  element.addEventListener('transitionend', onEnd);

  return cancel;
}

function longest(list: string): number {
  return Math.max(0, ...list.split(',').map(toMs));
}

function toMs(value: string): number {
  const amount = Number.parseFloat(value);

  if (Number.isNaN(amount)) {
    return 0;
  }

  return value.trim().endsWith('ms') ? amount : amount * 1000;
}
