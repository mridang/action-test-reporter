import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import { dirname, resolve as r } from 'node:path';
import { readFileSync } from 'node:fs';
import path from 'path';
import * as fs from 'node:fs';

const BASE_NODE_BUILTINS = [
  '_http_agent',
  '_http_client',
  '_http_common',
  '_http_incoming',
  '_http_outgoing',
  '_http_server',
  '_stream_duplex',
  '_stream_passthrough',
  '_stream_readable',
  '_stream_transform',
  '_stream_wrap',
  '_stream_writable',
  '_tls_common',
  '_tls_wrap',
  'assert',
  'assert/strict',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'dns/promises',
  'domain',
  'events',
  'fs',
  'fs/promises',
  'http',
  'http2',
  'https',
  'inspector',
  'inspector/promises',
  'module',
  'net',
  'os',
  'path',
  'path/posix',
  'path/win32',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'readline/promises',
  'repl',
  'stream',
  'stream/consumers',
  'stream/promises',
  'stream/web',
  'string_decoder',
  'sys',
  'timers',
  'timers/promises',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'util/types',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
];

// Automatically generate 'node:' prefixed versions for common built-ins
// Filter out the ones that are already subpath imports (e.g., 'path/posix')
// and those that don't make sense with 'node:' prefix (e.g., '_http_agent')
const NODE_BUILTINS_SET = new Set();
BASE_NODE_BUILTINS.forEach((moduleName) => {
  NODE_BUILTINS_SET.add(moduleName); // Add the original form (e.g., 'fs/promises')
  NODE_BUILTINS_SET.add(`node:${moduleName}`); // Add the 'node:' prefixed form (e.g., 'node:fs/promises')
});

const NODE_BUILTINS = Array.from(NODE_BUILTINS_SET);
const badJson = r('node_modules/@pnpm/npm-conf/lib/tsconfig.make-out.json');

const inlinePackageJsonPlugin = {
  name: 'inline-package-json',
  transform(code, id) {
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

// noinspection JSUnusedGlobalSymbols
export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.cjs',
    format: 'cjs',
    sourcemap: false,
    inlineDynamicImports: true,
    interop: (id) => {
      // If the ID is a Node.js built-in module
      if (NODE_BUILTINS.includes(id)) {
        // Force pure CommonJS behavior: no default wrapper.
        // This makes `require('buffer')` return the actual buffer module directly.
        return 'default'; // Or false, which also means pure CJS interop
      }
      // For all other modules (like jwt-decode), continue with esModule interop
      // where `import Foo from 'foo'` expects `foo.default`.
      return 'esModule';
    },
  },
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    warn(warning);
  },
  plugins: [
    alias({ entries: [{ find: badJson, replacement: '\0empty-json' }] }),
    {
      name: 'empty-json',
      resolveId(id) {
        return id === '\0empty-json' ? id : null;
      },
      load(id) {
        if (id === '\0empty-json') return 'export default {};';
      },
    },

    inlinePackageJsonPlugin,

    resolve({ exportConditions: ['node', 'default'], preferBuiltins: true }),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: (id) => {
        // Use `id.includes()` for robustness against full paths vs short names
        if (id.includes('jwt-decode')) {
          return true; // Explicitly tell commonjs that jwt-decode's main export IS its default
        }
        return 'auto'; // For all other modules handled by commonjs
      },
      ignore: NODE_BUILTINS,
    }),
    json({
      preferConst: true,
      compact: true,
    }),
    esbuild({
      target: 'node20',
      tsconfig: './tsconfig.json',
      exclude: ['**/node_modules/jwt-decode/**'],
    }),
  ],
  external: NODE_BUILTINS,
};
