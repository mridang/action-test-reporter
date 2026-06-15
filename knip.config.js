module.exports = {
  entry: [
    'src/index.ts',
    'src/testresult/main.ts',
    'src/coverage/index.ts',
    'src/coverage/runner.ts',
  ],
  project: ['src/**/*.ts', 'test/**/*.ts'],
  ignoreDependencies: [
    '@semantic-release/.*?',
    '@commitlint/config-conventional',
    'jest-junit',
  ],
};
