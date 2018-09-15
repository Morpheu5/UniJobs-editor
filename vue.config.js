const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin').default;

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    plugins: [
      new WebpackDeepScopeAnalysisPlugin()
    ]
  }
}