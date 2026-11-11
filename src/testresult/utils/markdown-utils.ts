/**
 * @file Provides helpers that build Markdown links, icons and tables for the summaries.
 */

export enum Align {
  Left = ':---',
  Right = '---:',
}

export const Icon = {
  skip: '⚪',
  success: '✅',
  fail: '❌',
};

/**
 * Creates a Markdown link from a title and an address.
 * @param title - The text shown for the link.
 * @param address - The URL the link points to.
 * @returns The Markdown link.
 * @example
 * const md = link('Docs', 'https://example.com');
 */
export function link(title: string, address: string): string {
  return `[${title}](${address})`;
}

type ToString = string | number | boolean | Date;

/**
 * Creates a Markdown table from its headers, column alignments and rows.
 * @param headers - The header cells of the table.
 * @param align - The alignment markers of each column, such as ':---'.
 * @param rows - The rows of the table, each a list of cells.
 * @returns The Markdown table.
 * @example
 * const md = table(['Name', 'Count'], ['---', '---:'], ['tests', 3]);
 */
export function table(
  headers: ToString[],
  align: ToString[],
  ...rows: ToString[][]
): string {
  const headerRow = `|${headers.map((header) => tableEscape(header)).join('|')}|`;
  const alignRow = `|${align.join('|')}|`;
  const contentRows = rows
    .map((row) => `|${row.map((cell) => tableEscape(cell)).join('|')}|`)
    .join('\n');
  return [headerRow, alignRow, contentRows].join('\n');
}

/**
 * Escapes a table cell so that a pipe character does not end the cell early.
 * @param content - The value of the cell.
 * @returns The cell text with pipe characters escaped.
 * @example
 * const cell = tableEscape('a|b');
 */
function tableEscape(content: ToString): string {
  return content.toString().replace('|', String.raw`\|`);
}

/**
 * Formats a duration as seconds when it is over a second, or as milliseconds otherwise.
 * @param ms - The duration in milliseconds.
 * @returns The formatted duration.
 * @example
 * const time = formatTime(2500); // '3s'
 */
export function formatTime(ms: number): string {
  if (ms > 1000) {
    return `${Math.round(ms / 1000)}s`;
  }

  return `${Math.round(ms)}ms`;
}
