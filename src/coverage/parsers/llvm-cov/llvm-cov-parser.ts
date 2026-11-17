/**
 * @file Parses llvm-cov JSON exports into the shared coverage model.
 */

import { isRecord } from '../../../record-guard.js';
import type {
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
  filenames?: string[];
};

/**
 * @internal
 */
type LlvmExport = {
  type: string;
  data: {
    files?: LlvmFile[];
    functions?: LlvmFunction[];
  }[];
};

/**
 * Tells whether parsed JSON is an llvm-cov export.
 * @param value - The parsed JSON.
 * @returns True when the value is an llvm-cov JSON export.
 * @internal
 * @example
 * isLlvmExport({ type: 'llvm.coverage.json.export', data: [] }); // true
 */
function isLlvmExport(value: unknown): value is LlvmExport {
  return (
    isRecord(value) &&
    typeof value.type === 'string' &&
    value.type.startsWith('llvm.coverage.json.export') &&
    Array.isArray(value.data)
  );
}

/**
 * Parses the content of an llvm-cov JSON export.
 * @param content - The JSON content of the coverage report.
 * @returns The parsed export.
 * @throws {Error} If the content is not valid JSON or not an llvm-cov export.
 * @internal
 * @example
 * const report = parseLlvmExport(content);
 */
function parseLlvmExport(content: string): LlvmExport {
  try {
    const parsed: unknown = JSON.parse(content);
    if (isLlvmExport(parsed)) {
      return parsed;
    }
  } catch (error) {
    throw new Error('Content is not valid JSON', { cause: error });
  }
  throw new Error('Not an llvm-cov JSON export');
}

/**
 * Matches paths inside a `.build` directory, where SwiftPM keeps checked-out
 * dependencies and generated sources that are not part of the project.
 * @internal
 */
const DEPENDENCY_PATH = /(^|[\\/])\.build[\\/]/u;

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
  public async parse(content: string): Promise<CoverageData> {
    const json = parseLlvmExport(content);

    const files = json.data.flatMap((entry) => entry.files ?? []);
    const functions = json.data.flatMap((entry) => entry.functions ?? []);

    const methodsByFile = functions.reduce((byFile, fn) => {
      const name = fn.filenames?.[0];
      if (!name) {
        return byFile;
      }
      const metrics = byFile.get(name) ?? { total: 0, covered: 0 };
      // eslint-disable-next-line functional/immutable-data -- builds the lookup in a single pass; copying the map for every function would be quadratic
      return byFile.set(name, {
        total: metrics.total + 1,
        covered: metrics.covered + (fn.count > 0 ? 1 : 0),
      });
    }, new Map<string, CoverageMetrics>());

    const details = files
      .filter((file) => !DEPENDENCY_PATH.test(file.filename))
      .map((file) =>
        this.processFile(
          file,
          methodsByFile.get(file.filename) ?? { total: 0, covered: 0 },
        ),
      );

    return {
      overall: this.aggregateOverallCoverage(details),
      details,
    };
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
    const groups = segments.flatMap((segment, index) =>
      index === 0 || segments[index - 1][0] !== segment[0] ? [index] : [],
    );

    const entries = groups.flatMap((index, position): [number, number][] => {
      const line = segments[index][0];
      const end = groups[position + 1] ?? segments.length;
      const wrapped = position > 0 ? segments[groups[position] - 1] : undefined;

      const starting = segments
        .slice(index, end)
        .filter((s) => s[3] && !s[5] && s[4]);
      const startsWithEntry = segments[index][4] && !segments[index][5];
      const wrappedCounts =
        !startsWithEntry && wrapped && wrapped[3] && !wrapped[5];

      const ownCount: [number, number][] =
        starting.length > 0 || wrappedCounts
          ? [
              [
                line,
                Math.max(
                  ...starting.map((s) => s[2]),
                  ...(wrappedCounts ? [wrapped[2]] : []),
                ),
              ],
            ]
          : [];

      // Lines between this one and the next segment are covered by the
      // region that is still open after this line's last segment.
      const last = segments[end - 1];
      const next = end < segments.length ? segments[end][0] : line;
      const between: [number, number][] =
        last[3] && !last[5]
          ? Array.from(
              { length: Math.max(next - line - 1, 0) },
              (_unused, offset): [number, number] => [
                line + 1 + offset,
                last[2],
              ],
            )
          : [];

      return [...ownCount, ...between];
    });

    return new Map(entries);
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
    const lines = {
      total: counts.size,
      covered: [...counts.values()].filter((hits) => hits > 0).length,
    };
    const uncoveredLines = [...counts]
      .flatMap(([line, hits]) => (hits > 0 ? [] : [line]))
      .toSorted((a, b) => a - b);

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
