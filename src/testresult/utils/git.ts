import * as core from '@actions/core';
import { getExecOutput } from '@actions/exec';

export async function listFiles(): Promise<string[]> {
  core.startGroup('Listing all files tracked by git');
  let output = '';
  try {
    output = (await getExecOutput('git', ['ls-files', '-z'])).stdout;
  } finally {
    fixStdOutNullTermination();
    core.endGroup();
  }

  return output.split('\u0000').filter((s) => s.length > 0);
}

function fixStdOutNullTermination(): void {
  core.info('');
}
