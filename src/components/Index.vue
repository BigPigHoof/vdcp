<!--  -->
<template>
  <div class="wrapper">

    <header :style="{zIndex:$route.name=='EventDetail'?'4':'1'}">
      <div class="left">
        <div class="weather">
          <span v-show="nowWeather" class="img" :style="{backgroundPosition:bgPos}"></span>
          <span class="info">{{nowWeather}}</span>
        </div>
      </div>
      <h4 class="title">可视化决策指挥系统</h4>
      <div class="right">
        <div class="time">
          <span class="date-time">{{nowTime| dateformat('YYYY-MM-DD HH:mm')}}</span>
          <span class="question" @click="showHelpCenter=true" >
            <i class="el-icon-question"></i>
          </span>
        </div>

        <i class="iconfont icontuichu logout" @click="logout"></i>
      </div>
    </header>
    <router-view :map="map" style="height:calc(100% - 92px)"></router-view>
    <footer v-show="$route.name!=='EventDetail'"></footer>
    <div class="map-box" :style="{zIndex:$route.name=='EventDetail'?'1':'-2'}">
      <div id="gaodeMap" :style="{zIndex:$route.name=='EventDetail'?'2':'-2'}"></div>
      <div class="shadow" v-show="$route.name!=='EventDetail'">
      
      </div>
      <div class="shadow2" v-show="$route.name=='EventDetail'">
          <div class="top"></div>
        <div class="right"></div>
        <div class="bottom"></div>
        <div class="left"></div>
      </div>
    </div>
    <el-dialog title="帮助中心" :visible.sync="showHelpCenter">
      <div class="help-item">
        <span>用户操作手册</span><a href="./doc/test.pdf"  download="test.pdf">下载</a>
      </div>
</el-dialog>
  </div>
</template>



<script>
/* eslint-disable */ 
// import {
//   // rtcInitSession,RtcSessionConfigKey,RtcLogLevel,
//   rtcGetSdkVersion} from '../assets/sdk/api/rtc'
import { getWeather } from "../api/api";
import AMap from "AMap";
export default {
  data() {
    return {
      nowTime: new Date(),
      nowWeather: "",
      bgPos: "",
      map: null,
      showHelpCenter:false
    };
  },
  beforeCreate() {
    if (!sessionStorage.getItem("isLogin") && !window.config.noLogin) {
      this.$router.push({ path: "/Login" });
    }
  },
  created(){
    //       console.log( rtcGetSdkVersion());
    // setTimeout(() => {
    //   console.log( rtcGetSdkVersion())
     
    // }, 5000);
      

   
  },
  beforeDestroy() {
    clearInterval(this.timer2);
  },

  mounted() {
        let _this = this; // 声明一个变量指向Vue实例this，保证作用域一致
    this.timer1 = setInterval(() => {
      _this.nowTime = new Date();
    }, 1000);
    this.updateWeather();
    this.timer2 = setInterval(
      _this.updateWeather,
      window.config.weatherUpdateTime
    );
    this.initGaodeMap();
  },
  watch:{
  $route(to){
    if(to.name!=='EventDetail'){
      // this.map.setCenter([105.397428, 35.90923]);
       this.map.setZoom(12);
          let markers = this.map.getAllOverlays("marker");
          let circle=this.map.getAllOverlays("circle");
        if (markers) {
          this.map.remove(markers);
        }
         if (circle) {
          this.map.remove(circle);
        }
    }
  }
},
  components: {},
  methods: {
    updateWeather() {
      getWeather().then(res => {
        if (res.ret == "ok") {
          let { day, night, content, temperature } = res.content;
          let nowHour = new Date().getHours(),
            imageIndex;
          if (nowHour >= 6 && nowHour < 18) {
            imageIndex = day.split(".")[0];
          } else {
            imageIndex = night.split(".")[0];
          }
          this.bgPos = `-${(parseInt(imageIndex) % 12) * 80}px -${Math.floor(
            parseInt(imageIndex) / 12
          ) * 80}px`;
          this.nowWeather =
            temperature.replace(/℃/g, "") + "度 " + content.split(" ")[1];
        }
      });
    },
    initGaodeMap() {
      // let _this = this;
      this.map = new AMap.Map("gaodeMap", {
        // center: [105.397428, 35.90923],
        mapStyle: "amap://styles/darkblue", //设置地图的显示样式
        resizeEnable: true,
        zoom: 12
      });
  
      console.log(this.map);
    },
    logout(){
      sessionStorage.removeItem("isLogin");
      localStorage.removeItem('smcHcUri');
      localStorage.removeItem('smcHcPwd');  
      this.$router.push('/Login');
    }
  }
};
</script>
<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  color: #fff;
  position: relative;
}
header {
  position: relative;
  padding: 0 10px;
  box-sizing: border-box;
  height: 92px;
  display: flex;
  justify-content: space-between;
  background: url("../assets/img/首页/标题背景.svg") no-repeat;
  background-size: contain;
  .left,
  .right {
    font-size: 20px;
    width: 315px;
  }
  .weather {
    width: 272px;
    height: 70px;
    padding-top: 6px;
    box-sizing: border-box;
    background: url("../assets/img/首页/天气背景.png") no-repeat;

    .img {
      margin-left: 20px;
      display: inline-block;
      width: 30px;
      height: 30px;
      background: url("../assets/img/blue.png") no-repeat;
    }
    .info {
      margin-left: 30px;
      display: inline-block;
      margin-top: 14px;
      transform: rotate(5deg);
    }
  }
  .title {
    margin-top: 36px;
    color: rgb(255, 179, 0);
    font-size: 36px;
  }
  .time {
    display: inline-block;
    box-sizing: border-box;
    width: 272px;
    height: 70px;
    box-sizing: border-box;
    background: url("../assets/img/首页/时间背景.png") no-repeat;
    .date-time {
      padding-top: 6px;
      display: inline-block;
      margin: 15px 15px 0 30px;
      transform: rotate(-5deg);
    }
    .question {
      display: inline-block;
      color: rgb(209, 229, 250);
      vertical-align: super;
      cursor: pointer;
    }
  }
  .logout {
    display: inline-block;
    margin-right: 20px;
    font-size: 20px;
    vertical-align: super;
    cursor: pointer;
    color: #30c7ff;
  }
}
footer {
  width: 100%;
  height: 92px;
  position: absolute;
  bottom: 0;
  background: url("../assets/img/首页/装饰.svg") no-repeat bottom;
  background-size: contain;
}
.map-box {
  z-index: -2;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  #gaodeMap {
    position: relative;
    z-index: -2;
    width: 100%;
    height: 100%;
  }
  .shadow {
    top: 0;
    left: 0;
    position: absolute;
    background-color: rgba($color: #000000, $alpha:.5);
    z-index: -1;
    width: 100%;
    height: 100%;
    box-shadow: black 0px 0px 60px 100px inset;

  }
  .shadow2{
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    &>div{
      position:absolute;
      z-index: 3;
    }
    .top{
      top:0;
      width: 100%;
      height: 150px;
     background-image: linear-gradient(black ,rgba(0, 0, 0, 0));
    }
    .right{
      right: 0;
      width: 380px;
      height: 100%;
     background-image: linear-gradient(to left,black ,rgba(0, 0, 0, 0));
    }
     .bottom{
      bottom: 0;
       width: 100%;
      height: 100px;
     background-image: linear-gradient(to top,black ,rgba(0, 0, 0, 0));
    }
     .left{
      left: 0;
        width: 380px;
      height: 100%;
     background-image: linear-gradient(to right,black ,rgba(0, 0, 0, 0));
    }
  }
}
.help-item{
  line-height: 40px;
  color:white;
  span{
      display: inline-block;
       width: 40%;
       text-align: right;
  }
  a{
    margin-left: 100px;
    color:#39BBFF;
  
  }
}

</style>