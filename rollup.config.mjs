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

const progressBarSvgs = ({ outputDir = 'dist/res', maxPct = 100 } = {}) => ({
  name: 'progress-bar-svgs',
  async buildStart() {
    const colors = { yellow: '#ffc107', red: '#dc3545', green: '#28a745' };
    const background = '#e9ecef';
    const W = 100,
      H = 16,
      R = 4;
    const target = path.resolve(outputDir);
    fs.mkdirSync(target, { recursive: true });
    const files = Object.entries(colors).flatMap(([n, hex]) =>
      Array.from({ length: Math.min(maxPct, 100) + 1 }, (_, p) => ({
        filename: `progress-${n}-${String(p).padStart(3, '0')}.svg`,
        content:
          `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">` +
          `<rect width="${W}" height="${H}" rx="${R}" ry="${R}" fill="${background}" />` +
          (p
            ? `<rect width="${(p / 100) * W}" height="${H}" rx="${R}" ry="${R}" fill="${hex}" />`
            : '') +
          '</svg>',
      })),
    );
    await Promise.all(
      files.map(({ filename, content }) =>
        fs.writeFileSync(path.join(target, filename), content),
      ),
    );
  },
});

// noinspection JSUnusedGlobalSymbols
export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.cjs',
    format: 'cjs',
    sourcemap: false,
    inlineDynamicImports: true,
    interop: 'esModule'
  },
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return;
    }
    warn(warning);
  },
  plugins: [
    progressBarSvgs(),
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
  external: [],
};
