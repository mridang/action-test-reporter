# Test Reporter GitHub Action

A GitHub Action that parses test results and coverage files from popular tools and publishes a rich summary to the GitHub Actions log.

## Features

- Test results: Auto-detects `dart-json`, `dotnet-nunit`, `dotnet-trx`, `flutter-json`, `golang-json`, `java-junit`, `jest-junit`, `mocha-json`, `python-xunit`, `rspec-json`, and `swift-xunit`.
- Coverage: Auto-detects `clover`, `cobertura`, `gcov`, `jacoco`, and `lcov`.
- Writes directly to the Actions summary (no tokens required) with badges and tables.
- Handles large suites with an optional summary-only mode.
- Traces failures back to repository files when stack traces match tracked paths.

## Usage

Provide `results-path` for tests, `coverage-path` for coverage, or both to combine them in one summary. The action fails if neither input is set.

### Test results

```yaml
- name: Publish test report
  uses: mridang/action-test-reporter@v1
  with:
    name: Unit tests
    results-path: reports/junit.xml
    list-suites: failed
    list-tests: failed
```

### Inputs

- `name` (required): Label for the report section.
- `results-path`: Comma-separated glob of result files (all must share the same format). The format is auto-detected. Provide when you want to publish test results.
- `list-suites` / `list-tests`: `all`, `failed`, or `none` (default `all`).
- `max-annotations`: Parsing limit for error locations (default `10`, max `50`).
- `fail-on-error`: Fail the workflow step when any test failed (default `true`).
- `fail-on-empty`: Fail the workflow step when no results were found (default `true`).
- `working-directory`: Base directory for globs (default `.`).
- `report-title`: Optional title added above the badge.
- `only-summary`: Skip suite/test details and render only the top-level table (default `false`).
- `badge-title`: Custom text for the summary badge (default `tests`).
- `collapsed`: `auto`, `always`, or `never` to control whether details are collapsed (default `auto`).

### Coverage

```yaml
- name: Publish coverage report
  uses: mridang/action-test-reporter@v1
  with:
    coverage-path: coverage/lcov.info
```

- `coverage-path`: Comma-separated glob of coverage reports.
- `working-directory`: Base directory for globs (default `.`).
- `fail-on-empty`: Fail the workflow step when no coverage files were found (default `true`).

### Outputs

Outputs are populated when test results are processed.

- `conclusion`: `success` or `failure` derived from the parsed results.
- `passed`, `failed`, `skipped`: Aggregate test counts.
- `time`: Total runtime of all parsed reports (ms).

## Development

Install dependencies with `npm install`, run tests with `npm test`, and lint with `npm run lint`. Source lives in `src/testresult` (test parsers/formatters) and `src/coverage` (coverage parsers/formatters). Tests use fixtures in `test/testresult/__fixtures__`, `test/coverage/__fixtures__`, and shared combined samples in `test/__fixtures__/main`. Build artifacts are emitted to `dist/`.
