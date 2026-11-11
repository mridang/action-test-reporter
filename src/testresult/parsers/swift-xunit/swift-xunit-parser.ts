/**
 * @file Parses xUnit XML test results produced by Swift test runners.
 */

import { ParseOptions } from '../../test-parser.js';
import { JavaJunitParser } from '../java-junit/java-junit-parser.js';

/**
 * Parser for xUnit-style XML reports produced by Swift test tools.
 */
export class SwiftXunitParser extends JavaJunitParser {
  constructor(readonly options: ParseOptions) {
    super(options);
  }
}
