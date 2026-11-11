/**
 * @file Provides the global teardown hook for the test suite.
 */

/**
 * Runs once after the test suite finishes, and is a no-op because no external services need stopping.
 * @example
 * await teardown();
 */
export default async function teardown(): Promise<void> {
  // No external services to tear down.
}
