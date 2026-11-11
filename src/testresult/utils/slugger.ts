/**
 * @file Builds stable anchor identifiers for the headings of the summary.
 */

import { ReportOptions } from '../formatter/summary-formatter.js';

/**
 * Builds stable anchor identifiers for GitHub summary content, where headings are not auto-linked.
 * Returns both the element id and the href to use in links.
 * @param name - The text to derive the anchor from, such as a heading or a suite name.
 * @param options - The report options that control how anchors are built.
 * @returns The element id and the href that points to it.
 * @example
 * const { id, link } = slug('My Suite', DEFAULT_OPTIONS);
 */
export function slug(
  name: string,
  options: ReportOptions,
): { id: string; link: string } {
  const slugId = name
    .trim()
    .replaceAll('_', '')
    .replaceAll(/[./\\]/g, '-')
    .replaceAll(/[^\w-]/g, '');

  const id = `user-content-${slugId}`;
  const link = options.useActionsSummary ? `#${id}` : `#${slugId}`;
  return { id, link };
}
