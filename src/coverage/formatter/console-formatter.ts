/**
 * @file Formats coverage results as a coloured, tree-shaped table for the console.
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
 * ANSI color codes for console output.
 * @internal
 */
const colors = {
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  reset: '\u001B[0m',
};

/**
 * Represents a node in the file coverage tree. It can be a directory
 * or a file. Using a Map for children avoids TypeScript index signature issues.
 * @internal
 */
type CoverageNode = {
  children: Map<string, CoverageNode>;
  _coverage?: FileCoverageDetails | CoverageData['overall'];
  _isFile: boolean;
};

/**
 * A formatter that generates a console summary similar to Jest's output,
 * including a hierarchical file tree view with relative paths.
 * @class ConsoleFormatter
 * @implements {CoverageFormatter}
 */
export class ConsoleFormatter implements CoverageFormatter<{
  rootDir?: string;
}> {
  /**
   * Formats the coverage data as a hierarchical console table.
   * @param coverageData - The coverage data to format.
   * @param options - The options for the formatter.
   * @param options.rootDir - The root directory used to make file paths relative.
   * @returns The console table as a single string.
   * @example
   * const table = new ConsoleFormatter().format(coverageData, { rootDir: process.cwd() });
   */
  public format(
    coverageData: CoverageData,
    options: { rootDir?: string } = {},
  ): string {
    const { rootDir } = options;
    const tree = this.calculateAggregates(
      this.buildTree(coverageData.details, rootDir),
    );

    const fileColWidth = this.calculateFileColumnWidth(tree);
    const { separator, header } = this.buildHeader(fileColWidth);
    const body = this.renderTree(tree, fileColWidth);
    const summary = this.buildRow(
      'All files',
      coverageData.overall,
      fileColWidth,
    );

    return [
      separator,
      header,
      separator,
      ...body,
      separator,
      summary,
      separator,
    ].join('\n');
  }

  /**
   * Builds the file and directory tree from a flat list of file details,
   * making paths relative to the provided root directory.
   * @param details - A flat list of file coverage data.
   * @param [rootDir] - The project's root directory.
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
   * Recursively renders the coverage tree into an array of formatted table rows.
   * @param node - The current node of the tree to render.
   * @param fileWidth - The calculated max width for the file column.
   * @param [indent] - The current indentation level.
   * @returns An array of formatted strings for each table row.
   * @private
   */
  private renderTree(
    node: CoverageNode,
    fileWidth: number,
    indent = 0,
  ): string[] {
    const sortedKeys = [...node.children.keys()].toSorted((a, b) =>
      collator.compare(a, b),
    );

    return sortedKeys.flatMap((key) => {
      const child = node.children.get(key)!;
      return child._isFile
        ? [this.buildRow(key, child._coverage!, fileWidth, indent)]
        : [
            this.buildRow(
              `${key}${path.sep}`,
              child._coverage!,
              fileWidth,
              indent,
            ),
            ...this.renderTree(child, fileWidth, indent + 2),
          ];
    });
  }

  /**
   * Builds a single formatted and colorized table row.
   * @param name - The name of the file or directory.
   * @param data - Coverage data for the row.
   * @param fileWidth - The max width of the file column.
   * @param [indent] - The indentation level for the name.
   * @returns The fully formatted and colorized table row string.
   * @private
   */
  private buildRow(
    name: string,
    data: FileCoverageDetails | CoverageData['overall'],
    fileWidth: number,
    indent = 0,
  ): string {
    const { statements, branches, methods, lines } = data;
    const getPct = (m: CoverageMetrics) =>
      m.total === 0 ? 100 : (m.covered / m.total) * 100;
    const colorFor = (p: number) => {
      if (p < 50) {
        return colors.red;
      }
      return p < 80 ? colors.yellow : colors.green;
    };
    const colorize = (p: number, t: string) =>
      `${colorFor(p)}${t}${colors.reset}`;
    const pcts = {
      stmts: getPct(statements),
      branch: getPct(branches),
      funcs: getPct(methods),
      lines: getPct(lines),
    };
    const nameIndented = ' '.repeat(indent) + name;
    const nameColor = colorize(pcts.lines, nameIndented);
    const uncovered =
      'uncoveredLines' in data
        ? formatUncoveredLines(data.uncoveredLines, { maxLength: 30 })
        : '';

    return [
      nameColor.padEnd(fileWidth + (nameColor.length - nameIndented.length)),
      colorize(pcts.stmts, PERCENT.format(pcts.stmts).padStart(8)),
      colorize(pcts.branch, PERCENT.format(pcts.branch).padStart(9)),
      colorize(pcts.funcs, PERCENT.format(pcts.funcs).padStart(8)),
      colorize(pcts.lines, PERCENT.format(pcts.lines).padStart(8)),
      ` ${colors.red}${uncovered}${colors.reset}`,
    ].join(' |');
  }

  /**
   * Builds the header and separator lines for the table.
   * @param fileWidth - The max width for the file column.
   * @returns The header components.
   * @private
   */
  private buildHeader(fileWidth: number) {
    const headers = [
      'File'.padEnd(fileWidth),
      '% Stmts'.padStart(8),
      '% Branch'.padStart(9),
      '% Funcs'.padStart(8),
      '% Lines'.padStart(8),
      ' Uncovered Line #s',
    ];
    const joined = headers.join(' |');
    return { separator: '-'.repeat(joined.length), header: joined };
  }

  /**
   * Calculates the required width for the file column.
   * @param node - The current node to process.
   * @param [indent] - The current indentation level.
   * @param [currentMax] - The maximum length found so far.
   * @returns The maximum required width for the file column.
   * @private
   */
  private calculateFileColumnWidth(
    node: CoverageNode,
    indent = 0,
    currentMax = 0,
  ): number {
    return [...node.children.entries()].reduce((max, [key, child]) => {
      const widest = Math.max(
        max,
        indent + key.length + (child._isFile ? 0 : 1),
      );
      return child._isFile
        ? widest
        : this.calculateFileColumnWidth(child, indent + 2, widest);
    }, currentMax);
  }
}
