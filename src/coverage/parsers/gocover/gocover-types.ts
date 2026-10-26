/**
 * Represents a single coverage block from Go coverage output.
 * Format: file:startLine.startCol,endLine.endCol numStatements count
 */
export type GocoverBlock = {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  numStatements: number;
  count: number;
};

/**
 * Represents coverage data for a single file in Go coverage output.
 */
export type GocoverFileData = {
  filename: string;
  blocks: GocoverBlock[];
};
