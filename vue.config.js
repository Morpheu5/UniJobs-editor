const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin').default;

module.exports = {
  baseUrl: process.env.VUE_APP_ROUTER_BASE || '/',
  productionSourceMap: false,
  configureWebpack: {
    plugins: [
      new WebpackDeepScopeAnalysisPlugin()
    ]
  }
}