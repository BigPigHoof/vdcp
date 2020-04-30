
module.exports = {
    // ... 
    publicPath:'./',
    assetsDir: "assets",
    productionSourceMap: false,
    configureWebpack: {
        externals: {
            'AMap': 'AMap', // 高德地图配置           
            'AMapUI': 'AMapUI'
          },
      
      },
    //   proxyTable: { 
    //     '/api': {  //使用"/api"来代替"http://f.apiplus.c" 
    //       target: 'http://api.m.taobao.com', //源地址 
    //       changeOrigin: true, //改变源 
    //       pathRewrite: { 
    //         '^/api': 'http://api.m.taobao.com' //路径重写 
    //         } 
    //     } 
    //   },
      devServer: {
        proxy: {
          '/taobaoapi': {
            target: 'http://api.m.taobao.com',
            changeOrigin: true,
          },

        }
      }
      

}