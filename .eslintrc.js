module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:vue/essential',
    // '@vue/prettier'
  ],
  plugins: [
    'vue'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unused-vars': 'warn',
    'vue/html-indent': [ 'error', 4 ],
    'vue/script-indent': [ 'error', 4 ],
    'vue/attributes-order': 'error',
    'vue/order-in-components': 'error'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}