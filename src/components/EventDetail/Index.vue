<!--  -->
<template>
  <div class="content">
    <div class="left top-z">
      <TabView :heads="['事件详情','事件动态']">
        <template v-slot:left>
          <div class="info-box">
            <h4 :title="eventData.title">{{eventData.title}}</h4>
            <p class="time">{{eventData.occurrTime}}</p>
            <div class="content-box">
              <p :title="eventData.content">{{eventData.content}}</p>
              <div class="btns">
                <span>监控预案</span>
                <span>指挥调度</span>
                <span>联动处置</span>
              </div>
            </div>
          </div>
          <div class="around-power">
            <h4 class="module-title">周边力量</h4>
            <div class="bar-chart" id="barChart"></div>
          </div>
        </template>
        <template v-slot:right>
          <div class="event-dynamics">
            <div class="move">
              <i disabled class="iconfont iconyidong-xiangshang" @click="upScroll"></i>
            </div>
            <ul class="dynamics-content">
              <li class="item" v-for="item in eventDynamicsData" :key="item.id">
                <span class="mid-dot"></span>
                <span class="small-dot"></span>
                <div class="info">
                  <p class="time">{{item.zlsj}}</p>
                  <p class="text">{{item.zlnr}}</p>
                </div>
              </li>
            </ul>
            <div class="move">
              <i class="iconfont iconyidong-xiangxia" @click="downScroll"></i>
            </div>
          </div>
        </template>
      </TabView>
    </div>
    <div class="mid">
      <Nav class="top-z"></Nav>
      <div class="choose-bar top-z">
        <span
          v-for="type in resourceTypes"
          :key="type"
          @click="getMarkers(type)"
          :style="getBG(type)"
        ></span>
      </div>
    </div>
    <div class="right top-z"></div>
      <transition name="el-fade-in-linear">
    <div class="pop-box" :style="popStyle" v-show="showPop">
     
          <i style="float:right;" class="el-icon-close" @click="showPop=false"></i>
     
       <div v-html = 'popHtml'></div>
    </div>
      </transition>
  </div>
</template>

<script>
import { upGo, downGo } from "../../assets/js/function";
import AMap from "AMap";
import Nav from "../Nav";
import TabView from "../VideoMeeting/TabView";
import {
  getWeekIncident,
  queryAroundResourceInfo,
  queryIncidentInfoTimeAxis,
  queryEmergencyResources
} from "../../api/api";

export default {
  props: ["map"],
  data() {
    return {
      resourceTypes: ["SXT", "ZDRY", "ZBJQ", "CZLL", "ZDDW", "BXCS"],
      eventData: {},
      eventDynamicsData: [],
      top: 0,
      timer: null,
      isScrolling: false,
      markers: [],
      showPop:false,
      popHtml:'',
     popStyle:{
       top:0,left:0
     }
    };
  },
  created() {
    getWeekIncident().then(res => {
      if (res.ret == "ok") {
        this.eventData = res.content.find(
          item => item.id == this.$route.params.id
        );
        let markers = this.map.getAllOverlays("marker");
        let circle = this.map.getAllOverlays("circle");
        let { longitude, latitude, id } = this.eventData;
        if (markers) {
          this.map.remove(markers);
        }
        if (circle) {
          this.map.remove(circle);
        }
        this.getAroundResource(longitude, latitude);
        this.getEventDynamics(id);
        this.map.setCenter([longitude, latitude]);
        drawCircle(longitude, latitude, this.map);
      }
    });
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  components: { Nav, TabView },
  methods: {
    getAroundResource(longitude, latitude) {
      let barChart = this.$echarts.init(document.getElementById("barChart"));
      let option = {
        grid: {
          top: 10,
          left: "30%",
          right: "20%",
          bottom: "25%"
        },
        xAxis: {
          show: false
        },
        yAxis: {
          type: "category",
          show: true,

          data: [],
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            fontSize: 16,
            margin: 40,
            color: "#A2D5FE"
          }
        },
        series: [
          {
            name: "item",
            type: "bar",
            data: [],
            barWidth: 20,
            barCategoryGap: 16,
            itemStyle: {
              color: function(params) {
                const colors = [
                  ["#7DFCD8", "#0BBEFD"],
                  ["#FFCC6C", "#FE9055"],
                  ["#FEA0A0", "#F2889F"]
                ];
                let color = [];
                if (params.data.value < 33) {
                  color = colors[2];
                } else if (params.data.value > 66) {
                  color = colors[1];
                } else {
                  color = colors[0];
                }
                return {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: color[0] // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: color[1] // 100% 处的颜色
                    }
                  ]
                };
              }
            },
            label: {
              show: true,
              color: "#373737",
              fontSize: 18,
              padding: [4, 0, 0, 0],
              position: "insideLeft",
              formatter: params => {
                let { avaid, total } = params.data;
                if (avaid == 0) {
                  return "0/" + total;
                } else {
                  return avaid + "/" + total;
                }
              }
            }
          },
          {
            name: "full",
            type: "bar",
            z: 1,
            barGap: "-100%",
            barCategoryGap: 16,
            data: [],
            barWidth: 20,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: "#C2E9FB " // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "#A1C4FD " // 100% 处的颜色
                  }
                ]
              }
            },
            label: {
              show: true,
              color: function(params) {
                const colors = ["#C7F599", "#B8BBBE", "#F896B1"];
                let { avaid, total } = params.data;
                if (total == 0) {
                  return colors[0];
                } else {
                  let percent = (avaid / total) * 100;
                  if (percent < 33) {
                    return colors[0];
                  } else if (percent > 66) {
                    return colors[2];
                  } else {
                    return colors[1];
                  }
                }
              },
              fontSize: 18,
              padding: [4, 0, 0, 0],
              position: "right",
              formatter: params => {
                let { avaid, total } = params.data;
                if (total == 0) {
                  return "0%";
                } else {
                  return (avaid / total) * 100 + "%";
                }
              }
            }
          }
        ]
      };
      barChart.showLoading("default", {
        text: "loading",
        color: "#c23531",
        textColor: "#fff",
        maskColor: "rgba(255, 255, 255, 0)",
        zlevel: 0
      });
      queryAroundResourceInfo({ longitude, latitude }).then(res => {
        barChart.hideLoading();
        if (res.ret == "ok") {
          let arr1 = [],
            arr2 = [],
            arr3 = [];
          const mapping = {
            armedPolice: "武警",
            expert: "专家",
            hospital: "医疗",
            fireEngine: "消防",
            otherResource: "其他",
            peoplePolice: "民警"
          };
          for (const item of res.content) {
            let { avaid, total } = item;
            let percent=total==0?0:avaid/total*100;
            const colors = ["#C7F599", "#B8BBBE", "#F896B1"];
            let color='#ffffff';
            if (percent < 33) {
              color= colors[2];
            } else if (percent > 66) {
              color=  colors[0];
            } else {
              color=  colors[1];
            }
                
            arr1.push(mapping[item.type]);
            arr2.push({ value:percent, ...item });
            arr3.push({ value: 100, 
            label:{
              color,
              fontSize: 18,
              padding: [4, 0, 0, 0],
              position: "right",
              formatter: () => {
                return Math.round(percent)+'%'
              }
            },
            ...item 
            });
          }
          option.yAxis.data = arr1;
          option.series[0].data = arr2;
          option.series[1].data = arr3;
          barChart.setOption(option);
        }
      });
    },
    getEventDynamics(incidentId) {
      queryIncidentInfoTimeAxis({ incidentId }).then(res => {
        if (res.ret == "ok") {
          this.eventDynamicsData = res.content;
          // for (let index = 0; index < 12; index++) {
          //   this.eventDynamicsData.push({
          //     id: index,
          //     zlnr:
          //       index +
          //       "冯惜:取证反馈吃饭复读机啊疯狂夺金发空间啊机构啊公交卡方擦范德萨回复大家扩散放到方法大三末打范德萨范德萨范德萨阿范德萨千万个如何框架吗银行卡教育关闭官方等同于官方晓得白官方统一不敢发发硫酸钠艰苦奋斗灰色空间啊附近的扩散返回键大傻逼啊",
          //     zlsj: "2020-03-13 08:31:58"
          //   });
          // }
          setTimeout(() => {
            const ul = document.querySelector(".dynamics-content");
            let { scrollHeight, clientHeight } = ul;
            if (scrollHeight > clientHeight) {
              this.timer = setInterval(this.scroll, 3000);
            }
          }, 500);
        }
      });
    },
    scroll() {
      const li = document.querySelector(".dynamics-content>.item");
      let top = li.offsetHeight;
      li.style.marginTop = -top + "px";
      this.isScrolling = true;
      setTimeout(() => {
        upGo(this.eventDynamicsData, 0);
        li.style.marginTop = 0;
        this.isScrolling = false;
      }, 500);
    },
    upScroll() {
      const ul = document.querySelector(".dynamics-content");
      let { scrollHeight, clientHeight } = ul;
      if (scrollHeight > clientHeight && !this.isScrolling) {
        clearInterval(this.timer);
        const li = document.querySelector(".dynamics-content>.item:last-child");
        let top = li.clientHeight;
        li.style.marginTop = -top + "px";
        downGo(this.eventDynamicsData, this.eventDynamicsData.length - 1);
        this.$nextTick(() => {
          setTimeout(() => {
            li.style.marginTop = 0;
            this.isScrolling = true;
            setTimeout(() => {
              this.isScrolling = false;
              this.timer = setInterval(this.scroll, 3000);
            }, 500);
          }, 0);
        });
      }
    },
    downScroll() {
      if (!this.isScrolling) {
        clearInterval(this.timer);
        this.scroll();
        this.timer = setInterval(this.scroll, 3000);
      }
    },
    getMarkers(type) {
      let that=this;
      queryEmergencyResources({ resourceType: type }).then(res => {
        if (res.ret == "ok") {
          this.map.remove(this.markers);
          this.markers = [];
          for (const item of res.content) {
            let url = require(`../../assets/img/首页/${type}.png`);
            let marker = new AMap.Marker({
              map: this.map,
              icon: new AMap.Icon({
                image: url,
                size: new AMap.Size(52, 52), //图标大小
                imageSize: new AMap.Size(26, 26)
              }),
              position: [
                type == "CZLL" ? item.jd : item.longitude,
                type == "CZLL" ? item.wd : item.latitude
              ]
            });
               //标记鼠标单机事件
                marker.on('click', function (e) {
                    console.log(e);
                    let html = '';
                    switch (type) {
                        case 'SXT':
                            html = `
                                <div>
                                <span>类型:</span><span>${item.cameraType}</span>
                            </div>
                            <div>
                                <span>名称:</span><span>${item.name}</span>
                            </div>
                            <div>
                                <span>地址:</span><span>${item.address}</span>
                            </div>`;
                            break;
                        case 'ZBJQ':

                            html = `<div>
                                    <span>标题:</span><span>${item.title}</span>
                                </div>
                                <div>
                                    <span>时间:</span><span>${item.caseTime.split('.')[0].replace('T', ' ')}</span>
                                </div>
                                <div>
                                    <span>地址:</span><span>${item.address}</span>
                                </div>`;
                            break;
                        case 'CZLL':
                            html = ` <div>
                                        <span>编号:</span><span id="bh">${item.bh}</span>
                                    </div>
                                        <div>
                                        <span>名称:</span><span id="mc">${item.mc}</span>
                                    </div>
                                            <div>
                                            <span>所属机构:</span><span>${item.ssjgmc}</span>
                                        </div>
                                        <div>
                                        <span>呼号:</span><span id="hh" xtzh="${item.xtzh}">${item.hjhm}</span>
                                    </div>
                                    <div>
                                        <span>联系方式:</span><span>${item.lxfs ? item.lxfs : ''}</span>
                                    </div>
                                    <div>
                                        <span>定位时间:</span><span>${item.dwsj}</span>
                                    </div>
                                        <div>
                                        <span>经度:</span><span>${item.jd}</span>
                                    </div>
                                        <div>
                                        <span>纬度:</span><span>${item.wd}</span>
                                    </div>
                                    <div class="btns">
                                    <span class="msg-btn">指令下达</span>  <span class="voice-btn">语音调度</span>  <span class="video-btn">视频调度</span>
                                </div>`;
                            break;
                        case 'ZDDW':
                            html = `<span class="iconfont icon-close"></span><div>
                                    <span>类型:</span><span>${item.type}</span>
                                </div>
                                <div>
                                    <span>名字:</span><span>${item.name}</span>
                                </div>
                                <div>
                                    <span>地址:</span><span>${item.address}</span>
                                </div>
                                <div>
                                    <span>手机号:</span><span>${item.phone}</span>
                                </div>`;
                            break;
                        case 'BXCS':
                            html = `<span class="iconfont icon-close"></span><div>
                                    <span>单位:</span><span>${item.unit}</span>
                                </div>
                                <div>
                                    <span>名字:</span><span>${item.name}</span>
                                </div>
                                <div>
                                    <span>地址:</span><span>${item.address}</span>
                                </div>
                                <div>
                                    <span>手机号:</span><span>${item.phone}</span>
                                </div>`;
                            break;
                    }

                   that.popHtml=html;
                   console.log(e.pixel);
                   that.popStyle={
                       'left': e.pixel.x+'px',
                         'bottom': 1080 - e.pixel.y + 30+'px'
                   }
                   that.showPop=true;
                });
            //标记双击事件
            marker.on("dblclick", function(e) {
              console.log(e, item.cameraCode);
              if (type != "SXT" || window.config.isSham) {
                return;
              }
              let code = item.code;
              if (code == null || code == undefined || code == "") {
                alert("此设备没有摄像头编码");
                return;
              }
            });
            this.markers.push(marker);
          }
        }
      });
    },
    getBG(type) {
      return {
        background: "url(" + require(`../../assets/img/首页/${type}.png`) + ")",
        backgroundSize: "contain"
      };
    }
  }
};
function drawCircle(Lng, Lat, map) {
  var marker = new AMap.Marker({
    position: new AMap.LngLat(Lng, Lat), // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
    title: "",
    // anchor:'center',
    // offset:new AMap.Pixel(-22, -60),
    icon: new AMap.Icon({
      image:
        "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
      size: new AMap.Size(44, 64), //图标大小
      imageSize: new AMap.Size(22, 32)
    })
  });
  // 将创建的点标记添加到已有的地图实例：
  map.add(marker);
  var circle = new AMap.Circle({
    center: [Lng, Lat],
    radius: 500, //半径
    fillOpacity: 0.4,
    fillColor: "#1791fc",
    strokeColor: "#2FBCF4",
    strokeWeight: 1,
    strokeStyle: "dashed",
    strokeDasharray: [4, 3]
  });
  circle.setMap(map);
  // 缩放地图到合适的视野级别
  map.setFitView([circle]);
}
</script>
<style lang="scss" scoped>
.top-z {
  position: relative;
  z-index: 4;
}
.content {
  display: flex;
  padding: 0 20px;
  box-sizing: border-box;
  .left,
  .right {
    width: 364px;
    height: 950px;
    padding: 34px 20px;
    box-sizing: border-box;
    background: url("../../assets/img/首页/左侧背景.png") no-repeat bottom;
    background-size: contain;
  }
  .right {
    background: url("../../assets/img/首页/右侧背景.png") no-repeat bottom;
  }
  .mid {
    flex-grow: 1;
    position: relative;
  }
}
.info-box {
  border-top: 1px solid #556988;
  border-bottom: 1px solid #556988;
  padding: 24px 0;

  .time {
    margin: 20px 0;
  }
  .content-box {
    display: flex;
    justify-content: space-between;
    & > p {
      margin-right: 15px;
      width: 240px;
      // max-height: 370px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 10;
      overflow: hidden;
    }
    .btns {
      width: 70px;
      font-size: 14px;
      text-align: center;
      & > span {
        width: 100%;
        line-height: 30px;
        display: block;
        margin-bottom: 30px;
        box-sizing: border-box;
        border: 3px solid;
        cursor: pointer;
        border-radius: 5px;
      }

      & > span:nth-child(1) {
        background: #0091ff;
        border-color: #004e89;
        &:hover {
          background-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.1),
            rgba(0, 0, 0, 0.1)
          );
        }
      }
      & > span:nth-child(2) {
        background: #72ba25;
        border-color: #29550a;
        &:hover {
          background-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.1),
            rgba(0, 0, 0, 0.1)
          );
        }
      }
      & > span:nth-child(3) {
        background: #55c26e;
        border-color: #2b6741;
        &:hover {
          background-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.1),
            rgba(0, 0, 0, 0.1)
          );
        }
      }
    }
  }
}
.around-power {
  padding: 20px 0;
  .bar-chart {
    width: 100%;
    height: 320px;
  }
}
.event-dynamics {
  height: 800px;
  .move {
    text-align: center;
    color: #0aa5f1;
    .iconfont {
      font-size: 20px;
    }
  }
  .dynamics-content {
    margin: 16px 0;
    height: 724px;
    transition: all 0.5s;
    overflow: hidden;
    .mid-dot {
      position: absolute;
      left: -10px;
      width: 18px;
      height: 18px;
      background: #2d99ff;
      border: 3px solid #154f80;
      border-radius: 50%;
      box-sizing: border-box;
    }
    .small-dot {
      position: absolute;
      left: -5px;
      top: 40px;
      width: 8px;
      height: 8px;
      background: #2d99ff;
      border-radius: 50%;
    }
    .item {
      position: relative;
      margin-left: 10px;
      padding-left: 24px;
      border-left: 2px solid #6685a9;
      &:first-child {
        transition: margin 0.5s;
      }

      .info {
        padding-bottom: 46px;
        .time {
          color: #57c1ff;
          position: relative;
          top: -4px;
          font-size: 18px;
          margin-bottom: 8px;
        }
        .text {
          font-size: 14px;
          color: #d0d1d2;
          //  display: -webkit-box;
          // -webkit-box-orient: vertical;
          // -webkit-line-clamp: 4;  //需要显示时文本行数
          // overflow: hidden;
        }
      }
    }
  }
}
.choose-bar {
  display: inline-block;
  right: 0;
  position: absolute;
  background: #000000e1;
  height: 36px;
  padding: 7px 10px;
  margin-top: 24px;
  margin-right: 10px;
  & > span {
    display: inline-block;
    width: 36px;
    height: 36px;
    margin-right: 24px;
    cursor: pointer;
    &:last-child {
      margin-right: 0;
    }
  }
}
.pop-box{
    padding: 16px 16px;
    z-index: 5;
    box-sizing: border-box;
    position: absolute;
    background-image: linear-gradient(to right, #234672, #000000);
    border: 1px #6388b6 solid;
    border-radius: 3px;
    transform: translateX(-50%);
.el-icon-close{
  position: absolute;
  top: 2px;
  right: 2px;
}
}
</style>