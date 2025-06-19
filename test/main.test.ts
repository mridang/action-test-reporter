import { describe, test } from '@jest/globals';
import * as fs from 'node:fs';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import os, { tmpdir } from 'node:os';
import * as xml2js from 'xml2js';
// noinspection ES6PreferShortImport
import { withTempDir } from './helpers/with-temp-dir.js';
import { withEnvVars } from './helpers/with-env-vars.js';
import nock from 'nock';
import jwt from 'jsonwebtoken';
import * as vm from 'node:vm';
import path from 'path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { rollup } from 'rollup';
import { constants as VM } from 'vm';

/**
 * Bundle the project using the local rollup.config.mjs and write the output
 * to "<outputDir>/.test-bundles/bundle-<timestamp>.cjs".
 * Returns the absolute path to the generated bundle so tests can load it
 * with `fs.readFileSync`, `vm.runInContext`, etc.
 *
 * @returns Absolute path of the generated CommonJS bundle.
 */
export async function bundleToPath(): Promise<string> {
  // eslint-disable-next-line no-unsanitized/method
  const { default: createRollupConfig } = await import(
    pathToFileURL(path.resolve('rollup.config.mjs')).href
  );

  const testConfig = createRollupConfig({
    typescript: {
      outDir: undefined,
      declaration: false,
      sourceMap: true,
    },
  });

  const bundle = await rollup(testConfig);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-bundle-'));
  const outputFile = path.join(tempDir, `bundle-${Date.now()}.cjs`);

  fs.copyFileSync(
    path.join(process.cwd(), 'tsconfig.json'),
    path.join(tempDir, 'tsconfig.json'),
  );
  try {
    await bundle.write({ ...testConfig.output, file: outputFile });
  } finally {
    await bundle.close();
  }

  return outputFile;
}

/**
 * Executes the main action script (`run`) within a controlled environment,
 * simulating the GitHub Actions runtime.
 *
 * @param {Record<string, string>} inputs - The action's inputs.
 * @param {Record<string, string | undefined>} [extraEnv={}] - Additional
 * environment variables to simulate the GitHub context.
 * @param eventPayload
 * @returns {Promise<{summary: string}>} A promise that resolves with the
 * generated summary content.
 */
async function runAction(
  inputs: Record<string, string>,
  extraEnv: Record<string, string | undefined> = {},
  eventPayload: unknown = {},
): Promise<{ summary: string }> {
  const summaryDir = mkdtempSync(join(tmpdir(), 'test-'));
  const summaryPath = join(summaryDir, 'summary.md');
  writeFileSync(summaryPath, '');

  const eventDir = mkdtempSync(join(tmpdir(), 'test-'));
  const eventPath = join(eventDir, 'event.json');
  writeFileSync(eventPath, JSON.stringify(eventPayload));

  nock('http://results.local:8080')
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
    GITHUB_EVENT_PATH: eventPath,
    GITHUB_STEP_SUMMARY: summaryPath,
    GITHUB_SERVER_URL: 'https://github.com',
    GITHUB_REPOSITORY: 'test-owner/test-repo',
    GITHUB_SHA: '03ab23e',
    GITHUB_REF: 'refs/heads/main',
    GITHUB_RUN_ID: '1',
    ACTIONS_STEP_DEBUG: '1',
    RUNNER_DEBUG: '1',
    ACTIONS_RUNTIME_TOKEN: jwt.sign(
      {
        scp: 'Actions.Results:some-run-id:some-job-id',
      },
      'dummy-secret',
    ),
    ACTIONS_RESULTS_URL: 'http://results.local:8080',
  };

  try {
    const wrappedRun = withEnvVars(env, async () => {
      const actionScript = await bundleToPath();
      const script = fs.readFileSync(actionScript, 'utf8');

      const context = {
        ...process.env,
        require: createRequire(import.meta.url),
        global: {},
        __filename: actionScript,
        __dirname: path.dirname(actionScript),
        module: { exports: {} },
      };
      Object.defineProperties(
        context,
        Object.getOwnPropertyDescriptors(globalThis),
      );
      vm.createContext(context);
      const result = vm.runInContext(script, context, {
        filename: actionScript,
        importModuleDynamically: VM.USE_MAIN_CONTEXT_DEFAULT_LOADER,
      }) as unknown;

      await result;
      return '';
    });
    await wrappedRun();
  } finally {
    nock.cleanAll();
  }

  const summaryContent = readFileSync(summaryPath, 'utf8');
  return { summary: summaryContent };
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

      await runAction(
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
    }),
  );
});
