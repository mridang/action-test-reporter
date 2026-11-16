/**
 * @file Defines the in-memory model of test runs, suites, groups and cases.
 */

import { DEFAULT_LOCALE } from './utils/node-utilities.js';

const collator = new Intl.Collator(DEFAULT_LOCALE);

export class TestRunResult {
  constructor(
    readonly path: string,
    readonly suites: TestSuiteResult[],
    private readonly totalTime?: number,
  ) {}

  get tests(): number {
    return this.suites.reduce((sum, g) => sum + g.tests, 0);
  }

  get passed(): number {
    return this.suites.reduce((sum, g) => sum + g.passed, 0);
  }
  get failed(): number {
    return this.suites.reduce((sum, g) => sum + g.failed, 0);
  }
  get skipped(): number {
    return this.suites.reduce((sum, g) => sum + g.skipped, 0);
  }

  get time(): number {
    return this.totalTime ?? this.suites.reduce((sum, g) => sum + g.time, 0);
  }

  get result(): TestExecutionResult {
    return this.suites.some((t) => t.result === 'failed')
      ? 'failed'
      : 'success';
  }

  sort(deep: boolean): void {
    this.suites.sort((a, b) => collator.compare(a.name, b.name));
    if (deep) {
      for (const suite of this.suites) {
        suite.sort(deep);
      }
    }
  }
}

export class TestSuiteResult {
  constructor(
    readonly name: string,
    readonly groups: TestGroupResult[],
    private readonly totalTime?: number,
  ) {}

  get tests(): number {
    return this.groups.reduce((sum, g) => sum + g.tests.length, 0);
  }

  get passed(): number {
    return this.groups.reduce((sum, g) => sum + g.passed, 0);
  }
  get failed(): number {
    return this.groups.reduce((sum, g) => sum + g.failed, 0);
  }
  get skipped(): number {
    return this.groups.reduce((sum, g) => sum + g.skipped, 0);
  }
  get time(): number {
    return this.totalTime ?? this.groups.reduce((sum, g) => sum + g.time, 0);
  }

  get result(): TestExecutionResult {
    return this.groups.some((t) => t.result === 'failed')
      ? 'failed'
      : 'success';
  }

  sort(deep: boolean): void {
    this.groups.sort((a, b) => collator.compare(a.name ?? '', b.name ?? ''));
    if (deep) {
      for (const grp of this.groups) {
        grp.sort();
      }
    }
  }
}

export class TestGroupResult {
  constructor(
    readonly name: string | undefined | null,
    readonly tests: TestCaseResult[],
  ) {}

  get passed(): number {
    return this.tests.reduce(
      (sum, t) => (t.result === 'success' ? sum + 1 : sum),
      0,
    );
  }
  get failed(): number {
    return this.tests.reduce(
      (sum, t) => (t.result === 'failed' ? sum + 1 : sum),
      0,
    );
  }
  get skipped(): number {
    return this.tests.reduce(
      (sum, t) => (t.result === 'skipped' ? sum + 1 : sum),
      0,
    );
  }
  get time(): number {
    return this.tests.reduce((sum, t) => sum + t.time, 0);
  }

  get result(): TestExecutionResult {
    return this.tests.some((t) => t.result === 'failed') ? 'failed' : 'success';
  }

  sort(): void {
    this.tests.sort((a, b) => collator.compare(a.name, b.name));
  }
}

export class TestCaseResult {
  constructor(
    readonly name: string,
    readonly result: TestExecutionResult,
    readonly time: number,
    readonly error?: TestCaseError,
  ) {}
}

export type TestExecutionResult = 'success' | 'skipped' | 'failed' | undefined;

export interface TestCaseError {
  path?: string;
  line?: number;
  message?: string;
  details: string;
}
