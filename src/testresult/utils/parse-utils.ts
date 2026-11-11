/**
 * @file Provides helpers that parse durations, dates and stack traces from test reports.
 */

/**
 * Parses a .NET duration in the form hh:mm:ss, with optional fractional seconds, into milliseconds.
 * @param str - The duration text to parse.
 * @returns The duration in milliseconds.
 * @throws {Error} When the text is not in the expected format.
 * @example
 * const ms = parseNetDuration('00:01:30.5'); // 90500
 */
export function parseNetDuration(str: string): number {
  const durationRe = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)$/;
  const durationMatch = durationRe.exec(str);
  if (durationMatch === null) {
    throw new Error(`Invalid format: "${str}" is not NET duration`);
  }

  const [, hourStr, minStr, secStr] = durationMatch;
  return (
    (Number.parseInt(hourStr) * 3600 +
      Number.parseInt(minStr) * 60 +
      Number.parseFloat(secStr)) *
    1000
  );
}

/**
 * Parses an ISO 8601 date-time with a fractional second and a time zone offset.
 * @param str - The date text to parse.
 * @returns The parsed date.
 * @throws {Error} When the text is not an ISO 8601 date-time.
 * @example
 * const date = parseIsoDate('2024-05-01T10:00:00.000Z');
 */
export function parseIsoDate(str: string): Date {
  const isoDateRe =
    /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/;
  if (typeof str !== 'string' || !isoDateRe.test(str)) {
    throw new Error(`Invalid format: "${str}" is not ISO date`);
  }

  return new Date(str);
}

/**
 * Returns the first line of a stack trace that contains text.
 * @param stackTrace - The stack trace to search.
 * @returns The first non-blank line, or undefined when there is none.
 * @example
 * const line = getFirstNonEmptyLine('\n  Error: boom');
 */
export function getFirstNonEmptyLine(stackTrace: string): string | undefined {
  const lines = stackTrace?.split(/\r?\n/g);
  return lines?.find((str) => !/^\s*$/.test(str));
}
