const LEADING_NON_WHITESPACE = /^\S*/u;
/**
 * @file Parses Java stack trace lines into their class, method and location parts.
 */

interface StackTraceElement {
  loader: string | undefined;
  moduleNameAndVersion: string | undefined;
  tracePath: string;
  fileName: string;
  lineStr: string;
}

const re = /^\s*at (.*)\(([^(]*):(\d+)\)$/u;

/**
 * Splits the text between the word at and the location into the optional class loader and module prefix and the
 * trace path. The prefix is the longest run of non-whitespace characters from the start that ends with a slash and
 * holds another slash after its first character.
 * @param text - The text between the word at and the opening parenthesis of the location.
 * @returns The prefix, which is undefined when absent, and the rest of the text.
 * @example
 * const [prefix, tracePath] = splitClassLoaderPrefix('app//com.example.App.run');
 */
export function splitClassLoaderPrefix(
  text: string,
): [prefix: string | undefined, rest: string] {
  const runLength = LEADING_NON_WHITESPACE.exec(text)?.[0].length ?? 0;
  const firstSlash = text.indexOf('/', 1);
  if (firstSlash === -1 || firstSlash >= runLength) {
    return [undefined, text];
  }
  const lastSlash = text.lastIndexOf('/', runLength - 1);
  return lastSlash > firstSlash
    ? [text.slice(0, lastSlash + 1), text.slice(lastSlash + 1)]
    : [undefined, text];
}

/**
 * Parses a single Java stack trace line into its class loader, module, file and line parts.
 * @param stackTraceLine - The stack trace line, such as the text after the word at.
 * @returns The parsed parts of the line, or undefined when the line is not a stack trace element.
 * @example
 * const element = parseStackTraceElement('at com.example.App.run(App.java:42)');
 */
export function parseStackTraceElement(
  stackTraceLine: string,
): StackTraceElement | undefined {
  const match = re.exec(stackTraceLine);
  if (match !== null) {
    const [, beforeLocation, fileName, lineString] = match;
    const [maybeClassLoaderAndModuleNameAndVersion, tracePath] =
      splitClassLoaderPrefix(beforeLocation);
    const loaderAndModule = maybeClassLoaderAndModuleNameAndVersion
      ? maybeClassLoaderAndModuleNameAndVersion.split('/')
      : [];
    const loader = loaderAndModule[0] as string | undefined;
    const moduleNameAndVersion = loaderAndModule[1] || undefined;
    return {
      loader,
      moduleNameAndVersion,
      tracePath,
      fileName,
      lineStr: lineString,
    };
  }
  return undefined;
}
