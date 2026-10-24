import { TestBed } from '@angular/core/testing';

import { UiAnnouncer } from './announcer';

const region = (): HTMLElement | null => document.querySelector('[aria-live="polite"][aria-atomic="true"]');

describe('UiAnnouncer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
    document.body.replaceChildren();
  });

  it('creates nothing until a message is announced', () => {
    TestBed.inject(UiAnnouncer);

    expect(region()).toBeNull();
  });

  it('sets the message in a hidden polite region after a short delay', () => {
    TestBed.inject(UiAnnouncer).announce('Northwind Brokerage added');

    expect(region()).toHaveTextContent('');
    expect(region()?.parentElement).toBe(document.body);
    expect(region()?.style.position).toBe('absolute');
    expect(region()?.style.width).toBe('1px');

    vi.advanceTimersByTime(100);

    expect(region()).toHaveTextContent('Northwind Brokerage added');
  });

  it('reuses one region and clears it so a repeated message is read again', () => {
    const announcer = TestBed.inject(UiAnnouncer);
    announcer.announce('Saved');
    vi.advanceTimersByTime(100);

    announcer.announce('Saved');

    expect(document.querySelectorAll('[aria-live]')).toHaveLength(1);
    expect(region()).toHaveTextContent('');

    vi.advanceTimersByTime(100);

    expect(region()).toHaveTextContent('Saved');
  });

  it('keeps only the last message when called twice within the delay', () => {
    const announcer = TestBed.inject(UiAnnouncer);
    announcer.announce('First');
    announcer.announce('Second');

    vi.advanceTimersByTime(100);

    expect(region()).toHaveTextContent('Second');
  });

  it('moves into the last open modal dialog and back to the body once it is gone', () => {
    const first = document.createElement('dialog');
    const second = document.createElement('dialog');
    const plain = document.createElement('dialog');
    document.body.append(first, second, plain);
    first.showModal();
    second.showModal();
    plain.setAttribute('open', '');
    const announcer = TestBed.inject(UiAnnouncer);

    announcer.announce('Inside');

    expect(region()?.parentElement).toBe(second);

    second.close();
    announcer.announce('Still inside');

    expect(region()?.parentElement).toBe(first);

    first.close();
    announcer.announce('Outside');

    expect(region()?.parentElement).toBe(document.body);
  });

  it('removes the region and cancels the pending message when the root injector is destroyed', () => {
    TestBed.inject(UiAnnouncer).announce('Gone');

    TestBed.resetTestingModule();
    vi.advanceTimersByTime(100);

    expect(region()).toBeNull();
  });

  it('destroys cleanly when nothing was ever announced', () => {
    TestBed.inject(UiAnnouncer);

    expect(() => TestBed.resetTestingModule()).not.toThrow();
  });
});
