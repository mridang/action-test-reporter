export enum Align {
  Left = ':---',
  Right = '---:',
}

export const Icon = {
  skip: '⚪',
  success: '✅',
  fail: '❌',
};

export function link(title: string, address: string): string {
  return `[${title}](${address})`;
}

type ToString = string | number | boolean | Date;
export function table(
  headers: ToString[],
  align: ToString[],
  ...rows: ToString[][]
): string {
  const headerRow = `|${headers.map(tableEscape).join('|')}|`;
  const alignRow = `|${align.join('|')}|`;
  const contentRows = rows
    .map((row) => `|${row.map(tableEscape).join('|')}|`)
    .join('\n');
  return [headerRow, alignRow, contentRows].join('\n');
}

function tableEscape(content: ToString): string {
  return content.toString().replace('|', '\\|');
}

export function formatTime(ms: number): string {
  if (ms > 1000) {
    return `${Math.round(ms / 1000)}s`;
  }

  return `${Math.round(ms)}ms`;
}
