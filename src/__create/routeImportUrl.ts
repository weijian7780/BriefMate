import { pathToFileURL } from 'node:url';

export function buildRouteImportUrl(routeFile: string, updatedAt = Date.now()) {
  const fileUrl = pathToFileURL(routeFile).href;
  return `${fileUrl}?update=${updatedAt}`;
}
