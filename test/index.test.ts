import { describe, expect, test } from '@jest/globals';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as xml2js from 'xml2js';
// noinspection ES6PreferShortImport
import { run } from '../src/index.js';
import { withTempDir } from './helpers/with-temp-dir.js';
import { withEnvVars } from './helpers/with-env-vars.js';
import nock from 'nock';

/**
 * Executes the main action script (`run`) within a controlled environment,
 * simulating the GitHub Actions runtime.
 *
 * @param {Record<string, string>} inputs - The action's inputs.
 * @param {Record<string, string | undefined>} [extraEnv={}] - Additional
 * environment variables to simulate the GitHub context.
 * @returns {Promise<{summary: string}>} A promise that resolves with the
 * generated summary content.
 */
async function runAction(
  inputs: Record<string, string>,
  extraEnv: Record<string, string | undefined> = {},
): Promise<{ summary: string; nockScope: nock.Scope }> {
  const summaryDir = mkdtempSync(join(tmpdir(), 'test-summary-'));
  const summaryPath = join(summaryDir, 'summary.md');
  writeFileSync(summaryPath, '');

  const nockScope = nock('http://results.local:8080')
    .post('/twirp/github.actions.results.api.v1.ArtifactService/CreateArtifact')
    .reply(200, {
      ok: true,
      signedUploadUrl: `http://results.local:8080/_upload/artifact-chunk`,
    })
    .put(new RegExp('/_upload/artifact-chunk\\?comp=block&blockid='))
    .reply(201, {})
    .put('/_upload/artifact-chunk?comp=blocklist')
    .reply(201, {})
    .post(
      '/twirp/github.actions.results.api.v1.ArtifactService/FinalizeArtifact',
    )
    .reply(200, {
      ok: true,
      artifactId: '5678',
      size: 100,
    });

  const env = {
    ...extraEnv,
    ...Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [
        `INPUT_${key.replace(/ /g, '_').toUpperCase()}`,
        value,
      ]),
    ),
    GITHUB_STEP_SUMMARY: summaryPath,
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_REPOSITORY: 'test-owner/test-repo',
    GITHUB_SHA: '03ab23e',
    GITHUB_REF: 'refs/heads/main',
    GITHUB_RUN_ID: '1',
    ACTIONS_RUNTIME_TOKEN:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY3AiOiJBY3Rpb25zLlJlc3VsdHM6c29tZS1ydW4taWQ6c29tZS1qb2ItaWQifQ.dummy_signature',
    ACTIONS_RESULTS_URL: 'http://results.local:8080',
  };

  try {
    const wrappedRun = withEnvVars(env, () => run());
    await wrappedRun();
  } finally {
    nock.cleanAll();
  }

  const summaryContent = readFileSync(summaryPath, 'utf8');
  return { summary: summaryContent, nockScope };
}

describe('Coverage Action', () => {
  test(
    'should generate a correct summary from a valid clover.xml file',
    withTempDir(async ({ tmp }) => {
      const coverageFilePath = join(tmp, 'clover.xml');
      const cloverContent = new xml2js.Builder({
        attrkey: '$',
        xmldec: { version: '1.0', encoding: 'UTF-8' },
      }).buildObject({
        coverage: {
          $: { generated: '1678886400' },
          project: {
            $: { timestamp: '1678886400' },
            metrics: {
              $: {
                statements: '15',
                coveredstatements: '11',
                conditionals: '6',
                coveredconditionals: '4',
                methods: '3',
                coveredmethods: '2',
              },
            },
            file: [
              {
                $: { name: `${tmp}/src/main.ts` },
                metrics: {
                  $: {
                    statements: '5',
                    coveredstatements: '5',
                    methods: '1',
                    coveredmethods: '1',
                    conditionals: '2',
                    coveredconditionals: '2',
                  },
                },
                line: [{ $: { num: '5', type: 'stmt', count: '1' } }],
              },
              {
                $: { name: `${tmp}/src/utils.ts` },
                metrics: {
                  $: {
                    statements: '10',
                    coveredstatements: '6',
                    methods: '2',
                    coveredmethods: '1',
                    conditionals: '4',
                    coveredconditionals: '2',
                  },
                },
                line: [
                  { $: { num: '9', type: 'stmt', count: '0' } },
                  { $: { num: '12', type: 'stmt', count: '0' } },
                ],
              },
            ],
          },
        },
      });
      writeFileSync(coverageFilePath, cloverContent);

      const { summary } = await runAction(
        {
          'coverage-file': coverageFilePath,
          'working-directory': tmp,
          'github-token': 'fake-token',
        },
        {
          GITHUB_EVENT_NAME: 'push',
          GITHUB_REF: 'refs/heads/main',
          GITHUB_SHA: '03ab23e',
          GITHUB_REPOSITORY: 'test-owner/test-repo',
        },
      );

      expect(summary).toContain('### Code Coverage Report 📊');
      expect(summary).toContain('73.33%');
    }),
  );
});
