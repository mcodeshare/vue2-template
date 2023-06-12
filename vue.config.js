const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 9106,
    proxy: {
      // '/api': {
      //   target: "http://httpbin.org",
      //   changOrigin: true,
      //   pathRewrite: {
      //     '^/api': ''
      //   }
      // }
      '/amar': {
        target: 'http://10.16.23.168',
        changeOrigin: true
      },
    }
  }
})
