export function musicPath(id: number): string {
  return `/musics/${id}`;
}

export function musicIdFromPath(pathname: string): number | null {
  const match = /^\/musics\/(0|[1-9]\d*)\/?$/.exec(pathname);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) ? id : null;
}
