const NET_DURATION_PATTERN = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)$/;
const ISO_DATE_PATTERN =
  /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/;
const BLANK_LINE_PATTERN = /^\s*$/;
/**
 * @file Provides helpers that parse durations, dates and stack traces from test reports.
 */

/**
 * Parses a .NET duration in the form hh:mm:ss, with optional fractional seconds, into milliseconds.
 * @param text - The duration text to parse.
 * @returns The duration in milliseconds.
 * @throws {Error} When the text is not in the expected format.
 * @example
 * const ms = parseNetDuration('00:01:30.5'); // 90500
 */
export function parseNetDuration(text: string): number {
  const durationRe = NET_DURATION_PATTERN;
  const durationMatch = durationRe.exec(text);
  if (durationMatch === null) {
    throw new Error(`Invalid format: "${text}" is not NET duration`);
  }

  const [, hourString, minString, secString] = durationMatch;
  return (
    (Number.parseInt(hourString) * 3600 +
      Number.parseInt(minString) * 60 +
      Number.parseFloat(secString)) *
    1000
  );
}

/**
 * Parses an ISO 8601 date-time with a fractional second and a time zone offset.
 * @param text - The date text to parse.
 * @returns The parsed date.
 * @throws {Error} When the text is not an ISO 8601 date-time.
 * @example
 * const date = parseIsoDate('2024-05-01T10:00:00.000Z');
 */
export function parseIsoDate(text: string): Date {
  const isoDateRe = ISO_DATE_PATTERN;
  if (typeof text !== 'string' || !isoDateRe.test(text)) {
    throw new Error(`Invalid format: "${text}" is not ISO date`);
  }

  return new Date(text);
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
  return lines?.find((line) => !BLANK_LINE_PATTERN.test(line));
}
