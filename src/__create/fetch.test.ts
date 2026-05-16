import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('fetchWithHeaders', () => {
  it('logs failed first-party fetches through the requested console level', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 500, statusText: 'Server Error' }))
    );
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    vi.stubGlobal('fetch', fetchMock);

    const { fetchWithHeaders } = await import('./fetch');

    await fetchWithHeaders('/integrations/status');

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to load resource: the server responded with a status of 500 (Server Error)',
      expect.objectContaining({
        status: 500,
        statusText: 'Server Error',
        url: '/integrations/status',
      })
    );
    expect(logSpy).not.toHaveBeenCalled();
  });
});
