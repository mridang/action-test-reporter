import path from 'node:path';
import { BaseParser } from '../base-parser.js';
import {
  CoverageData,
  FileCoverageDetails,
  CoverageMetrics,
} from '../coverage-parser.js';
import {
  CoberturaXml,
  CoberturaClass,
  CoberturaLine,
  CoberturaPackages,
  CoberturaPackage,
  CoberturaMethod,
} from './cobertura-types.js';

/**
 * A parser for Cobertura XML coverage reports.
 * @class CoberturaParser
 * @augments {BaseParser}
 * @export
 */
export class CoberturaParser extends BaseParser<CoberturaXml> {
  /**
   * Processes the parsed Cobertura XML object to extract coverage data.
   * @memberof CoberturaParser
   * @param xml - The parsed Cobertura XML report.
   * @returns A promise that resolves to the
   * structured file coverage data.
   * @protected
   */
  protected process(xml: CoberturaXml): Promise<CoverageData> {
    const coverage = xml.coverage;
    const overall: CoverageData['overall'] = {
      lines: {
        total: Number(coverage.$['lines-valid'] ?? 0),
        covered: Number(coverage.$['lines-covered'] ?? 0),
      },
      branches: {
        total: Number(coverage.$['branches-valid'] ?? 0),
        covered: Number(coverage.$['branches-covered'] ?? 0),
      },
      methods: { total: 0, covered: 0 },
      statements: {
        total: Number(coverage.$['lines-valid'] ?? 0),
        covered: Number(coverage.$['lines-covered'] ?? 0),
      },
    };

    const sourceDir = coverage.sources[0].source[0];
    const details: FileCoverageDetails[] = this.classesFromPackages(
      coverage.packages,
    ).map((c: CoberturaClass): FileCoverageDetails => {
      const lines = this.getLineCoverage(c);
      const methods = this.getFunctionCoverage(c);
      const branches = this.getBranchCoverage(c);

      overall.methods.total += methods.total;
      overall.methods.covered += methods.covered;

      return {
        file: path.join(sourceDir, c.$.filename),
        lines,
        methods,
        branches,
        statements: lines,
        uncoveredLines:
          c.lines?.[0]?.line
            ?.filter((l: CoberturaLine) => l.$.hits === '0')
            .map((l: CoberturaLine) => Number(l.$.number)) || [],
      };
    });

    return Promise.resolve({ overall, details });
  }

  /**
   * Extracts all class elements from the package structure.
   * @memberof CoberturaParser
   * @param packages - The array of package elements.
   * @returns An array of all found class elements.
   * @private
   */
  private classesFromPackages(packages: CoberturaPackages[]): CoberturaClass[] {
    return (packages || []).flatMap((p) =>
      (p.package || []).flatMap((pack: CoberturaPackage) =>
        (pack.classes || []).flatMap((c) => c.class),
      ),
    );
  }

  /**
   * Extracts line coverage details from a class element.
   * @memberof CoberturaParser
   * @param c - The class element.
   * @returns The structured line coverage.
   * @private
   */
  private getLineCoverage(c: CoberturaClass): CoverageMetrics {
    const lines = c.lines?.[0]?.line || [];
    return {
      total: lines.length,
      covered: lines.filter((l: CoberturaLine) => l.$.hits > '0').length,
    };
  }

  /**
   * Extracts function coverage details from a class element.
   * @memberof CoberturaParser
   * @param c - The class element.
   * @returns The structured function coverage.
   * @private
   */
  private getFunctionCoverage(c: CoberturaClass): CoverageMetrics {
    const methods = c.methods?.[0]?.method || [];
    return {
      total: methods.length,
      covered: methods.filter(
        (m: CoberturaMethod) => m.lines[0].line[0].$.hits > '0',
      ).length,
    };
  }

  /**
   * Extracts branch coverage details from a class element.
   * @memberof CoberturaParser
   * @param c - The class element.
   * @returns An array of branch coverage details.
   * @private
   */
  private getBranchCoverage(c: CoberturaClass): CoverageMetrics {
    if (!c.lines || !c.lines[0].line) {
      return { total: 0, covered: 0 };
    }

    const branchLines = c.lines[0].line.filter(
      (l: CoberturaLine) => l.$.branch === 'true',
    );

    return branchLines.reduce(
      (acc: CoverageMetrics, l: CoberturaLine) => {
        const stats = l.$['condition-coverage']?.match(/\d+/g);
        if (stats && stats.length >= 2) {
          acc.covered += Number(stats[1]);
          acc.total += Number(stats[2]);
        }
        return acc;
      },
      { total: 0, covered: 0 },
    );
  }
}
