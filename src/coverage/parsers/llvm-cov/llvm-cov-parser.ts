/**
 * @file Parses llvm-cov JSON exports into the shared coverage model.
 */

import {
  CoverageParser,
  CoverageData,
  CoverageMetrics,
  FileCoverageDetails,
} from '../coverage-parser.js';

/**
 * A segment as exported by llvm-cov:
 * `[line, column, count, hasCount, isRegionEntry, isGapRegion]`.
 * @internal
 */
type LlvmSegment = [number, number, number, boolean, boolean, boolean?];

/**
 * @internal
 */
type LlvmFile = {
  filename: string;
  segments?: LlvmSegment[];
  summary?: {
    branches?: { count: number; covered: number };
  };
};

/**
 * @internal
 */
type LlvmFunction = {
  count: number;
  filenames: string[];
};

/**
 * @internal
 */
type LlvmExport = {
  type: string;
  data: {
    files: LlvmFile[];
    functions?: LlvmFunction[];
  }[];
};

/**
 * Matches paths inside a `.build` directory, where SwiftPM keeps checked-out
 * dependencies and generated sources that are not part of the project.
 * @internal
 */
const DEPENDENCY_PATH = /(^|[\\/])\.build[\\/]/;

/**
 * A parser for the JSON produced by `llvm-cov export`, which is also the file
 * SwiftPM writes to `.build/<triple>/debug/codecov/<package>.json` when tests
 * run with `--enable-code-coverage`. Files under a `.build` directory
 * (dependencies) are ignored.
 * @class LlvmCovParser
 * @implements {CoverageParser}
 */
export class LlvmCovParser implements CoverageParser {
  /**
   * Parses the llvm-cov JSON export.
   * @memberof LlvmCovParser
   * @param content - The JSON content of the coverage report.
   * @returns A promise that resolves to the
   * structured coverage data.
   * @throws {Error} If the content is not an llvm-cov JSON export.
   */
  public parse(content: string): Promise<CoverageData> {
    let json: LlvmExport;
    try {
      json = JSON.parse(content) as LlvmExport;
    } catch {
      return Promise.reject(new Error('Content is not valid JSON'));
    }

    if (
      !json ||
      typeof json.type !== 'string' ||
      !json.type.startsWith('llvm.coverage.json.export') ||
      !Array.isArray(json.data)
    ) {
      return Promise.reject(new Error('Not an llvm-cov JSON export'));
    }

    const files = json.data.flatMap((entry) => entry.files ?? []);
    const functions = json.data.flatMap((entry) => entry.functions ?? []);

    const methodsByFile = new Map<string, CoverageMetrics>();
    for (const fn of functions) {
      const name = fn.filenames?.[0];
      if (!name) continue;
      const metrics = methodsByFile.get(name) ?? { total: 0, covered: 0 };
      metrics.total += 1;
      if (fn.count > 0) metrics.covered += 1;
      methodsByFile.set(name, metrics);
    }

    const details = files
      .filter((file) => !DEPENDENCY_PATH.test(file.filename))
      .map((file) =>
        this.processFile(
          file,
          methodsByFile.get(file.filename) ?? { total: 0, covered: 0 },
        ),
      );

    return Promise.resolve({
      overall: this.aggregateOverallCoverage(details),
      details,
    });
  }

  /**
   * Derives per-line hit counts from a file's segments, using llvm-cov's
   * rule: a line's count is the largest count among the regions starting on
   * it and the region wrapping into it, ignoring gap regions. The wrapping
   * region is disregarded when the line's first segment opens a new region.
   * @memberof LlvmCovParser
   * @param segments - The segments of a file.
   * @returns Hit counts keyed by line number, holding
   * executable lines only.
   * @private
   */
  private lineCounts(segments: LlvmSegment[]): Map<number, number> {
    const counts = new Map<number, number>();
    let wrapped: LlvmSegment | undefined;
    let i = 0;

    while (i < segments.length) {
      const line = segments[i][0];
      let end = i;
      while (end < segments.length && segments[end][0] === line) end++;

      const starting = segments
        .slice(i, end)
        .filter((s) => s[3] && !s[5] && s[4]);
      const startsWithEntry = segments[i][4] && !segments[i][5];
      const wrappedCounts =
        !startsWithEntry && wrapped && wrapped[3] && !wrapped[5];

      if (starting.length > 0 || wrappedCounts) {
        const candidates = starting.map((s) => s[2]);
        if (wrappedCounts) candidates.push(wrapped![2]);
        counts.set(line, Math.max(...candidates));
      }

      // Lines between this one and the next segment are covered by the
      // region that is still open after this line's last segment.
      const last = segments[end - 1];
      const next = end < segments.length ? segments[end][0] : line;
      if (last[3] && !last[5]) {
        for (let l = line + 1; l < next; l++) counts.set(l, last[2]);
      }
      wrapped = last;
      i = end;
    }

    return counts;
  }

  /**
   * Converts a single exported file to the standard file details.
   * @memberof LlvmCovParser
   * @param file - The exported file.
   * @param methods - Function metrics for the file.
   * @returns The standardized details.
   * @private
   */
  private processFile(
    file: LlvmFile,
    methods: CoverageMetrics,
  ): FileCoverageDetails {
    const counts = this.lineCounts(file.segments ?? []);
    const lines = { total: counts.size, covered: 0 };
    const uncoveredLines: number[] = [];

    for (const [line, hits] of counts) {
      if (hits > 0) lines.covered += 1;
      else uncoveredLines.push(line);
    }
    uncoveredLines.sort((a, b) => a - b);

    const branches = file.summary?.branches;

    return {
      file: file.filename,
      lines,
      statements: { ...lines },
      methods,
      branches: {
        total: branches?.count ?? 0,
        covered: branches?.covered ?? 0,
      },
      uncoveredLines,
    };
  }

  /**
   * Aggregates the details from all files to create an overall summary.
   * @memberof LlvmCovParser
   * @param details - The details for all files.
   * @returns The project-wide coverage summary.
   * @private
   */
  private aggregateOverallCoverage(
    details: FileCoverageDetails[],
  ): CoverageData['overall'] {
    return details.reduce(
      (acc, detail) => {
        for (const key of [
          'lines',
          'statements',
          'methods',
          'branches',
        ] as const) {
          acc[key].total += detail[key].total;
          acc[key].covered += detail[key].covered;
        }
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
