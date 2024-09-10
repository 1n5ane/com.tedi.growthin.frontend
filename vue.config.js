const {defineConfig} = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://localhost:10000',
        changeOrigin: true,
        secure: false, //for self signed certificate
      }
    }
  }
});
