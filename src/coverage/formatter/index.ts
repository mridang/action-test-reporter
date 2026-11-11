/**
 * @file Provides helpers shared by the coverage formatters, such as compressing uncovered line numbers into ranges.
 */

/**
 * Transforms an array of numbers into a compact, human-readable string of
 * continuous ranges. This pure function is designed to make lists of
 * numbers, such as uncovered code lines, easier to read.
 *
 * If the resulting string exceeds the optional maxLength, a single compact
 * range from the first to the last number is returned instead.
 * @param lines - An array of numbers. The function will internally
 * sort this array, so the input does not need to be pre-sorted. An empty
 * array will result in an empty string.
 * @param [options] - Optional configuration.
 * @param [options.maxLength] - The maximum character length for the
 * output string. If exceeded, a simplified range is returned.
 * @returns A comma-separated string representing the number ranges.
 * @example
 * const text = formatUncoveredLines([1, 2, 3, 7, 9, 10]); // '1-3,7,9-10'
 */
export function formatUncoveredLines(
  lines: number[],
  options?: { maxLength?: number },
): string {
  if (lines.length === 0) {
    return '';
  } else {
    const sortedLines = [...lines].toSorted((a, b) => a - b);

    const groupedRanges = sortedLines.reduce(
      (acc: number[][], current: number) => {
        const lastGroup = acc.at(-1)!;
        if (acc.length === 0 || current > lastGroup.at(-1)! + 1) {
          acc.push([current]);
        } else {
          lastGroup.push(current);
        }
        return acc;
      },
      [],
    );

    const fullRangeString = groupedRanges
      .map((group: number[]) => {
        return group.length > 1 ? `${group[0]}-${group.at(-1)}` : `${group[0]}`;
      })
      .join(',');

    return options?.maxLength && fullRangeString.length > options.maxLength
      ? `${sortedLines[0]}-${sortedLines.at(-1)}`
      : fullRangeString;
  }
}
