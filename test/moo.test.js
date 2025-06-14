import nock from 'nock';
import { DefaultArtifactClient } from '@actions/artifact';
import * as fs from 'fs';
import * as path from 'path';
import { jest } from '@jest/globals';

// Nock and file setup (remains the same)
const mockBaseUrl = 'http://results.local:8080';
const mockRunId = '1';
const testDir = path.join(process.cwd(), 'test-artifact-dir');
const testFile = path.join(testDir, 'my-file.txt');
const testFileContent = 'this is my artifact file';

describe('[@actions/artifact] - Upload with nock and fetch', () => {
  beforeEach(() => {
    // Setup for dummy files and environment variables (remains the same)
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    fs.writeFileSync(testFile, testFileContent);

    const dummyJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY3AiOiJBY3Rpb25zLlJlc3VsdHM6c29tZS1ydW4taWQ6c29tZS1qb2ItaWQifQ.dummy_signature';
    process.env['ACTIONS_RUNTIME_TOKEN'] = dummyJwt;
    process.env['ACTIONS_RESULTS_URL'] = mockBaseUrl;
    process.env['GITHUB_RUN_ID'] = mockRunId;
  });

  afterEach(() => {
    // Cleanup (remains the same)
    nock.cleanAll();
    fs.unlinkSync(testFile);
    fs.rmdirSync(testDir);
    delete process.env['ACTIONS_RUNTIME_TOKEN'];
    delete process.env['ACTIONS_RESULTS_URL'];
    delete process.env['GITHUB_RUN_ID'];
  });

  test('should successfully mock the artifact upload process using the ArtifactClient', async () => {
    const artifactName = 'my-test-artifact';
    const files = [testFile];
    const rootDirectory = testDir;
    const DUMMY_FINAL_SIZE = 100;

    // --- STAGE 1: Create Artifact --- (remains the same)
    const createArtifactScope = nock(mockBaseUrl)
      .post(
        '/twirp/github.actions.results.api.v1.ArtifactService/CreateArtifact',
      )
      .reply(200, {
        ok: true,
        signedUploadUrl: `${mockBaseUrl}/_upload/artifact-chunk`,
      });

    // ===================================================================
    // THE FIX: Mock the specific Azure Blob Storage block upload pattern
    // ===================================================================

    // --- STAGE 2a: Upload Blocks ---
    // The client PUTs the file chunk with `comp=block` and a unique `blockid`.
    // We use a regex to match any blockid.
    const uploadBlockScope = nock(mockBaseUrl)
      .put(new RegExp('/_upload/artifact-chunk\\?comp=block&blockid='))
      .reply(201, {}); // Azure responds with 201 Created for successful block uploads.

    // --- STAGE 2b: Commit Block List ---
    // After uploading blocks, the client commits them with `comp=blocklist`.
    const commitBlockListScope = nock(mockBaseUrl)
      .put('/_upload/artifact-chunk?comp=blocklist')
      .reply(201, {}); // This also returns 201 Created.

    // --- STAGE 3: Finalize Artifact --- (remains the same)
    const finalizeScope = nock(mockBaseUrl)
      .post(
        '/twirp/github.actions.results.api.v1.ArtifactService/FinalizeArtifact',
      )
      .reply(200, {
        ok: true,
        artifactId: '5678',
        size: DUMMY_FINAL_SIZE,
      });

    // --- EXECUTE THE CODE ---
    const artifactClient = new DefaultArtifactClient();
    const response = await artifactClient.uploadArtifact(
      artifactName,
      files,
      rootDirectory,
      {},
    );

    // --- ASSERTIONS ---
    expect(response).toBeDefined();
    expect(response.id).toBe(5678);

    // Verify all our mocks were called
    expect(createArtifactScope.isDone()).toBe(true);
    expect(uploadBlockScope.isDone()).toBe(true);
    expect(commitBlockListScope.isDone()).toBe(true);
    expect(finalizeScope.isDone()).toBe(true);
  });
});
