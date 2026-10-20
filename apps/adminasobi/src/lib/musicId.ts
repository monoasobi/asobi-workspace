export function parseMusicId(raw: string) {
  const id = Number(raw);
  return /^\d+$/.test(raw) && Number.isSafeInteger(id) && id >= 0 ? id : null;
}
