/**
 * @file Parses JaCoCo XML coverage reports into the shared coverage model.
 */

import { BaseParser } from '../base-parser.js';
import {
  CoverageData,
  CoverageMetrics,
  FileCoverageDetails,
} from '../coverage-parser.js';
import { JacocoCounter, JacocoReport, JacocoPackage } from './jacoco-types.js';

/**
 * A parser for JaCoCo XML coverage reports.
 * @class JacocoParser
 * @augments {BaseParser}
 */
export class JacocoParser extends BaseParser<JacocoReport> {
  /**
   * Processes the parsed JaCoCo XML object to extract coverage data.
   * @memberof JacocoParser
   * @param xml - The parsed JaCoCo XML report.
   * @returns A promise that resolves to the
   * structured file coverage data.
   * @protected
   * @example
   * const data = await parser.parse(xml);
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
   * @memberof JacocoParser
   * @param pack - The package object from the report.
   * @returns An array of file coverage details.
   * @private
   * @example
   * const files = this.unpackage(pack);
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
   * @memberof JacocoParser
   * @param counters - The array of counter-elements.
   * @returns The coverage metrics summed across all of the counters.
   * @private
   * @example
   * const metrics = this.aggregateCounters(counters);
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
