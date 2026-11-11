/**
 * @file Formats coverage results as a coloured, tree-shaped table for the console.
 */

import path from 'node:path';
import { CoverageFormatter } from './coverage-formatter.js';
import {
  CoverageData,
  FileCoverageDetails,
  CoverageMetrics,
} from '../parsers/coverage-parser.js';
import { formatUncoveredLines } from './index.js';

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
    const tree = this.buildTree(coverageData.details, rootDir);
    this.calculateAggregates(tree);

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
      // eslint-disable-next-line unicorn/prefer-at -- .at() would widen the element type to include undefined
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
   * @param node - The current node in the tree to process.
   * @returns A flat list of all descendant file coverages.
   * @private
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
    indent: number = 0,
  ): string[] {
    const rows: string[] = [];
    const sortedKeys = [...node.children.keys()].toSorted((a, b) =>
      a.localeCompare(b),
    );

    for (const key of sortedKeys) {
      const child = node.children.get(key)!;
      if (child._isFile) {
        rows.push(this.buildRow(key, child._coverage!, fileWidth, indent));
      } else {
        const dirName = `${key}${path.sep}`;
        rows.push(
          this.buildRow(dirName, child._coverage!, fileWidth, indent),
          ...this.renderTree(child, fileWidth, indent + 2),
        );
      }
    }
    return rows;
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
    indent: number = 0,
  ): string {
    const { statements, branches, methods, lines } = data;
    const getPct = (m: CoverageMetrics) =>
      m.total === 0 ? 100 : (m.covered / m.total) * 100;
    const colorize = (p: number, t: string) => {
      let color = colors.green;
      if (p < 80) {
        color = colors.yellow;
      }
      if (p < 50) {
        color = colors.red;
      }
      return `${color}${t}${colors.reset}`;
    };
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
      colorize(pcts.stmts, pcts.stmts.toFixed(2).padStart(8)),
      colorize(pcts.branch, pcts.branch.toFixed(2).padStart(9)),
      colorize(pcts.funcs, pcts.funcs.toFixed(2).padStart(8)),
      colorize(pcts.lines, pcts.lines.toFixed(2).padStart(8)),
      ` ${colors.red}${uncovered}${colors.reset}`,
    ].join(' |');
  }

  /**
   * Builds the header and separator lines for the table.
   * @param fileWidth - The max width for the file column.
   * @returns The header components.
   * @private
   */
  private buildHeader(fileWidth: number): {
    separator: string;
    header: string;
  } {
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
    indent: number = 0,
    currentMax: number = 0,
  ): number {
    let max = currentMax;
    for (const [key, child] of node.children.entries()) {
      const currentLength = indent + key.length + (child._isFile ? 0 : 1);
      if (currentLength > max) {
        max = currentLength;
      }
      if (!child._isFile) {
        max = this.calculateFileColumnWidth(child, indent + 2, max);
      }
    }
    return max;
  }
}
