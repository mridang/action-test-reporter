/**
 * @file Formats coverage results as a Markdown summary for the GitHub Actions job summary.
 */

import path from 'node:path';
import { formatUncoveredLines } from './index.js';
import type { CoverageFormatter } from './coverage-formatter.js';
import type {
  CoverageData,
  FileCoverageDetails,
  CoverageMetrics,
} from '../parsers/coverage-parser.js';

const collator = new Intl.Collator();

/** Formats a coverage percentage with two decimals and no digit grouping. */
const PERCENT = new Intl.NumberFormat('en', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

/**
 * Represents a node in the file coverage tree. It can be a directory
 * or a file.
 * @internal
 */
type CoverageNode = {
  children: Map<string, CoverageNode>;
  _coverage?: FileCoverageDetails | CoverageData['overall'];
  _isFile: boolean;
};

/**
 * Options required for building the GitHub summary.
 * @internal
 */
interface SummaryOptions {
  repoUrl: string;
  sha: string;
  rootDir?: string;
}

/**
 * A formatter that generates a rich Markdown summary for GitHub Actions.
 * @class SummaryFormatter
 * @implements {CoverageFormatter}
 */
export class SummaryFormatter implements CoverageFormatter<SummaryOptions> {
  /**
   * Formats the coverage data as a Markdown summary table.
   * @param coverageData - The coverage data to format.
   * @param options - The options, such as the repository and commit used for links.
   * @returns The Markdown summary as a single string.
   * @example
   * const markdown = new SummaryFormatter().format(coverageData, { rootDir: process.cwd() });
   */
  public format(coverageData: CoverageData, options: SummaryOptions): string {
    const tree = this.calculateAggregates(
      this.buildTree(coverageData.details, options.rootDir),
    );

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
   * @param details - A flat list of file coverage data.
   * @param [rootDir] - The project's root directory for making paths relative.
   * @returns The root node of the constructed file tree.
   * @private
   */
  private buildTree(
    details: FileCoverageDetails[],
    rootDir?: string,
  ): CoverageNode {
    return details.reduce<CoverageNode>(
      (root, detail) =>
        this.insertFile(
          root,
          (rootDir ? path.relative(rootDir, detail.file) : detail.file).split(
            path.sep,
          ),
          detail,
        ),
      { children: new Map<string, CoverageNode>(), _isFile: false },
    );
  }

  /**
   * Returns a copy of the tree with the file added below the directories named by its path parts.
   * @param node - The directory node to add the file to.
   * @param pathParts - The remaining path segments, ending with the file name.
   * @param detail - The coverage data of the file.
   * @returns The updated copy of the node.
   * @private
   */
  private insertFile(
    node: CoverageNode,
    [part, ...rest]: string[],
    detail: FileCoverageDetails,
  ): CoverageNode {
    const child: CoverageNode =
      rest.length === 0
        ? {
            children: new Map<string, CoverageNode>(),
            _coverage: detail,
            _isFile: true,
          }
        : this.insertFile(
            node.children.get(part) ?? {
              children: new Map<string, CoverageNode>(),
              _isFile: false,
            },
            rest,
            detail,
          );
    return { ...node, children: new Map([...node.children, [part, child]]) };
  }

  /**
   * Recursively calculates aggregate coverage for all directories in the tree.
   * @param node - The current node in the tree to process.
   * @returns A copy of the node whose directories carry their aggregate coverage.
   * @private
   */
  private calculateAggregates(node: CoverageNode): CoverageNode {
    const children = new Map<string, CoverageNode>(
      Array.from(node.children, ([key, child]) => [
        key,
        child._isFile ? child : this.calculateAggregates(child),
      ]),
    );
    const coverages = Array.from(children.values()).flatMap((child) =>
      child._coverage ? [child._coverage] : [],
    );
    const sum = (
      pick: (detail: CoverageData['overall']) => CoverageMetrics,
    ): CoverageMetrics => ({
      covered: coverages.reduce((total, d) => total + pick(d).covered, 0),
      total: coverages.reduce((total, d) => total + pick(d).total, 0),
    });

    return {
      ...node,
      children,
      _coverage: {
        statements: sum((d) => d.statements),
        branches: sum((d) => d.branches),
        methods: sum((d) => d.methods),
        lines: sum((d) => d.lines),
      },
    };
  }

  /**
   * Recursively renders the coverage tree into an array of Markdown table rows.
   * @param node - The current node of the tree to render.
   * @param options - The options containing repo and commit info.
   * @param [indent] - The current indentation level.
   * @param [prefix] - The current path prefix.
   * @returns An array of formatted Markdown table rows.
   * @private
   */
  private renderTree(
    node: CoverageNode,
    options: SummaryOptions,
    indent = 0,
    prefix = '',
  ): string[] {
    const sortedKeys = [...node.children.keys()].toSorted((a, b) =>
      collator.compare(a, b),
    );

    return sortedKeys.flatMap((key) => {
      const child = node.children.get(key)!;
      const currentPath = path.join(prefix, key);

      return child._isFile
        ? [
            this.buildRow(
              key,
              child._coverage!,
              options,
              indent,
              false,
              currentPath,
            ),
          ]
        : [
            this.buildRow(`**${key}/**`, child._coverage!, options, indent),
            ...this.renderTree(child, options, indent + 2, currentPath),
          ];
    });
  }

  /**
   * Builds a single formatted Markdown table row.
   * @returns The fully formatted Markdown table row string.
   * @private
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
    const indentString = ' '.repeat(indent) + (indent > 0 ? '•  ' : '');
    const fileName = isSummary ? `**${name}**` : name;
    const canLink = Boolean(options.repoUrl && options.sha && filePath);

    const fileLink =
      canLink && filePath
        ? `[${fileName}](${options.repoUrl}/blob/${options.sha}/${filePath})`
        : fileName;

    const cols = [
      `${indentString}${fileLink}`,
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
   * @param metric - The metric data to format.
   * @returns The formatted Markdown string for the cell.
   * @private
   */
  private formatMetric(metric: CoverageMetrics): string {
    const pct =
      metric.total === 0 ? 100 : (metric.covered / metric.total) * 100;
    const progressBar = this.buildProgressBar(pct);
    return `${progressBar} ${PERCENT.format(pct)}%`;
  }

  /**
   * Creates the Markdown for the "Uncovered Lines" cell, including links.
   * @returns The formatted Markdown string for the cell.
   * @private
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
    }
    const ranges = formatUncoveredLines(data.uncoveredLines, {
      maxLength: 15,
    }).split(',');
    const canLink = Boolean(options.repoUrl && options.sha);
    const fileUrl = canLink
      ? `${options.repoUrl}/blob/${options.sha}/${filePath}`
      : '';

    return ranges
      .map((range) => {
        const [start, end] = range.split('-');
        if (!fileUrl) {
          return `\`${range}\``;
        }
        const link = end
          ? `${fileUrl}#L${start}-L${end}`
          : `${fileUrl}#L${start}`;
        return `[\`${range}\`](${link})`;
      })
      .join(', ');
  }

  private buildProgressBar(percentage: number): string {
    const pct = Math.round(percentage);
    const baseColor = pct < 80 ? 'yellow' : 'green';
    const color = pct < 50 ? 'red' : baseColor;

    const padded = String(Math.round(pct / 5) * 5).padStart(3, '0');

    const url = `https://raw.githubusercontent.com/mridang/scratch/refs/heads/master/dist/res/progress-${color}-${padded}.svg`;
    return `![${pct}%](${url})`;
  }
}
