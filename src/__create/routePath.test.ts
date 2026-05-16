import { describe, expect, it } from 'vitest';
import { getHonoPath } from './routePath';

describe('getHonoPath', () => {
  it('builds nested API paths from Windows route file paths', () => {
    expect(
      getHonoPath(
        'C:\\project\\src\\app\\api\\auth\\token\\route.js',
        'C:\\project\\src\\app\\api'
      )
    ).toBe('/auth/token');
  });

  it('builds dynamic API route parameters', () => {
    expect(
      getHonoPath(
        'C:\\project\\src\\app\\api\\users\\[userId]\\route.js',
        'C:\\project\\src\\app\\api'
      )
    ).toBe('/users/:userId');
  });
});
