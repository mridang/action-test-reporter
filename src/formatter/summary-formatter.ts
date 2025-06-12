import path from 'path';
import { CoverageFormatter } from './coverage-formatter.js';
import {
  CoverageData,
  FileCoverageDetails,
  CoverageMetrics,
} from '../coverage/coverage-parser.js';
import { formatUncoveredLines } from './index.js';

/**
 * @internal
 * Represents a node in the file coverage tree. It can be a directory
 * or a file.
 */
type CoverageNode = {
  children: Map<string, CoverageNode>;
  _coverage?: FileCoverageDetails | CoverageData['overall'];
  _isFile: boolean;
};

/**
 * @internal
 * Options required for building the GitHub summary.
 */
interface SummaryOptions {
  repoUrl: string;
  sha: string;
  rootDir?: string;
}

/**
 * A formatter that generates a rich Markdown summary for GitHub Actions.
 * @export
 * @class SummaryFormatter
 * @implements {CoverageFormatter}
 */
export class SummaryFormatter implements CoverageFormatter {
  /**
   * {@inheritDoc CoverageFormatter.format}
   */
  // @ts-expect-error af sff
  public format(coverageData: CoverageData, options: SummaryOptions): string {
    const tree = this.buildTree(coverageData.details, options.rootDir);
    this.calculateAggregates(tree);

    const body = this.renderTree(tree, options);
    const summaryRow = this.buildRow(
      'All Files',
      coverageData.overall,
      options,
      0,
      true,
    );

    const header = [
      '| File | Statements | Branches | Functions | Lines | Uncovered Lines |',
      '| :--- | :--- | :--- | :--- | :--- | :--- |',
    ];

    return [
      '### Code Coverage Report 📊',
      '',
      'Here are the details about the code coverage for the latest commit.',
      '',
      ...header,
      ...body,
      summaryRow,
    ].join('\n');
  }

  /**
   * Builds the file and directory tree from a flat list of file details.
   * @private
   * @param {FileCoverageDetails[]} details - A flat list of file coverage data.
   * @param {string} [rootDir] - The project's root directory for making paths relative.
   * @returns {CoverageNode} The root node of the constructed file tree.
   */
  private buildTree(
    details: FileCoverageDetails[],
    rootDir?: string,
  ): CoverageNode {
    const root: CoverageNode = { children: new Map(), _isFile: false };
    for (const detail of details) {
      const relativePath = rootDir
        ? path.relative(rootDir, detail.file)
        : detail.file;

      let currentNode = root;
      const pathParts = relativePath.split(path.sep);

      for (const part of pathParts.slice(0, -1)) {
        if (!currentNode.children.has(part)) {
          currentNode.children.set(part, {
            children: new Map(),
            _isFile: false,
          });
        }
        currentNode = currentNode.children.get(part)!;
      }

      const fileName = pathParts[pathParts.length - 1];
      currentNode.children.set(fileName, {
        children: new Map(),
        _coverage: detail,
        _isFile: true,
      });
    }
    return root;
  }

  /**
   * Recursively calculates aggregate coverage for all directories in the tree.
   * @private
   * @param {CoverageNode} node - The current node in the tree to process.
   * @returns {FileCoverageDetails[]} A flat list of all descendant file coverages.
   */
  private calculateAggregates(node: CoverageNode): FileCoverageDetails[] {
    const descendantFiles: FileCoverageDetails[] = [];
    for (const child of node.children.values()) {
      descendantFiles.push(
        ...(child._isFile
          ? [child._coverage as FileCoverageDetails]
          : this.calculateAggregates(child)),
      );
    }

    node._coverage = descendantFiles.reduce(
      (acc, detail) => {
        acc.statements.covered += detail.statements.covered;
        acc.statements.total += detail.statements.total;
        acc.branches.covered += detail.branches.covered;
        acc.branches.total += detail.branches.total;
        acc.methods.covered += detail.methods.covered;
        acc.methods.total += detail.methods.total;
        acc.lines.covered += detail.lines.covered;
        acc.lines.total += detail.lines.total;
        return acc;
      },
      {
        statements: { covered: 0, total: 0 },
        branches: { covered: 0, total: 0 },
        methods: { covered: 0, total: 0 },
        lines: { covered: 0, total: 0 },
      },
    );

    return descendantFiles;
  }

  /**
   * Recursively renders the coverage tree into an array of Markdown table rows.
   * @private
   * @param {CoverageNode} node - The current node of the tree to render.
   * @param {SummaryOptions} options - The options containing repo and commit info.
   * @param {number} [indent=0] - The current indentation level.
   * @param {string} [prefix=''] - The current path prefix.
   * @returns {string[]} An array of formatted Markdown table rows.
   */
  private renderTree(
    node: CoverageNode,
    options: SummaryOptions,
    indent: number = 0,
    prefix: string = '',
  ): string[] {
    let rows: string[] = [];
    const sortedKeys = [...node.children.keys()].sort();

    for (const key of sortedKeys) {
      const child = node.children.get(key)!;
      const currentPath = path.join(prefix, key);

      if (child._isFile) {
        rows.push(
          this.buildRow(
            key,
            child._coverage!,
            options,
            indent,
            false,
            currentPath,
          ),
        );
      } else {
        const dirName = `**${key}/**`;
        rows.push(this.buildRow(dirName, child._coverage!, options, indent));
        rows.push(...this.renderTree(child, options, indent + 2, currentPath));
      }
    }
    return rows;
  }

  /**
   * Builds a single formatted Markdown table row.
   * @private
   * @returns {string} The fully formatted Markdown table row string.
   */
  private buildRow(
    name: string,
    data: FileCoverageDetails | CoverageData['overall'],
    options: SummaryOptions,
    indent = 0,
    isSummary = false,
    filePath?: string,
  ): string {
    const { statements, branches, methods, lines } = data;
    const indentStr = ' '.repeat(indent) + (indent > 0 ? '•  ' : '');
    const fileName = isSummary ? `**${name}**` : name;

    const fileLink = filePath
      ? `[${fileName}](${options.repoUrl}/blob/${options.sha}/${filePath})`
      : fileName;

    const cols = [
      `${indentStr}${fileLink}`,
      this.formatMetric(statements),
      this.formatMetric(branches),
      this.formatMetric(methods),
      this.formatMetric(lines),
      this.formatUncoveredCell(data, options, filePath),
    ];

    return `| ${cols.join(' | ')} |`;
  }

  /**
   * Formats a single metric cell with a progress bar and percentage.
   * @private
   * @param {CoverageMetrics} metric - The metric data to format.
   * @returns {string} The formatted Markdown string for the cell.
   */
  private formatMetric(metric: CoverageMetrics): string {
    const pct =
      metric.total === 0 ? 100 : (metric.covered / metric.total) * 100;
    const progressBar = this.buildProgressBar(pct);
    return `${progressBar} ${pct.toFixed(2)}%`;
  }

  /**
   * Creates the Markdown for the "Uncovered Lines" cell, including links.
   * @private
   * @returns {string} The formatted Markdown string for the cell.
   */
  private formatUncoveredCell(
    data: FileCoverageDetails | CoverageData['overall'],
    options: SummaryOptions,
    filePath?: string,
  ): string {
    if (
      !('uncoveredLines' in data) ||
      !filePath ||
      data.uncoveredLines.length === 0
    ) {
      return '';
    } else {
      const ranges = formatUncoveredLines(data.uncoveredLines, {
        maxLength: 15,
      }).split(',');
      const fileUrl = `${options.repoUrl}/blob/${options.sha}/${filePath}`;

      return ranges
        .map((range) => {
          const [start, end] = range.split('-');
          const link = end
            ? `${fileUrl}#L${start}-L${end}`
            : `${fileUrl}#L${start}`;
          return `[\`${range}\`](${link})`;
        })
        .join(', ');
    }
  }

  private buildProgressBar(percentage: number): string {
    const pct = Math.round(percentage);
    const color = pct < 50 ? 'red' : pct < 80 ? 'yellow' : 'green';

    // Round percentage to the nearest 5 and ensure it's a three-digit string (e.g., '000', '005', '095', '100')
    const padded = String(Math.round(pct / 5) * 5).padStart(3, '0');

    const url = `https://cdn.jsdelivr.net/gh/mridang/action-test-reporter@master/dist/res/progress-${color}-${padded}.svg`;
    return `![${pct}%](${url})`;
  }
}
