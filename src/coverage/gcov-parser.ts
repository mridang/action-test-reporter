import {
  CoverageParser,
  CoverageData,
  CoverageMetrics,
  FileCoverageDetails,
} from './coverage-parser.js';

type GcovLine = {
  executionCount: number | null;
  lineNumber: number;
  sourceCode: string;
};

type GcovFileSection = {
  filename: string;
  lines: GcovLine[];
  summary?: {
    linesExecuted: { covered: number; total: number };
    branchesExecuted?: { covered: number; total: number };
    functionsExecuted?: { covered: number; total: number };
  };
};

/**
 * A parser for gcov text output files.
 * @export
 * @class GcovParser
 * @implements {CoverageParser}
 */
export class GcovParser implements CoverageParser {
  /**
   * Parses the gcov text content to extract coverage data.
   * @param {string} content - The gcov text content.
   * @returns {Promise<CoverageData>} A promise that resolves to the
   * structured coverage data.
   * @memberof GcovParser
   */
  public async parse(content: string): Promise<CoverageData> {
    const sections = this.parseGcovContent(content);

    if (sections.length === 0) {
      throw new Error('No valid gcov data found in content');
    }

    const details = sections.map((section) =>
      this.processSectionToDetails(section),
    );
    const overall = this.aggregateOverallCoverage(details);

    return { overall, details };
  }

  /**
   * Parses the complete gcov text content into file sections.
   * @private
   * @param {string} content - The raw gcov text content.
   * @returns {GcovFileSection[]} Array of parsed file sections.
   * @memberof GcovParser
   */
  private parseGcovContent(content: string): GcovFileSection[] {
    const lines = content.split('\n');
    const sections: GcovFileSection[] = [];
    let currentSection: GcovFileSection | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      const fileMatch = line.match(/^File\s+'(.+)'$/);
      const creatingMatch = line.match(/^Creating\s+'(.+)'$/);

      if (fileMatch || creatingMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }

        const filename = fileMatch
          ? fileMatch[1]
          : creatingMatch![1].replace(/\.gcov$/, '');
        currentSection = {
          filename,
          lines: [],
        };
        continue;
      }

      if (currentSection) {
        const linesMatch = line.match(/^Lines executed:(\d+\.\d+)% of (\d+)$/);
        const branchesMatch = line.match(
          /^Branches executed:(\d+\.\d+)% of (\d+)$/,
        );
        const functionsMatch = line.match(
          /^Functions executed:(\d+\.\d+)% of (\d+)$/,
        );

        if (linesMatch) {
          const percentage = parseFloat(linesMatch[1]);
          const total = parseInt(linesMatch[2], 10);
          const covered = Math.round((percentage / 100) * total);

          if (!currentSection.summary) {
            currentSection.summary = {
              linesExecuted: { covered: 0, total: 0 },
            };
          }
          currentSection.summary.linesExecuted = { covered, total };
          continue;
        }

        if (branchesMatch) {
          const percentage = parseFloat(branchesMatch[1]);
          const total = parseInt(branchesMatch[2], 10);
          const covered = Math.round((percentage / 100) * total);

          if (!currentSection.summary) {
            currentSection.summary = {
              linesExecuted: { covered: 0, total: 0 },
            };
          }
          currentSection.summary.branchesExecuted = { covered, total };
          continue;
        }

        if (functionsMatch) {
          const percentage = parseFloat(functionsMatch[1]);
          const total = parseInt(functionsMatch[2], 10);
          const covered = Math.round((percentage / 100) * total);

          if (!currentSection.summary) {
            currentSection.summary = {
              linesExecuted: { covered: 0, total: 0 },
            };
          }
          currentSection.summary.functionsExecuted = { covered, total };
          continue;
        }
      }

      const lineMatch = line.match(/^\s*([#\d-]+):\s*(\d+):\s*(.*)/);
      if (lineMatch && currentSection) {
        const [, countStr, lineNumberStr, sourceCode] = lineMatch;
        const lineNumber = parseInt(lineNumberStr, 10);

        let executionCount: number | null = null;

        if (countStr.trim() === '-') {
          executionCount = null;
        } else if (countStr.trim() === '#####') {
          executionCount = 0;
        } else {
          const count = parseInt(countStr.trim(), 10);
          if (!isNaN(count)) {
            executionCount = count;
          }
        }

        currentSection.lines.push({
          lineNumber,
          executionCount,
          sourceCode: sourceCode || '',
        });
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Converts a gcov file section into standardized coverage details.
   * @private
   * @param {GcovFileSection} section - The parsed gcov file section.
   * @returns {FileCoverageDetails} The standardized coverage details.
   * @memberof GcovParser
   */
  private processSectionToDetails(
    section: GcovFileSection,
  ): FileCoverageDetails {
    const executableLines = section.lines.filter(
      (line: GcovLine) => line.executionCount !== null,
    );
    const coveredLines = executableLines.filter(
      (line: GcovLine) => (line.executionCount ?? 0) > 0,
    );
    const uncoveredLines = executableLines
      .filter((line: GcovLine) => line.executionCount === 0)
      .map((line: GcovLine) => line.lineNumber);

    let lines: CoverageMetrics;
    const branches: CoverageMetrics = { total: 0, covered: 0 };
    const methods: CoverageMetrics = { total: 0, covered: 0 };

    if (section.summary?.linesExecuted) {
      lines = section.summary.linesExecuted;
    } else {
      lines = {
        total: executableLines.length,
        covered: coveredLines.length,
      };
    }

    if (section.summary?.branchesExecuted) {
      branches.total = section.summary.branchesExecuted.total;
      branches.covered = section.summary.branchesExecuted.covered;
    }

    if (section.summary?.functionsExecuted) {
      methods.total = section.summary.functionsExecuted.total;
      methods.covered = section.summary.functionsExecuted.covered;
    }

    return {
      file: section.filename,
      lines,
      statements: lines,
      branches,
      methods,
      uncoveredLines,
    };
  }

  /**
   * Aggregates the details from all files to create an overall summary.
   * @private
   * @param {FileCoverageDetails[]} details - The details for all files.
   * @returns {CoverageData['overall']} The project-wide coverage summary.
   * @memberof GcovParser
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
