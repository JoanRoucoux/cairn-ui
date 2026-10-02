import { type Signal, type WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { AsyncState } from './async';
import { SKELETON_DELAY_MS, SKELETON_MIN_MS, delayedState } from './delayed-state';

const setup = (initial: AsyncState): { displayed: Signal<AsyncState | null>; set: (state: AsyncState) => void } => {
  const source: WritableSignal<AsyncState> = signal(initial);
  const displayed = TestBed.runInInjectionContext(() => delayedState(source));

  const set = (state: AsyncState): void => {
    source.set(state);
    TestBed.tick();
  };

  TestBed.tick();

  return { displayed, set };
};

describe('delayedState', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('exposes the thresholds', () => {
    expect([SKELETON_DELAY_MS, SKELETON_MIN_MS]).toEqual([150, 400]);
  });

  it('shows nothing while a first load is under 150 ms, then loading', () => {
    const { displayed } = setup('loading');

    expect(displayed()).toBeNull();
    vi.advanceTimersByTime(149);
    expect(displayed()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(displayed()).toBe('loading');
  });

  it('never shows the skeleton for a 100 ms call', () => {
    const { displayed, set } = setup('loading');

    vi.advanceTimersByTime(100);
    set('ready');

    expect(displayed()).toBe('ready');
    vi.advanceTimersByTime(1000);
    expect(displayed()).toBe('ready');
  });

  it('keeps the skeleton until 550 ms for a 300 ms call', () => {
    const { displayed, set } = setup('loading');

    vi.advanceTimersByTime(300);
    set('ready');
    expect(displayed()).toBe('loading');
    vi.advanceTimersByTime(249);
    expect(displayed()).toBe('loading');
    vi.advanceTimersByTime(1);
    expect(displayed()).toBe('ready');
  });

  it('releases at once when the skeleton has already been shown for 400 ms', () => {
    const { displayed, set } = setup('loading');

    vi.advanceTimersByTime(700);
    set('empty');

    expect(displayed()).toBe('empty');
  });

  it('delivers the latest state when the minimum elapses', () => {
    const { displayed, set } = setup('loading');

    vi.advanceTimersByTime(200);
    set('ready');
    vi.advanceTimersByTime(100);
    set('error');
    vi.advanceTimersByTime(300);

    expect(displayed()).toBe('error');
  });

  it('keeps the previous content during a reload shorter than 150 ms', () => {
    const { displayed, set } = setup('ready');

    set('loading');
    vi.advanceTimersByTime(100);
    expect(displayed()).toBe('ready');
    set('ready');
    vi.advanceTimersByTime(1000);
    expect(displayed()).toBe('ready');
  });

  it('shows the skeleton again on a retry after an error', () => {
    const { displayed, set } = setup('error');

    set('loading');
    vi.advanceTimersByTime(150);

    expect(displayed()).toBe('loading');
  });

  it('stays on the skeleton when loading restarts during the minimum', () => {
    const { displayed, set } = setup('loading');

    vi.advanceTimersByTime(200);
    set('error');
    set('loading');
    vi.advanceTimersByTime(1000);

    expect(displayed()).toBe('loading');
  });

  it('follows non-loading states immediately', () => {
    const { displayed, set } = setup('ready');

    set('empty');
    expect(displayed()).toBe('empty');
    set('error');
    expect(displayed()).toBe('error');
  });

  it('starts on a settled source without waiting', () => {
    expect(setup('empty').displayed()).toBe('empty');
  });

  it('drops its timers when destroyed', () => {
    const { displayed } = setup('loading');

    TestBed.resetTestingModule();
    vi.advanceTimersByTime(1000);

    expect(displayed()).toBeNull();
  });
});
