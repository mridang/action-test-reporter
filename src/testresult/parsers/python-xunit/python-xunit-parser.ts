import { ParseOptions } from '../../test-parser.js';
import { JavaJunitParser } from '../java-junit/java-junit-parser.js';

/**
 * Parser for xUnit XML reports emitted by Python testing tools such as pytest and unittest.
 */
export class PythonXunitParser extends JavaJunitParser {
  constructor(readonly options: ParseOptions) {
    super(options);
  }
}
