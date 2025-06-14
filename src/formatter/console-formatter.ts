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
 * ANSI color codes for console output.
 */
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

/**
 * @internal
 * Represents a node in the file coverage tree. It can be a directory
 * or a file. Using a Map for children avoids TypeScript index signature issues.
 */
type CoverageNode = {
  children: Map<string, CoverageNode>;
  _coverage?: FileCoverageDetails | CoverageData['overall'];
  _isFile: boolean;
};

/**
 * A formatter that generates a console summary similar to Jest's output,
 * including a hierarchical file tree view with relative paths.
 * @export
 * @class ConsoleFormatter
 * @implements {CoverageFormatter}
 */
export class ConsoleFormatter
  implements CoverageFormatter<{ rootDir?: string }>
{
  /**
   * {@inheritDoc CoverageFormatter.format}
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
   * @private
   * @param {FileCoverageDetails[]} details - A flat list of file coverage data.
   * @param {string} [rootDir] - The project's root directory.
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
   * Recursively renders the coverage tree into an array of formatted table rows.
   * @private
   * @param {CoverageNode} node - The current node of the tree to render.
   * @param {number} fileWidth - The calculated max width for the file column.
   * @param {number} [indent=0] - The current indentation level.
   * @returns {string[]} An array of formatted strings for each table row.
   */
  private renderTree(
    node: CoverageNode,
    fileWidth: number,
    indent: number = 0,
  ): string[] {
    const rows: string[] = [];
    const sortedKeys = [...node.children.keys()].sort();

    for (const key of sortedKeys) {
      const child = node.children.get(key)!;
      if (child._isFile) {
        rows.push(this.buildRow(key, child._coverage!, fileWidth, indent));
      } else {
        const dirName = `${key}${path.sep}`;
        rows.push(this.buildRow(dirName, child._coverage!, fileWidth, indent));
        rows.push(...this.renderTree(child, fileWidth, indent + 2));
      }
    }
    return rows;
  }

  /**
   * Builds a single formatted and colorized table row.
   * @private
   * @param {string} name - The name of the file or directory.
   * @param {FileCoverageDetails | CoverageData['overall']} data - Coverage data for the row.
   * @param {number} fileWidth - The max width of the file column.
   * @param {number} [indent=0] - The indentation level for the name.
   * @returns {string} The fully formatted and colorized table row string.
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
      const color = p < 50 ? colors.red : p < 80 ? colors.yellow : colors.green;
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
   * @private
   * @param {number} fileWidth - The max width for the file column.
   * @returns {{ separator: string; header: string }} The header components.
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
   * @private
   * @param {CoverageNode} node - The current node to process.
   * @param {number} [indent=0] - The current indentation level.
   * @param {number} [currentMax=0] - The maximum length found so far.
   * @returns {number} The maximum required width for the file column.
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
