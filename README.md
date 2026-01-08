# Test Reporter GitHub Action

A GitHub Action that parses test results and coverage files from popular tools and publishes a rich summary to the GitHub Actions log.

## Features

- Test results: Auto-detects `dart-json`, `dotnet-nunit`, `dotnet-trx`, `flutter-json`, `golang-json`, `java-junit`, `jest-junit`, `mocha-json`, `python-xunit`, `rspec-json`, and `swift-xunit`.
- Coverage: Auto-detects `clover`, `cobertura`, `gcov`, `jacoco`, and `lcov`.
- Writes directly to the Actions summary (no tokens required) with badges and tables.
- Handles large suites with an optional summary-only mode.
- Traces failures back to repository files when stack traces match tracked paths.

## Why?

- **Immediate Feedback**: See your code coverage directly in the GitHub Actions summary for every push or pull request, without needing to navigate to an external service.
- **Improved Developer Experience**: The clear, hierarchical report with direct links to uncovered lines helps developers quickly identify and address gaps in test coverage.
- **Simplified CI/CD**: Avoids the complexity and potential security concerns of sending coverage data to third-party sites, making it a great solution for both open-source and private repositories.
- **Self-Contained**: The action is entirely self-contained and does not require any external services to function, keeping your CI/CD pipeline simple and secure.

## Usage

Provide `results-path` for tests, `coverage-path` for coverage, or both to combine them in one summary. The action fails if neither input is set.

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --coverage --testLocationInResults
      - name: Publish test and coverage report
        uses: mridang/action-test-reporter@v1
        with:
          name: Unit tests
          results-path: ./.out/junit.xml
          coverage-path: coverage/lcov.info
```

### Inputs

- `name` (optional, default `tests`): Label for the report section.
- `results-path` (optional): Comma-separated glob of result files (all must share the same format). The format is auto-detected. Provide when you want to publish test results.
- `list-suites` / `list-tests` (optional, default `all`): `all`, `failed`, or `none`.
- `max-annotations` (optional, default `10`): Parsing limit for error locations (max `50`).
- `fail-on-error` (optional, default `true`): Fail the workflow step when any test failed.
- `fail-on-empty` (optional, default `true`): Fail the workflow step when no test or coverage results were found.
- `working-directory` (optional, default `.`): Base directory for globs.
- `report-title` (optional): Title added above the badge.
- `only-summary` (optional, default `false`): Skip suite/test details and render only the top-level table.
- `badge-title` (optional, default `tests`): Custom text for the summary badge.
- `collapsed` (optional, default `auto`): `auto`, `always`, or `never` to control whether details are collapsed.
- `coverage-path` (optional): Comma-separated glob of coverage reports.

### Outputs

Outputs are populated when test results are processed.

- `conclusion`: `success` or `failure` derived from the parsed results.
- `passed`, `failed`, `skipped`: Aggregate test counts.
- `time`: Total runtime of all parsed reports (ms).

## Known Issues

- **Monorepos**: Support for monorepos can be limited, especially when trying to generate a single report for multiple sub-projects. The `working-directory` input can help, but a more comprehensive solution is planned.
- **Multiple Reports**: The action currently only accepts a single path in the `coverage-path` input. It does not support merging multiple coverage reports from different test suites or formats into one summary.
- **File Discovery**: The action does not support heuristics to figure out which file is the coverage file. For now, you must specify it explicitly using the `coverage-path` input.

## Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions): The official documentation for GitHub Actions.
- [Code Coverage](https://en.wikipedia.org/wiki/Code_coverage): An explanation of the principles behind code coverage.

## Contributing

If you have suggestions for how this app could be improved, or
want to report a bug, open an issue—we'd love all and any
contributions.

## License

Apache License 2.0 © 2025 Mridang Agarwalla
