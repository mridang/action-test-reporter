import { ReportOptions } from '../formatter/summary-formatter.js';

/**
 * Builds stable anchor identifiers for GitHub summary content, where headings are not auto-linked.
 * Returns both the element id and the href to use in links.
 */
export function slug(
  name: string,
  options: ReportOptions,
): { id: string; link: string } {
  const slugId = name
    .trim()
    .replace(/_/g, '')
    .replace(/[./\\]/g, '-')
    .replace(/[^\w-]/g, '');

  const id = `user-content-${slugId}`;
  const link = options.useActionsSummary ? `#${id}` : `#${slugId}`;
  return { id, link };
}
