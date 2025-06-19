import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import * as nodules from 'node:module';
import json from '@rollup/plugin-json';
import path from 'path';
import * as fs from 'node:fs';

const NODE_BUILTINS = nodules.builtinModules.reduce(
  (acc, name) => acc.concat([name, `node:${name}`]),
  [],
);

// noinspection JSUnusedGlobalSymbols
const progressBarSvgs = ({ outputDir = 'dist/res', maxPct = 100 } = {}) => ({
  name: 'progress-bar-svgs',
  async buildStart() {
    const colors = { yellow: '#eac54f', red: '#cf222e', green: '#3fb94f' };
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

// noinspection JSUnusedGlobalSymbols,SpellCheckingInspection
export default (configOverrides = {}) => ({
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
    progressBarSvgs(),
    json({
      preferConst: true,
      compact: true,
    }),
    resolve({
      exportConditions: ['node', 'default'],
      preferBuiltins: true,
    }),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: (id) => {
        if (id.includes('jwt-decode')) {
          return true;
        }
        return 'auto';
      },
      ignore: NODE_BUILTINS,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      ...configOverrides.typescript,
    }),
  ],
  external: NODE_BUILTINS,
});
