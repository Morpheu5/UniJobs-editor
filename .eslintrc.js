module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/no-unused-vars': ['warning', { "argsIgnorePattern": "^_" }],
    'vue/html-indent': ['error', 4],
    'vue/attributes-order': 'error',
    'vue/order-in-components': 'error',
    'semi': ['error', 'always'],
    'indent': 'off', //['error', 4],
    'space-before-function-paren': ['error', 'never'],
    'eol-last': 'off',
    'quotes': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
