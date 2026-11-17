/**
 * @file Provides the shared base class for coverage parsers, with common path and file handling.
 */

import { parseStringPromise } from 'xml2js';
import type { CoverageParser, CoverageData } from './coverage-parser.js';

/**
 * An abstract base class for XML-based coverage report parsers.
 * It is generic over the expected type of the parsed XML object.
 * @template T The specific type of the parsed XML structure for a subclass.
 * @class BaseParser
 * @implements {CoverageParser}
 * @abstract
 */
export abstract class BaseParser<T> implements CoverageParser {
  /**
   * Parses the XML content string into a structured object and then
   * delegates to the abstract `process` method for format-specific logic.
   * @memberof BaseParser
   * @param content - The XML content of the coverage report.
   * @returns A promise that resolves to file
   * coverage data.
   */
  public async parse(content: string): Promise<CoverageData> {
    const xml: unknown = await parseStringPromise(content);
    if (!this.isReport(xml)) {
      throw new TypeError('The XML content is not a supported coverage report');
    }
    return this.process(xml);
  }

  /**
   * Tells whether the parsed XML has the root structure of the report format.
   * @abstract
   * @memberof BaseParser
   * @param {unknown} xml - The parsed XML data.
   * @returns {boolean} True when the data has the report's root element.
   * @protected
   */
  protected abstract isReport(xml: unknown): xml is T;

  /**
   * Abstract method for format-specific logic, to be implemented by
   * subclasses.
   * @abstract
   * @memberof BaseParser
   * @param {T} xml - The strongly typed parsed XML data.
   * @returns {Promise<CoverageData>} A promise that resolves to file
   * coverage data.
   * @protected
   */
  protected abstract process(xml: T): Promise<CoverageData>;
}
