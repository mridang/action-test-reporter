/**
 * Transforms an array of numbers into a compact, human-readable string of
 * continuous ranges. This pure function is designed to make lists of
 * numbers, such as uncovered code lines, easier to read.
 *
 * If the resulting string exceeds the optional maxLength, a single compact
 * range from the first to the last number is returned instead.
 *
 * @export
 * @param {number[]} lines - An array of numbers. The function will internally
 * sort this array, so the input does not need to be pre-sorted. An empty
 * array will result in an empty string.
 * @param {object} [options] - Optional configuration.
 * @param {number} [options.maxLength] - The maximum character length for the
 * output string. If exceeded, a simplified range is returned.
 * @returns {string} A comma-separated string representing the number ranges.
 * @example
 * formatUncoveredLines([3, 5, 4, 8, 11, 10]); // Returns "3-5,8,10-11"
 * @example
 * formatUncoveredLines([...Array(100).keys()], { maxLength: 20 }); // Returns "0-99"
 */
export function formatUncoveredLines(
  lines: number[],
  options?: { maxLength?: number },
): string {
  if (lines.length === 0) {
    return '';
  } else {
    const sortedLines = [...lines].sort((a, b) => a - b);

    const groupedRanges = sortedLines.reduce(
      (acc: number[][], current: number) => {
        const lastGroup = acc[acc.length - 1];
        if (acc.length === 0 || current > lastGroup[lastGroup.length - 1] + 1) {
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
        if (group.length > 1) {
          return `${group[0]}-${group[group.length - 1]}`;
        } else {
          return `${group[0]}`;
        }
      })
      .join(',');

    if (options?.maxLength && fullRangeString.length > options.maxLength) {
      return `${sortedLines[0]}-${sortedLines[sortedLines.length - 1]}`;
    } else {
      return fullRangeString;
    }
  }
}
