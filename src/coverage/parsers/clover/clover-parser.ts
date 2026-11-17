/**
 * @file Parses Clover XML coverage reports into the shared coverage model.
 */

import { isRecord } from '../../../record-guard.js';
import { BaseParser } from '../base-parser.js';
import type { CoverageData, FileCoverageDetails } from '../coverage-parser.js';
import type { CloverFile, CloverXml } from './clover-types.js';

/**
 * A parser for Clover XML coverage reports.
 * @class CloverParser
 * @augments {BaseParser}
 */
export class CloverParser extends BaseParser<CloverXml> {
  /**
   * Tells whether the parsed XML has the root element of a Clover report.
   * @memberof CloverParser
   * @param xml - The parsed XML data.
   * @returns True when the data has the root element.
   * @protected
   * @example
   * const supported = this.isReport(xml);
   */
  protected isReport(xml: unknown): xml is CloverXml {
    return isRecord(xml) && isRecord(xml.coverage);
  }

  /**
   * Processes the parsed Clover XML object to extract coverage data.
   * @memberof CloverParser
   * @param xml - The parsed Clover XML report.
   * @returns A promise that resolves to the
   * structured file coverage data.
   * @protected
   * @example
   * const data = await parser.parse(xml);
   */
  protected async process(xml: CloverXml): Promise<CoverageData> {
    const project = xml.coverage.project[0];
    const projectMetrics = project.metrics[0].$;
    const overall: CoverageData['overall'] = {
      statements: {
        covered: Number(projectMetrics.coveredstatements),
        total: Number(projectMetrics.statements),
      },
      lines: {
        covered: Number(projectMetrics.coveredstatements),
        total: Number(projectMetrics.statements),
      },
      methods: {
        covered: Number(projectMetrics.coveredmethods),
        total: Number(projectMetrics.methods),
      },
      branches: {
        covered: Number(projectMetrics.coveredconditionals),
        total: Number(projectMetrics.conditionals),
      },
    };

    const filesFromPackages =
      project.package?.flatMap((p) => p.file ?? []) ?? [];
    const filesFromProject = project.file ?? [];
    const allFiles: CloverFile[] = [...filesFromPackages, ...filesFromProject];

    const details: FileCoverageDetails[] = allFiles.map(
      (f: CloverFile): FileCoverageDetails => {
        const m = f.metrics[0].$;
        return {
          file: f.$.name,
          statements: {
            covered: Number(m.coveredstatements),
            total: Number(m.statements),
          },
          lines: {
            covered: Number(m.coveredstatements),
            total: Number(m.statements),
          },
          methods: {
            covered: Number(m.coveredmethods),
            total: Number(m.methods),
          },
          branches: {
            covered: Number(m.coveredconditionals),
            total: Number(m.conditionals),
          },
          uncoveredLines:
            f.line
              ?.filter((l) => l.$.count === '0')
              .map((l) => Number(l.$.num)) ?? [],
        };
      },
    );

    return { overall, details };
  }
}
