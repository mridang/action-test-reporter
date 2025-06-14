import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import { dirname, resolve as r } from 'node:path';
import { readFileSync } from 'node:fs';
import path from 'path';
import * as fs from 'node:fs';

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
    interop: 'esModule',
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
      requireReturnsDefault: 'auto',
      ignore: ['util', 'events', 'http', 'https', 'tls', 'url', 'path', 'fs'],
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
  external: ['util', 'events', 'http', 'https', 'tls'],
};
