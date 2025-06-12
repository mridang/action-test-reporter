import { parseStringPromise } from 'xml2js';
import { CoverageParser, CoverageData } from './coverage-parser.js';

/**
 * An abstract base class for XML-based coverage report parsers.
 * It is generic over the expected type of the parsed XML object.
 * @export
 * @abstract
 * @class BaseParser
 * @implements {CoverageParser}
 * @template T The specific type of the parsed XML structure for a subclass.
 */
export abstract class BaseParser<T> implements CoverageParser {
  /**
   * Parses the XML content string into a structured object and then
   * delegates to the abstract `process` method for format-specific logic.
   * @param {string} content - The XML content of the coverage report.
   * @returns {Promise<CoverageData>} A promise that resolves to file
   * coverage data.
   * @memberof BaseParser
   */
  public async parse(content: string): Promise<CoverageData> {
    const xml: T = await parseStringPromise(content);
    return this.process(xml);
  }

  /**
   * Abstract method for format-specific logic, to be implemented by
   * subclasses.
   * @protected
   * @abstract
   * @param {T} xml - The strongly-typed parsed XML data.
   * @returns {Promise<CoverageData>} A promise that resolves to file
   * coverage data.
   * @memberof BaseParser
   */
  protected abstract process(xml: T): Promise<CoverageData>;
}
