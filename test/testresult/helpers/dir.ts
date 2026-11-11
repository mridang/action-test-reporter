import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function getDirname(metaUrl: string): string {
  return path.dirname(fileURLToPath(metaUrl));
}
