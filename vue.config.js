module.exports = {
    publicPath: process.env.VUE_APP_ROUTER_BASE || '/',
    configureWebpack: (config) => {
        config.devtool = 'source-map';
    }
};
