import { FlipItems } from './flip-items';

describe('FlipItems', () => {
  let host: HTMLElement;
  let item: HTMLElement;
  let items: FlipItems;

  beforeEach(() => {
    host = document.createElement('div');
    item = document.createElement('p');
    host.appendChild(item);
    items = new FlipItems();
  });

  it('is unmarked until an item registers', () => {
    expect(items.marked).toBe(false);

    items.add(item);

    expect(items.marked).toBe(true);
    expect(items.inside(host)).toEqual([item]);
  });

  it('keeps a live item that is outside the list for a while and follows it again once back', () => {
    items.add(item);
    item.remove();

    expect(items.inside(host)).toEqual([]);

    host.appendChild(item);
    expect(items.inside(host)).toEqual([item]);
  });

  it('keeps a destroyed item while it is still in the list, as during its leave animation', () => {
    items.add(item);
    items.remove(item);

    expect(items.inside(host)).toEqual([item]);
  });

  it('forgets a destroyed item once it has left the list', () => {
    items.add(item);
    items.remove(item);
    item.remove();
    items.inside(host);

    host.appendChild(item);
    expect(items.inside(host)).toEqual([]);
  });
});
