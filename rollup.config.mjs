import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import * as nodules from 'node:module';
import json from '@rollup/plugin-json';

const NODE_BUILTINS = nodules.builtinModules.reduce(
  (acc, name) => acc.concat([name, `node:${name}`]),
  [],
);

// noinspection JSUnusedGlobalSymbols
export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.cjs',
    format: 'cjs',
    sourcemap: true,
    inlineDynamicImports: true,
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
    switch (warning.code) {
      case 'CIRCULAR_DEPENDENCY':
      case 'THIS_IS_UNDEFINED':
        return;
      default:
        warn(warning);
    }
  },
  plugins: [
    json(),
    resolve({ exportConditions: ['node', 'default'], preferBuiltins: true }),
    commonjs({
      include: /node_modules/,
      // Explicitly handles `jwt-decode`'s default export to ensure compatibility with `__importDefault` helper.
      requireReturnsDefault: (id) => {
        if (id.includes('jwt-decode')) {
          return true;
        }
        return 'auto'; // For all other CommonJS modules, use auto-detection.
      },
      ignore: NODE_BUILTINS,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
    }),
  ],
  external: NODE_BUILTINS,
};
