export interface JunitReport {
  testsuites: TestSuites;
}

export interface SingleSuiteReport {
  testsuite: TestSuite;
}

interface TestSuites {
  $: {
    time: string;
    name?: string;
  };
  testsuite?: TestSuite[];
}

export interface TestSuite {
  $: {
    name: string;
    tests: string;
    errors: string;
    failures: string;
    skipped: string;
    time: string;
    timestamp?: Date;
  };
  testcase?: TestCase[];
  testsuite?: TestSuite[];
}

export interface TestCase {
  $: {
    classname: string;
    file?: string;
    name: string;
    time: string;
  };
  failure?: string | Failure[];
  error?: string | Failure[];
  skipped?: string[];
}

interface Failure {
  _: string;
  $: {
    type?: string;
    message: string;
  };
}
