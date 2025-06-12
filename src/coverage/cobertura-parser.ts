import path from 'path';
import { BaseParser } from './base-parser.js';
import {
  CoverageData,
  FileCoverageDetails,
  CoverageMetrics,
} from './coverage-parser.js';

type CoberturaLineAttributes = {
  number: string;
  hits: string;
  branch?: string;
  'condition-coverage'?: string;
};
type CoberturaLine = { $: CoberturaLineAttributes };

type CoberturaMethod = {
  $: { name: string };
  lines: [{ line: CoberturaLine[] }];
};

type CoberturaClass = {
  $: { name: string; filename: string };
  methods?: [{ method: CoberturaMethod[] }];
  lines?: [{ line: CoberturaLine[] }];
};

type CoberturaPackage = {
  classes: [{ class: CoberturaClass[] }];
};

type CoberturaPackages = {
  package: CoberturaPackage[];
};

type CoberturaXml = {
  coverage: {
    $: {
      'lines-valid': string;
      'lines-covered': string;
      'branches-valid': string;
      'branches-covered': string;
    };
    sources: [{ source: string[] }];
    packages: CoberturaPackages[];
  };
};

/**
 * A parser for Cobertura XML coverage reports.
 * @export
 * @class CoberturaParser
 * @extends {BaseParser}
 */
export class CoberturaParser extends BaseParser<CoberturaXml> {
  /**
   * Processes the parsed Cobertura XML object to extract coverage data.
   * @protected
   * @param {CoberturaXml} xml - The parsed Cobertura XML report.
   * @returns {Promise<CoverageData>} A promise that resolves to the
   * structured file coverage data.
   * @memberof CoberturaParser
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
   * @private
   * @param {CoberturaPackages[]} packages - The array of package elements.
   * @returns {CoberturaClass[]} An array of all found class elements.
   * @memberof CoberturaParser
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
   * @private
   * @param {CoberturaClass} c - The class element.
   * @returns {CoverageMetrics} The structured line coverage.
   * @memberof CoberturaParser
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
   * @private
   * @param {CoberturaClass} c - The class element.
   * @returns {CoverageMetrics} The structured function coverage.
   * @memberof CoberturaParser
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
   * @private
   * @param {CoberturaClass} c - The class element.
   * @returns {CoverageMetrics} An array of branch coverage details.
   * @memberof CoberturaParser
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
