import mridangPlugin from '@mridang/eslint-defaults';

export default [
  ...mridangPlugin.configs.recommended,
  {
    ignores: [
      'test/__fixtures__/**/*',
      'test/__outputs__/**/*',
      'test/testresult/__fixtures__/**/*',
      'test/testresult/__outputs__/**/*',
      'test/coverage/__fixtures__/**/*',
      'test/coverage/__outputs__/**/*',
    ],
  },
];
