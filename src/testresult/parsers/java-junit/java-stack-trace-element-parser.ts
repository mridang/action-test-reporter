/**
 * @file Parses Java stack trace lines into their class, method and location parts.
 */

interface StackTraceElement {
  classLoader: string | undefined;
  moduleNameAndVersion: string | undefined;
  tracePath: string;
  fileName: string;
  lineStr: string;
}

// eslint-disable-next-line sonarjs/super-linear-regex -- applied to a single stack trace line
const re = /^\s*at (\S+\/\S*\/)?(.*)\((.*):(\d+)\)$/;

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
    const [
      ,
      maybeClassLoaderAndModuleNameAndVersion,
      tracePath,
      fileName,
      lineStr,
    ] = match;
    const { classLoader, moduleNameAndVersion } = parseClassLoaderAndModule(
      maybeClassLoaderAndModuleNameAndVersion,
    );
    return {
      classLoader,
      moduleNameAndVersion,
      tracePath,
      fileName,
      lineStr,
    };
  }
  return undefined;
}

/**
 * Splits the class loader and the module name and version from a stack trace element.
 * @param maybeClassLoaderAndModuleNameAndVersion - The text before the trace path, which may be empty.
 * @returns The class loader and module with its version, each undefined when absent.
 * @example
 * const { classLoader, moduleNameAndVersion } = parseClassLoaderAndModule('app/module@1.0');
 */
function parseClassLoaderAndModule(
  maybeClassLoaderAndModuleNameAndVersion?: string,
): {
  classLoader?: string;
  moduleNameAndVersion?: string;
} {
  if (maybeClassLoaderAndModuleNameAndVersion) {
    const res = maybeClassLoaderAndModuleNameAndVersion.split('/');
    const classLoader = res[0];
    const moduleNameAndVersion = res[1] || undefined;
    return { classLoader, moduleNameAndVersion };
  }
  return {};
}
