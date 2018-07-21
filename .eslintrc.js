module.exports = {
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  root: true,
  extends: [
    'plugin:vue/essential'
  ],
  plugins: [
    'vue'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unused-vars': ['warn', { "argsIgnorePattern": "^_" }],
    'vue/html-indent': [ 'error', 4 ],
    // 'vue/script-indent': [ 'error', 4 ],
    'vue/attributes-order': 'error',
    'vue/order-in-components': 'error'
  },
}