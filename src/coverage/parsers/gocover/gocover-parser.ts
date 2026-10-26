import {
  CoverageParser,
  CoverageData,
  FileCoverageDetails,
} from '../coverage-parser.js';
import { GocoverBlock, GocoverFileData } from './gocover-types.js';

/**
 * A parser for Go coverage profile files (output of `go test -coverprofile`).
 * @export
 * @class GocoverParser
 * @implements {CoverageParser}
 */
export class GocoverParser implements CoverageParser {
  /**
   * Regular expression to match the mode line at the start of Go coverage files.
   * Valid modes are: set, count, atomic
   */
  private static readonly MODE_REGEX = /^mode:\s*(set|count|atomic)\s*$/;

  /**
   * Regular expression to match coverage block lines.
   * Format: file:startLine.startCol,endLine.endCol numStatements count
   */
  private static readonly BLOCK_REGEX =
    /^(.+):(\d+)\.(\d+),(\d+)\.(\d+)\s+(\d+)\s+(\d+)$/;

  /**
   * Parses Go coverage profile content.
   * @param {string} content - The Go coverage profile content.
   * @returns {Promise<CoverageData>} A promise that resolves to the
   * structured coverage data.
   * @throws {Error} If the content is not valid Go coverage format.
   * @memberof GocoverParser
   */
  public async parse(content: string): Promise<CoverageData> {
    const lines = content.split('\n').filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      throw new Error('Empty Go coverage content');
    }

    const modeLine = lines[0];
    if (!GocoverParser.MODE_REGEX.test(modeLine)) {
      throw new Error(
        'Invalid Go coverage format: missing or invalid mode line',
      );
    }

    const fileDataMap = new Map<string, GocoverFileData>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      const match = line.match(GocoverParser.BLOCK_REGEX);
      if (!match) {
        throw new Error(`Invalid Go coverage format at line ${i + 1}: ${line}`);
      }

      const [
        ,
        filename,
        startLine,
        startCol,
        endLine,
        endCol,
        numStmts,
        count,
      ] = match;

      const block: GocoverBlock = {
        startLine: parseInt(startLine, 10),
        startCol: parseInt(startCol, 10),
        endLine: parseInt(endLine, 10),
        endCol: parseInt(endCol, 10),
        numStatements: parseInt(numStmts, 10),
        count: parseInt(count, 10),
      };

      if (!fileDataMap.has(filename)) {
        fileDataMap.set(filename, { filename, blocks: [] });
      }
      fileDataMap.get(filename)!.blocks.push(block);
    }

    if (fileDataMap.size === 0) {
      throw new Error('No valid Go coverage data found in content');
    }

    const details = Array.from(fileDataMap.values()).map((fileData) =>
      this.processFileToDetails(fileData),
    );
    const overall = this.aggregateOverallCoverage(details);

    return { overall, details };
  }

  /**
   * Converts Go coverage file data into standardized coverage details.
   * @private
   * @param {GocoverFileData} fileData - The parsed Go coverage file data.
   * @returns {FileCoverageDetails} The standardized coverage details.
   * @memberof GocoverParser
   */
  private processFileToDetails(fileData: GocoverFileData): FileCoverageDetails {
    // Track coverage per line: Map<lineNumber, wasCovered>
    const lineCoverage = new Map<number, boolean>();

    for (const block of fileData.blocks) {
      // Mark all lines in the block
      for (let line = block.startLine; line <= block.endLine; line++) {
        const currentCoverage = lineCoverage.get(line);
        // A line is covered if any block covering it has count > 0
        if (currentCoverage === undefined) {
          lineCoverage.set(line, block.count > 0);
        } else if (block.count > 0) {
          lineCoverage.set(line, true);
        }
      }
    }

    const totalLines = lineCoverage.size;
    const coveredLines = Array.from(lineCoverage.values()).filter(
      (covered) => covered,
    ).length;
    const uncoveredLines = Array.from(lineCoverage.entries())
      .filter(([, covered]) => !covered)
      .map(([lineNum]) => lineNum)
      .sort((a, b) => a - b);

    // Calculate statement coverage from blocks
    let totalStatements = 0;
    let coveredStatements = 0;
    for (const block of fileData.blocks) {
      totalStatements += block.numStatements;
      if (block.count > 0) {
        coveredStatements += block.numStatements;
      }
    }

    return {
      file: fileData.filename,
      lines: {
        total: totalLines,
        covered: coveredLines,
      },
      statements: {
        total: totalStatements,
        covered: coveredStatements,
      },
      branches: {
        total: 0,
        covered: 0,
      },
      methods: {
        total: 0,
        covered: 0,
      },
      uncoveredLines,
    };
  }

  /**
   * Aggregates the details from all files to create an overall summary.
   * @private
   * @param {FileCoverageDetails[]} details - The details for all files.
   * @returns {CoverageData['overall']} The project-wide coverage summary.
   * @memberof GocoverParser
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
