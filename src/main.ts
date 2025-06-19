/**
 * The entrypoint for the action. This file simply imports and runs the action's
 * main logic.
 */
import { run } from './index.js';

/* istanbul ignore next */
// noinspection JSUnusedGlobalSymbols
export default (async () => {
  await run();
})();
