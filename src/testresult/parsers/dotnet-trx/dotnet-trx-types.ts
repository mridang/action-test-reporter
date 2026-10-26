export interface TrxReport {
  TestRun: TestRun;
}

interface TestRun {
  Times: Times[];
  Results?: Results[];
  TestDefinitions?: TestDefinitions[];
}

interface Times {
  $: {
    creation: string;
    queuing: string;
    start: string;
    finish: string;
  };
}

interface TestDefinitions {
  UnitTest: UnitTest[];
}

export interface UnitTest {
  $: {
    id: string;
  };
  TestMethod: TestMethod[];
}

interface TestMethod {
  $: {
    className: string;
    name: string;
  };
}

interface Results {
  UnitTestResult: UnitTestResult[];
}

export interface UnitTestResult {
  $: {
    testId: string;
    testName: string;
    duration?: string;
    outcome: Outcome;
  };
  Output: Output[];
}

interface Output {
  ErrorInfo: ErrorInfo[];
}
export interface ErrorInfo {
  Message: string[];
  StackTrace: string[];
}

export type Outcome = 'Passed' | 'NotExecuted' | 'Failed';
