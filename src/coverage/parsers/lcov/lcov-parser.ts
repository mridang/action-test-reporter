/**
 * @file Parses LCOV tracefiles into the shared coverage model.
 */

import type {
  CoverageParser,
  CoverageData,
  CoverageMetrics,
  FileCoverageDetails,
} from '../coverage-parser.js';

/**
 * A parser for LCOV string-based coverage reports.
 * @class LcovParser
 * @implements {CoverageParser}
 */
export class LcovParser implements CoverageParser {
  /**
   * Parses the LCOV content string line by line.
   * @memberof LcovParser
   * @param content - The LCOV content of the coverage report.
   * @returns A promise that resolves to the
   * structured file coverage data.
   */
  public async parse(content: string): Promise<CoverageData> {
    const records = content.split('end_of_record');
    const details: FileCoverageDetails[] = records
      .map((record) => this.parseRecord(record))
      .filter((data): data is FileCoverageDetails => !!data);

    const overall = this.aggregateOverallCoverage(details);

    return { overall, details };
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

    const entries = record.split('\n').flatMap((line): [string, string][] => {
      const [type, value] = line.split(':');
      return type && value ? [[type.toUpperCase(), value]] : [];
    });
    const lastValue = (type: string): string | undefined =>
      entries.findLast(([entryType]) => entryType === type)?.[1];
    const lastNumber = (type: string): number => Number(lastValue(type) ?? 0);

    const file = lastValue('SF');
    if (!file) {
      return null;
    }

    const lineHits = new Map<number, number>(
      entries
        .filter(([type]) => type === 'DA')
        .map(([, value]): [number, number] => {
          const [line, hit] = value.split(',');
          return [Number(line), Number(hit)];
        }),
    );
    const lines: CoverageMetrics = {
      total: lastNumber('LF') || lineHits.size,
      covered: lastNumber('LH'),
    };

    return {
      file,
      lines,
      methods: { total: lastNumber('FNF'), covered: lastNumber('FNH') },
      branches: { total: lastNumber('BRF'), covered: lastNumber('BRH') },
      statements: { ...lines },
      uncoveredLines: [...lineHits.entries()].flatMap(([lineNumber, hits]) =>
        hits === 0 ? [lineNumber] : [],
      ),
    };
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
    const sum = (
      pick: (detail: FileCoverageDetails) => CoverageMetrics,
    ): CoverageMetrics => ({
      total: details.reduce((total, d) => total + pick(d).total, 0),
      covered: details.reduce((total, d) => total + pick(d).covered, 0),
    });
    return {
      lines: sum((d) => d.lines),
      statements: sum((d) => d.statements),
      methods: sum((d) => d.methods),
      branches: sum((d) => d.branches),
    };
  }
}
