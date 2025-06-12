import { BaseParser } from './base-parser.js';
import {
  CoverageData,
  CoverageMetrics,
  FileCoverageDetails,
} from './coverage-parser.js';

type JacocoCounter = {
  $: { type: string; missed: string; covered: string };
};
type JacocoLine = {
  $: { nr: string; mi: string; ci: string; mb: string; cb: string };
};
type JacocoSourceFile = {
  $: { name: string };
  line?: JacocoLine[];
  counter: JacocoCounter[];
};
type JacocoPackage = {
  $: { name: string };
  sourcefile: JacocoSourceFile[];
};
type JacocoReport = {
  report: { package: JacocoPackage[]; counter: JacocoCounter[] };
};

/**
 * A parser for JaCoCo XML coverage reports.
 * @export
 * @class JacocoParser
 * @extends {BaseParser}
 */
export class JacocoParser extends BaseParser<JacocoReport> {
  /**
   * Processes the parsed JaCoCo XML object to extract coverage data.
   * @protected
   * @param {JacocoReport} xml - The parsed JaCoCo XML report.
   * @returns {Promise<CoverageData>} A promise that resolves to the
   * structured file coverage data.
   * @memberof JacocoParser
   */
  protected process(xml: JacocoReport): Promise<CoverageData> {
    const overall = this.aggregateCounters(xml.report.counter);
    const details = (xml.report.package || []).flatMap((p) =>
      this.unpackage(p),
    );

    return Promise.resolve({ overall, details });
  }

  /**
   * Extracts coverage information from a single package element.
   * @private
   * @param {JacocoPackage} pack - The package object from the report.
   * @returns {FileCoverageDetails[]} An array of file coverage details.
   * @memberof JacocoParser
   */
  private unpackage(pack: JacocoPackage): FileCoverageDetails[] {
    return (pack.sourcefile || []).map((s) => {
      const metrics = this.aggregateCounters(s.counter);
      return {
        file: `${pack.$.name}/${s.$.name}`,
        ...metrics,
        uncoveredLines:
          s.line?.filter((l) => l.$.ci === '0').map((l) => Number(l.$.nr)) ||
          [],
      };
    });
  }

  /**
   * Aggregates an array of Jacoco counter elements into the standard
   * coverage metrics object.
   * @private
   * @param {JacocoCounter[]} counters - The array of counter elements.
   * @returns {Omit<FileCoverageDetails, 'file' | 'uncoveredLines'>}
   * The aggregated coverage metrics.
   * @memberof JacocoParser
   */
  private aggregateCounters(
    counters: JacocoCounter[],
  ): Omit<FileCoverageDetails, 'file' | 'uncoveredLines'> {
    const metrics: Record<string, CoverageMetrics> = {};
    (counters || []).forEach((c) => {
      const type = c.$.type.toLowerCase();
      metrics[type] = {
        covered: Number(c.$.covered),
        total: Number(c.$.covered) + Number(c.$.missed),
      };
    });

    return {
      lines: metrics.line || { covered: 0, total: 0 },
      branches: metrics.branch || { covered: 0, total: 0 },
      methods: metrics.method || { covered: 0, total: 0 },
      statements: metrics.instruction || { covered: 0, total: 0 },
    };
  }
}
