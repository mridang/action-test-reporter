import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import * as nodeModule from 'node:module';

const BASE_NODE_BUILTINS_RAW_OUTPUT = nodeModule.builtinModules;
const NODE_BUILTINS_SET = new Set();
BASE_NODE_BUILTINS_RAW_OUTPUT.forEach((moduleName) => {
  NODE_BUILTINS_SET.add(moduleName);
  NODE_BUILTINS_SET.add(`node:${moduleName}`);
});
const NODE_BUILTINS = Array.from(NODE_BUILTINS_SET);

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
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
    }),
  ],
  // Marks Node.js built-in modules as external, meaning they will be required from the Node.js runtime
  // instead of being bundled. This is crucial for Node.js applications.
  external: NODE_BUILTINS,
};
