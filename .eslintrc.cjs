module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'standard',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    curly: ['error', 'multi-or-nest'],
    'comma-dangle': ['error', 'always-multiline'],
    semi: [2, 'always'],
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always',
    }],
  },
};
