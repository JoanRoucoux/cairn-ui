import { Directive } from '@angular/core';

import { render, screen } from '@testing-library/angular';

import { holdTransitionsUntilRendered } from './settle-transitions';

@Directive({ selector: '[uiSettleProbe]' })
class SettleProbe {
  constructor() {
    holdTransitionsUntilRendered();
  }
}

describe('holdTransitionsUntilRendered', () => {
  let frames: FrameRequestCallback[];
  let originalRaf: typeof requestAnimationFrame;

  const flushFrame = (): void => {
    const due = [...frames];
    frames = [];
    due.forEach((frame) => frame(performance.now()));
  };

  beforeEach(() => {
    frames = [];
    originalRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    }) as typeof requestAnimationFrame;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
  });

  it('marks the host as settling from its creation until two frames after its first render', async () => {
    await render('<div data-testid="host" uiSettleProbe></div>', { imports: [SettleProbe] });
    const host = screen.getByTestId('host');

    expect(host).toHaveAttribute('data-ui-settling');

    flushFrame();
    expect(host).toHaveAttribute('data-ui-settling');

    flushFrame();
    expect(host).not.toHaveAttribute('data-ui-settling');
  });
});
