/**
 * @file Declares the event types emitted by the Dart test runner JSON reporter.
 */

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

type EventType =
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

interface Event {
  type: EventType;
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

/**
 * Tells whether a Dart test event describes a suite.
 * @param event - The event to check.
 * @returns True when the event is a suite event.
 * @example
 * if (isSuiteEvent(event)) { suites.push(event); }
 */
export function isSuiteEvent(event: ReportEvent): event is SuiteEvent {
  return event.type === 'suite';
}

/**
 * Tells whether a Dart test event describes a group.
 * @param event - The event to check.
 * @returns True when the event is a group event.
 * @example
 * if (isGroupEvent(event)) { groups.push(event); }
 */
export function isGroupEvent(event: ReportEvent): event is GroupEvent {
  return event.type === 'group';
}

/**
 * Tells whether a Dart test event marks the start of a test.
 * @param event - The event to check.
 * @returns True when the event is a test start event.
 * @example
 * if (isTestStartEvent(event)) { starts.set(event.test.id, event); }
 */
export function isTestStartEvent(event: ReportEvent): event is TestStartEvent {
  return event.type === 'testStart';
}

/**
 * Tells whether a Dart test event marks the end of a test.
 * @param event - The event to check.
 * @returns True when the event is a test done event.
 * @example
 * if (isTestDoneEvent(event)) { results.push(event); }
 */
export function isTestDoneEvent(event: ReportEvent): event is TestDoneEvent {
  return event.type === 'testDone';
}

/**
 * Tells whether a Dart test event carries an error raised by a test.
 * @param event - The event to check.
 * @returns True when the event is an error event.
 * @example
 * if (isErrorEvent(event)) { errors.push(event.error); }
 */
export function isErrorEvent(event: ReportEvent): event is ErrorEvent {
  return event.type === 'error';
}

/**
 * Tells whether a Dart test event marks the end of the whole run.
 * @param event - The event to check.
 * @returns True when the event is the done event.
 * @example
 * if (isDoneEvent(event)) { finished = true; }
 */
export function isDoneEvent(event: ReportEvent): event is DoneEvent {
  return event.type === 'done';
}

/**
 * Tells whether a Dart test event is a message printed by the test runner.
 * @param event - The event to check.
 * @returns True when the event is a print event.
 * @example
 * if (isMessageEvent(event)) { messages.push(event.message); }
 */
export function isMessageEvent(event: ReportEvent): event is MessageEvent {
  return event.type === 'print';
}
