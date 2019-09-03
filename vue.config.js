module.exports = {
    publicPath: process.env.VUE_APP_ROUTER_BASE || '/',
    configureWebpack: (config) => {
        config.devtool = 'source-map';

        config.output.devtoolModuleFilenameTemplate = info => info.resourcePath.match(/^\.\/\S*?\.vue$/)
        ? `webpack-generated:///${info.resourcePath}?${info.hash}`
        : `webpack-yourCode:///${info.resourcePath}`;

        config.output.devtoolFallbackModuleFilenameTemplate = 'webpack:///[resource-path]?[hash]';
    }
};
