import { BaseParser } from './base-parser.js';
import { CoverageData, FileCoverageDetails } from './coverage-parser.js';

type CloverMetricsAttributes = {
  statements: string;
  coveredstatements: string;
  conditionals: string;
  coveredconditionals: string;
  methods: string;
  coveredmethods: string;
};

type CloverLineAttributes = {
  num: string;
  count: string;
};

type CloverLine = { $: CloverLineAttributes };

type CloverFile = {
  $: { name: string };
  metrics: [{ $: CloverMetricsAttributes }];
  line?: CloverLine[];
};

type CloverPackage = {
  file?: CloverFile[];
};

type CloverProject = {
  metrics: [{ $: CloverMetricsAttributes }];
  package?: CloverPackage[];
  file?: CloverFile[];
};

type CloverXml = {
  coverage: {
    project: [CloverProject];
  };
};

/**
 * A parser for Clover XML coverage reports.
 * @export
 * @class CloverParser
 * @extends {BaseParser<CloverXml>}
 */
export class CloverParser extends BaseParser<CloverXml> {
  /**
   * Processes the parsed Clover XML object to extract coverage data.
   * @protected
   * @param {CloverXml} xml - The parsed Clover XML report.
   * @returns {Promise<CoverageData>} A promise that resolves to the
   * structured file coverage data.
   * @memberof CloverParser
   */
  protected process(xml: CloverXml): Promise<CoverageData> {
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
      project.package?.flatMap((p) => p.file || []) || [];
    const filesFromProject = project.file || [];
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
              .map((l) => Number(l.$.num)) || [],
        };
      },
    );

    return Promise.resolve({ overall, details });
  }
}
