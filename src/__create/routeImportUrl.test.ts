import { describe, expect, it } from 'vitest';
import { buildRouteImportUrl } from './routeImportUrl';

describe('buildRouteImportUrl', () => {
  it('converts Windows route paths into cache-busted file URLs', () => {
    const importUrl = buildRouteImportUrl(
      'C:\\Users\\User\\Desktop\\School\\UMS SEM 6\\Techno\\anything\\apps\\web\\src\\app\\api\\auth\\token\\route.js',
      123
    );

    expect(importUrl).toBe(
      'file:///C:/Users/User/Desktop/School/UMS%20SEM%206/Techno/anything/apps/web/src/app/api/auth/token/route.js?update=123'
    );
  });
});
