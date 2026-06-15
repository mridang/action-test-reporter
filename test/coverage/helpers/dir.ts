export function getDirname(metaUrl: string): string {
  return new URL('.', metaUrl).pathname;
}
