import {
  CoverageParser,
  CoverageData,
  FileCoverageDetails,
} from '../coverage-parser.js';
import { LcovFileBuilder } from './lcov-types.js';

/**
 * A parser for LCOV string-based coverage reports.
 * @class LcovParser
 * @implements {CoverageParser}
 * @export
 */
export class LcovParser implements CoverageParser {
  /**
   * Parses the LCOV content string line by line.
   * @memberof LcovParser
   * @param content - The LCOV content of the coverage report.
   * @returns A promise that resolves to the
   * structured file coverage data.
   */
  public parse(content: string): Promise<CoverageData> {
    const records = content.split('end_of_record');
    const details: FileCoverageDetails[] = records
      .map((record) => this.parseRecord(record))
      .filter((data): data is FileCoverageDetails => !!data);

    const overall = this.aggregateOverallCoverage(details);

    return Promise.resolve({ overall, details });
  }

  /**
   * Creates a new, empty builder object for a file record.
   * @memberof LcovParser
   * @returns An empty builder object.
   * @private
   */
  private createNewBuilder(): LcovFileBuilder {
    return {
      file: '',
      functions: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
      lines: { total: 0, covered: 0, details: new Map() },
    };
  }

  /**
   * Parses a single "record" block from an LCOV file.
   * @memberof LcovParser
   * @param record - A block of LCOV data for a single file.
   * @returns The parsed coverage data or
   * null if the record is empty.
   * @private
   */
  private parseRecord(record: string): FileCoverageDetails | null {
    if (record.trim() === '') {
      return null;
    }

    const builder = this.createNewBuilder();

    for (const line of record.split('\n')) {
      const [type, value] = line.split(':') as [string, string | undefined];
      if (type && value) {
        this.processLine(type.toUpperCase(), value, builder);
      }
    }

    if (!builder.file) {
      return null;
    }

    builder.lines.total = builder.lines.total || builder.lines.details.size;

    const uncoveredLines = [...builder.lines.details.entries()]
      .filter(([, hits]) => hits === 0)
      .map(([lineNum]) => lineNum);

    return {
      file: builder.file,
      lines: {
        total: builder.lines.total,
        covered: builder.lines.covered,
      },
      methods: builder.functions,
      branches: builder.branches,
      statements: {
        total: builder.lines.total,
        covered: builder.lines.covered,
      },
      uncoveredLines,
    };
  }

  /**
   * Processes a single line of an LCOV record and updates the builder.
   * @memberof LcovParser
   * @param type - The LCOV data type (e.g., 'SF', 'DA').
   * @param value - The value associated with the type.
   * @param builder - The file builder to populate.
   * @private
   */
  private processLine(
    type: string,
    value: string,
    builder: LcovFileBuilder,
  ): void {
    switch (type) {
      case 'SF': {
        builder.file = value;
        break;
      }
      case 'DA': {
        const [line, hit] = value.split(',');
        builder.lines.details.set(Number(line), Number(hit));
        break;
      }
      case 'LF': {
        builder.lines.total = Number(value);
        break;
      }
      case 'LH': {
        builder.lines.covered = Number(value);
        break;
      }
      case 'FNF': {
        builder.functions.total = Number(value);
        break;
      }
      case 'FNH': {
        builder.functions.covered = Number(value);
        break;
      }
      case 'BRF': {
        builder.branches.total = Number(value);
        break;
      }
      case 'BRH': {
        builder.branches.covered = Number(value);
        break;
      }
    }
  }

  /**
   * Aggregates the details from all files to create an overall summary.
   * @memberof LcovParser
   * @param details - The details for all files.
   * @returns The project-wide coverage summary.
   * @private
   */
  private aggregateOverallCoverage(
    details: FileCoverageDetails[],
  ): CoverageData['overall'] {
    return details.reduce(
      (acc, detail) => {
        acc.lines.total += detail.lines.total;
        acc.lines.covered += detail.lines.covered;
        acc.statements.total += detail.statements.total;
        acc.statements.covered += detail.statements.covered;
        acc.methods.total += detail.methods.total;
        acc.methods.covered += detail.methods.covered;
        acc.branches.total += detail.branches.total;
        acc.branches.covered += detail.branches.covered;
        return acc;
      },
      {
        lines: { total: 0, covered: 0 },
        statements: { total: 0, covered: 0 },
        methods: { total: 0, covered: 0 },
        branches: { total: 0, covered: 0 },
      },
    );
  }
}
