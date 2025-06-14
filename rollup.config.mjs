// rollup.config.mjs

// --- Plugin Imports ---
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript'; // For TypeScript transpilation
// Uncomment if minification is desired:
// import { terser } from 'rollup-plugin-terser';

// --- Node.js Built-in Module Imports (for dynamic list generation and path resolution) ---
import { dirname, resolve as r } from 'node:path';
import { readFileSync } from 'node:fs';
import * as nodeModule from 'node:module'; // Used to dynamically get Node.js built-in modules

// --- Node.js Built-ins List (Dynamically generated for robustness) ---
// Retrieves the list of all built-in Node.js modules for the current runtime.
const BASE_NODE_BUILTINS_RAW_OUTPUT = nodeModule.builtinModules;

// Enhances the list to include both raw names (e.g., 'fs') and 'node:' prefixed names (e.g., 'node:fs').
const NODE_BUILTINS_SET = new Set();
BASE_NODE_BUILTINS_RAW_OUTPUT.forEach((moduleName) => {
  NODE_BUILTINS_SET.add(moduleName);
  NODE_BUILTINS_SET.add(`node:${moduleName}`);
});
const NODE_BUILTINS = Array.from(NODE_BUILTINS_SET);

// --- Specific Workaround for problematic JSON dependency ---
// Aliases a problematic JSON file path from '@pnpm/npm-conf' to an empty object.
const badJson = r('node_modules/@pnpm/npm-conf/lib/tsconfig.make-out.json');

// --- Plugin to Inline package.json files from node_modules ---
// Transforms 'require("...package.json")' calls inside node_modules
// to inline the actual package.json content.
const inlinePackageJsonPlugin = {
  name: 'inline-package-json',
  transform(code, id) {
    // Only apply to files within node_modules
    if (!id.includes('node_modules')) {
      return null;
    }

    const requirePattern = /require\((['"`])(.+?package\.json)\1\)/g;

    const newCode = code.replace(
      requirePattern,
      (match, quote, requiredPath) => {
        try {
          const pkgPath = r(dirname(id), requiredPath);
          return readFileSync(pkgPath, 'utf-8');
        } catch (e) {
          this.warn(
            `Failed to inline '${requiredPath}' for ${id}: ${e.message}`,
          );
          return match;
        }
      },
    );

    return {
      code: newCode,
      map: null,
    };
  },
};

// --- Main Rollup Configuration ---
export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.cjs',
    format: 'cjs', // Output as CommonJS for Node.js environment
    sourcemap: true, // Keep false if you don't need source maps for production
    inlineDynamicImports: true, // Bundles dynamic imports directly into the main file
    // Custom interoperability logic for module loading:
    interop: (id) => {
      // For Node.js built-in modules (e.g., 'buffer', 'fs/promises'):
      // Return 'default' to ensure they are treated as pure CommonJS modules,
      // without extra '.default' wrappers, matching Node.js's native behavior.
      if (NODE_BUILTINS.includes(id)) {
        return 'default'; // CHANGED from `false` to `'default'`
      }
      // For all other modules (e.g., 'jwt-decode'), return 'esModule' to ensure
      // they get the `__esModule: true` flag, allowing `import Foo from 'foo'` to work.
      return 'esModule';
    },
  },
  onwarn(warning, warn) {
    // Suppress specific warnings, e.g., circular dependencies which might be expected.
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    // Suppress the 'this' rewrite warning for __awaiter, as it's typically harmless.
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    warn(warning); // Log other warnings
  },
  plugins: [
    // Alias problematic module paths.
    alias({ entries: [{ find: badJson, replacement: '\0empty-json' }] }),
    // Provides an empty module for aliased paths.
    {
      name: 'empty-json',
      resolveId(id) {
        return id === '\0empty-json' ? id : null;
      },
      load(id) {
        if (id === '\0empty-json') return 'export default {};';
      },
    },

    inlinePackageJsonPlugin, // Custom plugin to inline package.json files.

    // Resolves modules from node_modules, preferring Node.js entry points and built-ins.
    resolve({ exportConditions: ['node', 'default'], preferBuiltins: true }),
    // Converts CommonJS modules in node_modules into ES Module equivalents for Rollup's graph.
    commonjs({
      include: /node_modules/,
      // Explicitly handles `jwt-decode`'s default export to ensure compatibility with `__importDefault` helper.
      requireReturnsDefault: (id) => {
        if (id.includes('jwt-decode')) {
          return true;
        }
        return 'auto'; // For all other CommonJS modules, use auto-detection.
      },
      ignore: NODE_BUILTINS, // Prevents commonjs from transforming require() calls for Node.js built-ins.
    }),
    // Handles JSON file imports, converting them into ES modules.
    json({
      preferConst: true,
      compact: true,
    }),
    // Transpiles TypeScript code to JavaScript.
    typescript({
      tsconfig: './tsconfig.json', // References your project's TypeScript configuration.
      module: "NodeNext",
      moduleResolution: "NodeNext",
    }),
  ],
  // Marks Node.js built-in modules as external, meaning they will be required from the Node.js runtime
  // instead of being bundled. This is crucial for Node.js applications.
  external: NODE_BUILTINS,
};
