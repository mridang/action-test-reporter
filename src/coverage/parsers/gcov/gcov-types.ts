export type GcovLine = {
  executionCount: number | null;
  lineNumber: number;
  sourceCode: string;
};

export type GcovFileSection = {
  filename: string;
  lines: GcovLine[];
  summary?: {
    linesExecuted: { covered: number; total: number };
    branchesExecuted?: { covered: number; total: number };
    functionsExecuted?: { covered: number; total: number };
  };
};
