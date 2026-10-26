export type LcovFileBuilder = {
  file: string;
  functions: { total: number; covered: number };
  branches: { total: number; covered: number };
  lines: { total: number; covered: number; details: Map<number, number> };
};
