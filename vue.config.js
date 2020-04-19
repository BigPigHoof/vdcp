
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
      

}