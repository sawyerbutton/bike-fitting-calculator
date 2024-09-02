const { defineConfig } = require('@vue/cli-service')
// 基本路径根据当前是生产环境还是开发环境来判断
let BASE_URL = process.env.NODE_ENV === 'production' ? '/bike-fitting-calculator/' : '/'
module.exports = defineConfig({
  publicPath: BASE_URL,
  transpileDependencies: true,
  runtimeCompiler: true,
  productionSourceMap: true,//SourceMap是否开启
  configureWebpack: {
    devtool: 'source-map',//SourceMap模式
    //警告 webpack 的性能提示
    performance: {
      hints: 'warning',
      //入口起点的最大体积
      maxEntrypointSize: 50000000,
      //生成文件的最大体积
      maxAssetSize: 30000000,
      //只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js');
      },
    },
  }
})
