export interface CoverageFile {
  file: string;
  content: string;
}

export interface CoverageInputProvider {
  load(): Promise<CoverageFile[]>;
}
