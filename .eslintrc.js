module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    mocha: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    indent: ['error', 2],
    'no-console': 'off', // Allow console for CLI applications
    'consistent-return': 'off', // Allow functions without explicit returns
    'no-param-reassign': 'off', // Allow parameter reassignment
    'max-len': ['error', { code: 120, ignoreComments: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'no-use-before-define': ['error', { functions: false }],
    'no-unused-vars': ['error', { varsIgnorePattern: 'fs|path' }],
    'no-unused-expressions': 'off',
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'implicit-arrow-linebreak': 'off',
    'no-confusing-arrow': 'off',
    'no-restricted-syntax': 'off',
    'no-continue': 'off',
    'no-underscore-dangle': 'off',
  },
};
