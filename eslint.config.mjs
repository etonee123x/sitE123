import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    name: 'ignores',
    ignores: ['submodules/'],
  },
  {
    name: 'js: recommended',
    ...pluginJs.configs.recommended,
  },
  {
    name: 'prettier: recommended',
    ...eslintPluginPrettierRecommended,
  },
  ...tseslint.configs.recommended,
  {
    name: 'global languageOptions',
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  },
  {
    name: 'files pattern',
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
  },
  {
    name: 'stylistic',
    plugins: {
      '@stylistic/js': stylistic,
      '@stylistic/ts': stylistic,
    },
    rules: {
      '@stylistic/js/semi': ['error', 'always'],
      '@stylistic/js/block-spacing': ['error', 'always'],
      '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/js/no-mixed-operators': 'error',
      '@stylistic/js/lines-around-comment': [
        'error',
        {
          beforeBlockComment: false,
          allowBlockStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],
      '@stylistic/js/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: ['return', 'export', 'function'],
        },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
    },
  },
  {
    name: 'typescript',
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    },
  },
  {
    name: 'global rules',
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-unexpected-multiline': 'error',
      'no-var': 'error',
      'no-unsafe-optional-chaining': 'error',
      curly: ['error', 'all'],
      'arrow-body-style': ['error', 'as-needed'],
      'no-sparse-arrays': ['off'],
    },
  },
  {
    name: 'prettier',
    rules: {
      'prettier/prettier': [
        'error',
        {
          printWidth: 120,
          singleQuote: true,
          endOfLine: 'auto',
        },
      ],
    },
  },
];
