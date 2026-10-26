/**
 * Reflects documentation at https://github.com/dart-lang/test/blob/master/pkgs/test/doc/json_reporter.md.
 */

export type ReportEvent =
  | StartEvent
  | AllSuitesEvent
  | SuiteEvent
  | DebugEvent
  | GroupEvent
  | TestStartEvent
  | TestDoneEvent
  | DoneEvent
  | MessageEvent
  | ErrorEvent;

interface Event {
  type:
    | 'start'
    | 'allSuites'
    | 'suite'
    | 'debug'
    | 'group'
    | 'testStart'
    | 'print'
    | 'error'
    | 'testDone'
    | 'done';
  time: number;
}

interface StartEvent extends Event {
  type: 'start';
  protocolVersion: string;
  runnerVersion: string;
  pid: number;
}

interface AllSuitesEvent extends Event {
  type: 'allSuites';
  count: number;
}

interface SuiteEvent extends Event {
  type: 'suite';
  suite: Suite;
}

interface GroupEvent extends Event {
  type: 'group';
  group: Group;
}

export interface TestStartEvent extends Event {
  type: 'testStart';
  test: Test;
}

export interface TestDoneEvent extends Event {
  type: 'testDone';
  testID: number;
  result: 'success' | 'failure' | 'error';
  hidden: boolean;
  skipped: boolean;
}

interface DoneEvent extends Event {
  type: 'done';
  success: boolean;
}

export interface ErrorEvent extends Event {
  type: 'error';
  testID: number;
  error: string;
  stackTrace: string;
  isFailure: boolean;
}

interface DebugEvent extends Event {
  type: 'debug';
  suiteID: number;
  observatory: string;
  remoteDebugger: string;
}

export interface MessageEvent extends Event {
  type: 'print';
  testID: number;
  messageType: 'print' | 'skip';
  message: string;
}

export interface Suite {
  id: number;
  platform?: string;
  path: string;
}

export interface Group {
  id: number;
  name?: string;
  suiteID: number;
  parentID?: number;
  testCount: number;
  line: number | null;
  column: number | null;
  url: string | null;
}

interface Test {
  id: number;
  name: string;
  suiteID: number;
  groupIDs: number[];
  line: number | null;
  column: number | null;
  url: string | null;
  root_line?: number;
  root_column?: number;
  root_url: string | undefined;
}

export function isSuiteEvent(event: ReportEvent): event is SuiteEvent {
  return event.type === 'suite';
}
export function isGroupEvent(event: ReportEvent): event is GroupEvent {
  return event.type === 'group';
}
export function isTestStartEvent(event: ReportEvent): event is TestStartEvent {
  return event.type === 'testStart';
}
export function isTestDoneEvent(event: ReportEvent): event is TestDoneEvent {
  return event.type === 'testDone';
}
export function isErrorEvent(event: ReportEvent): event is ErrorEvent {
  return event.type === 'error';
}
export function isDoneEvent(event: ReportEvent): event is DoneEvent {
  return event.type === 'done';
}
export function isMessageEvent(event: ReportEvent): event is MessageEvent {
  return event.type === 'print';
}
