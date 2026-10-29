import { describe, expect, it } from 'vitest';
import { canOpen } from './access';

describe('tab access', () => {
  it('keeps guests out of the link budget', () => {
    expect(canOpen('guest', 'link-budget')).toBe(false);
    expect(canOpen('admin', 'link-budget')).toBe(true);
  });
  it('leaves the other tabs open to everyone', () => {
    for (const tab of ['home', 'talos3', 'talos']) {
      expect(canOpen('guest', tab)).toBe(true);
      expect(canOpen('admin', tab)).toBe(true);
    }
  });
});
