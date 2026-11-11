/**
 * @file The entrypoint for the action, which imports and runs the main logic.
 */

import { run } from './index.js';

// eslint-disable-next-line unicorn/prefer-top-level-await -- the CommonJS bundle produced by rollup cannot use top-level await
export default (async () => {
  await run();
})();
