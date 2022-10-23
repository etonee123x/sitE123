module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    commonjs: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'standard',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
  },
};
