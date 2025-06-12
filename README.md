# Test Reporter GitHub Action

A GitHub Action that parses various code coverage report formats and generates a beautiful, insightful summary directly in your workflow. This action makes it easy to visualize your test coverage without leaving GitHub.

## Features

- **Multi-Format Support**: Natively parses the most popular coverage report formats: Clover (clover.xml), Cobertura (cobertura.xml), JaCoCo (jacoco.xml), and LCOV (lcov.info). Please note that many other formats (such as those from gcov or other language-specific tools) are not currently supported.
- **Automatic Detection**: Intelligently determines the report format from the file content, so no configuration is needed.
- **Interactive Summaries**: Generates a clean, hierarchical Markdown summary with progress bars for quick visual feedback.
- **Deep Linking**: Creates links to each file and even to the specific uncovered lines within that file for the exact commit, making it easy to see where coverage is lacking.
- **Zero-Dependency Reporting**: Provides immediate coverage insights without requiring third-party services or tools.

## Why?

- **Immediate Feedback**: See your code coverage directly in the GitHub Actions summary for every push or pull request, without needing to navigate to an external service.
- **Improved Developer Experience**: The clear, hierarchical report with direct links to uncovered lines helps developers quickly identify and address gaps in test coverage.
- **Simplified CI/CD**: Avoids the complexity and potential security concerns of sending coverage data to third-party sites, making it a great solution for both open-source and private repositories.
- **Self-Contained**: The action is entirely self-contained and does not require any external services to function, keeping your CI/CD pipeline simple and secure.

## Usage

To use this action, add it to your workflow file after your testing and coverage generation steps (e.g., in `.github/workflows/ci.yml`).

```yaml
name: Test

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Your build, install, and test steps go here
      # For example:
      - name: Run tests and generate coverage
        run: npm test -- --coverage

      - name: Code Coverage Report
        uses: mridang/action-test-reporter@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          coverage-file: ./coverage/clover.xml # Path to your clover, cobertura, jacoco, or lcov file
          working-directory: ./
```

This workflow is now configured to trigger a release on any commit to `main` (or `next` or any tag), and then wait for all other checks on that specific push event to succeed before initiating the `semantic-release` process. This ensures that your release pipeline only proceeds when all other CI/CD checks (e.g., tests, linters, build steps) have passed successfully. This behavior can be disabled by setting the `wait-for-checks` input to `false`.

### Configuring Code Coverage

To use this action, your test suite must be configured to generate a supported coverage report. Here are links to documentation for common languages and testing frameworks:

- **[Jest](https://jestjs.io/docs/configuration#collectcoverage-boolean)**: Enable the `collectCoverage` flag in your `jest.config.js` and use `coverageReporters` to specify clover or lcov.
- **[nyc (Istanbul)](https://github.com/istanbuljs/nyc#readme)**: A popular tool that can wrap your test command (e.g., `nyc mocha`) and generate reports in various formats.
- **[PHPUnit](https://docs.phpunit.de/en/10.5/code-coverage.html)**: Use the `--coverage-clover <file>` command-line option to generate a Clover XML report.
- **[SimpleCov](https://github.com/simplecov-ruby/simplecov#readme)**: The standard for Ruby projects. It can be configured to produce reports in formats compatible with this action.
- **[JaCoCo](https://www.jacoco.org/jacoco/trunk/doc/maven.html)**: The official documentation shows how to configure the JaCoCo plugin for both Maven and Gradle to generate the required `jacoco.xml` report.
- **[Go Test](https://golang.org/doc/tutorial/add-a-test)**: Use the built-in `go test -cover` command to generate a coverage profile, which can then be converted to a supported format using other tools.
- **[coverage.py](https://coverage.readthedocs.io/en/latest/)**: The standard Python coverage tool. Use it with pytest or unittest and then generate a Cobertura-compatible XML report with `coverage xml`.
- **[cargo-tarpaulin](https://github.com/xd009642/tarpaulin#readme)**: A popular tool for Rust that can generate reports in various formats, including Cobertura and LCOV.
- **[Coverlet](https://github.com/coverlet-coverage/coverlet#readme)**: The official Microsoft documentation details how to use Coverlet with `dotnet test` to generate Cobertura coverage reports.

### Inputs

- `github-token` (required): GitHub token used to authenticate API requests for checking status checks and publishing releases. This token is automatically made available to `semantic-release` plugins as the `GITHUB_TOKEN` environment variable, so you do not need to set it explicitly. If you do set the `GITHUB_TOKEN` environment variable in your workflow, the value provided by this input will take precedence. It is highly recommended to use `secrets.GITHUB_TOKEN`. For publishing to package registries, you might need a Personal Access Token (PAT) with elevated scopes, depending on your setup.
- `wait-for-checks` (optional, default: `'true'`): Whether to wait for all required status checks to pass before running `semantic-release`. Set to `'false'` to disable this.
- `working-directory` (optional, default: `'.'`) : The directory to search for `semantic-release` configuration files.
- `allow-force-install` (optional, default: `'false'`): If `'true'`, allows the action to overwrite an existing package.json file and forces npm to install dependencies using the `--force` flag. This can be used to resolve conflicting peer dependency issues but should be used with caution as it may lead to a broken installation.

### Outputs

None

## Known Issues

- **Monorepos**: Support for monorepos can be limited, especially when trying to generate a single report for multiple sub-projects. The `working-directory` input can help, but a more comprehensive solution is planned.
- **Multiple Reports**: The action currently only accepts a single path in the `coverage-file` input. It does not support merging multiple coverage reports from different test suites or formats into one summary.
- **File Discovery**: The action does not support heuristics to figure out which file is the coverage file. For now, you must specify it explicitly using the `coverage-file` input.

## Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions): The official documentation for GitHub Actions.
- [Code Coverage](https://en.wikipedia.org/wiki/Code_coverage): An explanation of the principles behind code coverage.

## Contributing

If you have suggestions for how this app could be improved, or
want to report a bug, open an issue—we'd love all and any
contributions.

## License

Apache License 2.0 © 2025 Mridang Agarwalla
