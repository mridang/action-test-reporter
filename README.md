# Semantic Release GitHub Action

A GitHub Action that runs [semantic-release](https://semantic-release.gitbook.io/semantic-release/) when code is pushed to a branch or tag. This action streamlines your release process by automating versioning and package publishing, ensuring consistency and adherence to semantic versioning principles.

## Features

- **Automated Plugin Installation**: Automatically installs `semantic-release` plugins defined in your declarative configuration files (e.g., `.json`, `.yaml`).
- **Status Check Waiting**: Optionally waits for all required GitHub status checks to pass before executing `semantic-release`, preventing releases from being published prematurely.
- **Flexible Configuration**: Supports various `semantic-release` configuration file formats and allows you to specify a working directory.
- **Detailed Output**: Provides clear logs and a summary of the published release version.

### Why?

- **Reusability**: This action is designed to be highly reusable across multiple projects, simplifying your CI/CD setup for semantic releases.
- **Wait for Checks**: Unlike typical `semantic-release` workflows, this action allows you to explicitly wait for all other GitHub checks to complete before proceeding with the release. This ensures that releases are only published after all tests and quality gates have passed. **Note**: This feature does not wait for disabled workflows.
- **Decoupled Workflow**: By waiting for other checks, this action can run independently of your main CI workflow (which might be triggered by pull requests and merges to `main`). This decoupling reduces the risk of exposing sensitive `semantic-release` tokens in contexts where they are not strictly necessary, a common security concern in open-source projects.
- **Fast Execution**: The action optimizes for speed by caching dependencies, leading to quicker execution times for your release workflow.
- **Simplified for Polyglot Repositories**: Abstracts away the Node.js ecosystem, enabling `semantic-release` usage in non-Node.js projects without requiring a `package.json` or various JavaScript/TypeScript configuration files within your repository.

## Usage

To use this action, add it to your workflow file (e.g., `.github/workflows/release.yml`).

```yaml
name: Release

on:
  push:
    branches:
      - main # or your default branch
      - next
    tags:
      - '*' # if you want to trigger on tags as well

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required for semantic-release to work correctly

      - name: Semantic Release
        uses: mridang/action-test-reporter@v1
        env:
          ADDITIONAL_SECRET: ${{ secrets.MY_SECRET }}
        with:
          wait-for-checks: 'true' # Default is 'true'
          working-directory: '.' # Default is '.'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          allow-force-install: 'true' # Default is 'false'
```

This workflow is now configured to trigger a release on any commit to `main` (or `next` or any tag), and then wait for all other checks on that specific push event to succeed before initiating the `semantic-release` process. This ensures that your release pipeline only proceeds when all other CI/CD checks (e.g., tests, linters, build steps) have passed successfully. This behavior can be disabled by setting the `wait-for-checks` input to `false`.

### Inputs

- `github-token` (required): GitHub token used to authenticate API requests for checking status checks and publishing releases. This token is automatically made available to `semantic-release` plugins as the `GITHUB_TOKEN` environment variable, so you do not need to set it explicitly. If you do set the `GITHUB_TOKEN` environment variable in your workflow, the value provided by this input will take precedence. It is highly recommended to use `secrets.GITHUB_TOKEN`. For publishing to package registries, you might need a Personal Access Token (PAT) with elevated scopes, depending on your setup.
- `wait-for-checks` (optional, default: `'true'`): Whether to wait for all required status checks to pass before running `semantic-release`. Set to `'false'` to disable this.
- `working-directory` (optional, default: `'.'`) : The directory to search for `semantic-release` configuration files.
- `allow-force-install` (optional, default: `'false'`): If `'true'`, allows the action to overwrite an existing package.json file and forces npm to install dependencies using the `--force` flag. This can be used to resolve conflicting peer dependency issues but should be used with caution as it may lead to a broken installation.

## Outputs

None

### Configuration

This action uses `cosmiconfig` to find your `semantic-release` configuration. It supports the following file formats:

- `.releaserc`
- `release.config.js`
- `release.config.cjs`
- `release.config.mjs`
- `release.config.ts`
- `.releaserc.json`
- `.releaserc.yaml`
- `.releaserc.yml`
- `package.json` (under the `release` key)

### In Node.js (or related) projects

For JavaScript/TypeScript projects, you typically use an imperative configuration file like `release.config.mjs` or `release.config.js`. When using such a file, all `semantic-release` plugins must be declared as development dependencies in your project's `package.json` file.

**Example `release.config.mjs`:**

```javascript
export default {
  branches: ['main', { name: 'beta', prerelease: true }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    '@semantic-release/github',
  ],
};
```

The action will automatically run `npm install` in your working directory to ensure all these declared dependencies are available for `semantic-release` to function correctly.

### In non-Node projects

For projects not based on Node.js, we recommend using a declarative configuration file such as `.releaserc.json`, `.releaserc.yaml`, or `.releaserc.yml`. With these formats, you can declare your `semantic-release` plugins directly within the configuration file, and the action will automatically install the necessary dependencies without requiring a `package.json` or any extra setup steps on your part.

**Example `.releaserc.json`:**

```json
{
  "branches": ["main", { "name": "beta", "prerelease": true }],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github"
  ]
}
```

The action will detect the plugins listed in these declarative files, create a temporary `package.json` for them, and install them on the fly, making it very convenient for polyglot repositories.

## Known Issues

- This action requires a deep checkout of the repository history (e.g., `fetch-depth: 0` in `actions/checkout`). This is necessary for `semantic-release` to properly analyze the commit history for versioning.
- This action is designed to be triggered by `push` events (branches or tags) and will not work for custom workflows where you need to release using `workflow_dispatch`.

## Useful links

- **[Semantic Release](https://semantic-release.gitbook.io/semantic-release/):** The automated versioning and package publishing tool this action runs.
- **[Cosmiconfig](https://github.com/cosmiconfig/cosmiconfig):** The universal configuration loader used by this action to find `semantic-release` configurations.
- **[Semantic Versioning (SemVer)](https://semver.org/):** A widely adopted standard for version numbering that your commit messages can help facilitate with automated tools.

## Contributing

If you have suggestions for how this app could be improved, or
want to report a bug, open an issue—we'd love all and any
contributions.

## License

Apache License 2.0 © 2025 Mridang Agarwalla
