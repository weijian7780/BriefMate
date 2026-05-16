export function getHonoPath(routeFile: string, apiRoot: string) {
  const relativePath = routeFile.slice(apiRoot.length).replace(/^[/\\]+/, '');
  const parts = relativePath.split(/[/\\]+/).filter(Boolean);
  const routeParts = parts.slice(0, -1);

  if (routeParts.length === 0) return '/';

  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (!match) return segment;

    const [, dots, param] = match;
    return dots === '...' ? `:${param}{.+}` : `:${param}`;
  });

  return `/${transformedParts.join('/')}`;
}
