//全局配置
 window.config= {
  //  apiIp:'http://192.168.52.138:8082',
    // apiIp:'http://172.16.3.155:8081',  //接口IP
    apiIp:'http://172.16.3.155:8082',  //接口IP
    videoServiceIp:'wss://192.168.1.146/ws',  //视频服务器ip
    weatherUpdateTime:1000 * 60 * 10, //天气更新时间，默认十分钟
    eventDynamicsSpeed:3000,       //事件动态滚动时间（需大于1秒，1000=1秒）
    language:'zh',                  //语言
    noLogin:true,    // 免登录
    isSham:false,     //启用假视频
    mapName:'上海', //地图,需和map目录下的json文件名对应
  }




