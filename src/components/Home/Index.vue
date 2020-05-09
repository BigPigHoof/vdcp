<!--  -->
<template>
  <div class="content">
    <div class="left">
      <div class="week-event">
        <div class="module-head">
          <h5 class="module-title">当前案件</h5>
          <i class="iconfont iconxinzengshijianchuzhi" @click="showAddEvent=true"></i>
        </div>
        <el-input class="search-input" v-model="searchValue">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="searchEvent"></i>
        </el-input>
        <EventList id="eventList" :listData="weekEventData"></EventList>
      </div>
      <TrendChart :region="regionCode" chartId="trend1"></TrendChart>
    </div>
    <div class="mid">
      <Nav></Nav>
      <div class="map-box">
        <Map></Map>
      </div>
      <div class="statistics-box">
        <div>
          <h5 class="title">雪亮工程</h5>
          <div class="num">{{monitorInfo.XLGC}}</div>
        </div>
        <div>
          <h5 class="title">天网工程</h5>
          <div class="num">{{monitorInfo.TWGC}}</div>
        </div>
        <div>
          <h5 class="title">监所监控</h5>
          <div class="num">{{monitorInfo.JSJK}}</div>
        </div>
        <div>
          <h5 class="title">科技法庭</h5>
          <div class="num">{{monitorInfo.KJFT}}</div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="resource">
        <div class="module-head">
          <h5 class="module-title">应急资源</h5>
        </div>
        <div class="bar-chart" id="barChart"></div>
      </div>
      <div class="video-monitor">
        <div class="module-head">
          <h5 class="module-title">视频监控</h5>
          <span class="focus">重点预案</span>
        </div>

        <div class="video-box">
          <div :id="'vframe_'+index" v-for="(num,index) in 4" :key="num">
            <video autoplay playsinline :id="'video_'+index"></video>
          </div>
        </div>
      </div>
    </div>
    <AddEvent :dialogFormVisible.sync="showAddEvent" @refresh="getWeekEvent"></AddEvent>
  </div>
</template>

<script>
import Nav from "../Nav";
import Map from "./Map";
import EventList from "./EventList";
import AddEvent from "./AddEvent";
import TrendChart from "./TrendChart";
import {
  getWeekIncident,
  queryMonitorSortInfo,
  queryEmergencyResourcesInfo,
  querySpecialAttentionMonitors
} from "../../api/api";
const resourceTypes = {
  unit: "应急单位",
  expert: "应急专家",
  vehicle: "应急车辆",
  warehouse: "应急仓库",
  supplies: "应急物资",
  mobileTerminal: "移动终端",
  singleTransmission: "单兵图传"
};
export default {
  data() {
    return {
      searchValue: "",
      allweekEventData: [],
      weekEventData: [],
      monitorInfo: {
        JSJK: null,
        TWGC: null,
        XLGC: null,
        KJFT: null
      },
      showAddEvent: false,
      regionCode: window.config.regionCode
    };
  },

  components: { Nav, Map, EventList, TrendChart, AddEvent },
  mounted() {
    this.getWeekEvent();
    this.initBarChart();
    this.getAttentionMonitors();
    queryMonitorSortInfo().then(res => {
      if (res.ret == "ok") {
        this.monitorInfo = res.content;
      }
    });
  },
  methods: {
    getWeekEvent() {
      const loading = this.$loading({
        target: document.querySelector("#eventList"),
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0)"
      });
      getWeekIncident().then(res => {
        loading.close();
        if (res.ret == "ok") {
          this.allweekEventData = res.content;
          this.weekEventData = res.content;
        }
      });
    },
    searchEvent() {
      if (this.searchValue) {
        this.weekEventData = this.allweekEventData.filter(
          item => item.title.indexOf(this.searchValue) > -1
        );
        console.log(this.weekEventData);
      } else {
        this.weekEventData = this.allweekEventData;
      }
    },
    initBarChart() {
      let barChart = this.$echarts.init(document.getElementById("barChart"));
      let option = {
        grid: {
          top: 10,
          left: 140,
          right: "10%",
          bottom: 10
        },
        xAxis: {
          show: false
        },
        yAxis: {
          type: "category",
          show: true,
          inverse: true,
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
            fontSize: 18,
            margin: 24,
            color: "#A3D6FF"
          }
        },
        series: [
          {
            name: "item",
            type: "bar",
            data: [],
            barWidth: 38,
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
              padding: [4, 0, 0, 10],
              position: "insideLeft",
              formatter: params => {
                // if (params.data.availableCount) {
                return (
                  params.data.availableCount + "/" + params.data.totalCount
                );
                // }
              }
            }
          },
          {
            name: "full",
            type: "bar",
            z: 1,
            barGap: "-100%",
            data: [],
            barWidth: 38,
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
      queryEmergencyResourcesInfo().then(res => {
        barChart.hideLoading();
        if (res.ret == "ok") {
          let resdata = [],
            fullData = [];
          for (const item of res.content) {
            resdata = resdata.concat(item);
          }
          for (let i = 0; i < res.content.length; i++) {
            fullData.push(100);
          }
          option.yAxis.data = resdata.map(
            item => resourceTypes[item.resourceType]
          );
          option.series[0].data = resdata.map(item => {
            const { availableCount, totalCount } = item.resourceCount;
            return {
              value: (availableCount / totalCount) * 100,
              availableCount,
              totalCount
            };
          });
          option.series[1].data = fullData;
          barChart.setOption(option);
        }
      });
    },
    getAttentionMonitors() {
      querySpecialAttentionMonitors().then(res => {
        if (res.ret == "ok" && this.$store.state.isConnecting) {
          let monitors = [];
          const filterMonitors = data => {
            if (monitors.length > 4) {
              return;
            }
            if (data.monitors.length > 0) {
              monitors = monitors.concat(data.monitors);
            }
            if (data.children.length > 0) {
              filterMonitors(data.children);
            }
          };
          filterMonitors(res.content);
          monitors.forEach((item, index) => {
            this.playVideo(index, item.code);
          });
        }
      });
    },
    playVideo(index, code) {
      /* eslint-disable */

      let mediaQuality = window.mediaQuality;
      let loading = this.$loading({
        target: document.querySelector("#vframe_" + index),
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0)",
        fullscreen: false
      });
      let chCallback = function(handler, event) {
        switch (event.EventID) {
          case RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_INCOMING:
            {
              let streamObj = event["EventObj"];
              rtcAttachStream(
                document.querySelector("#video_" + index),
                streamObj
              );
              loading.close();
            }
            break;

          case RtcCamEventID.RTC_CHANNEL_REMOTE_CONNECT_FAIL:
            if (event.EventObj !== undefined) {
              console.log(userName + ": 未接通");
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_DISCONNECT:
            if (event.EventObj !== undefined) {
              console.log(userName + ": 已退出");
            }
            break;
        }
      };
      rtcCamOpenStream(
        "0" + code,
        RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO,
        { mediaQuality },
        chCallback
      );
    }
  }
};
</script>
<style lang="scss" scoped>
.content {
  display: flex;
  padding: 0 20px;
  box-sizing: border-box;
  & > .left,
  & > .right {
    width: 364px;
    height: 950px;
    padding: 34px 20px;
    box-sizing: border-box;
    background: url("../../assets/img/首页/左侧背景.png") no-repeat bottom;
    background-size: contain;
  }
  & > .right {
    background: url("../../assets/img/首页/右侧背景.png") no-repeat bottom;
  }
  .mid {
    flex-grow: 1;
  }
}
.map-box {
  width: 100%;
  height: 740px;
}
.week-event {
  width: 100%;
  .module-head {
    justify-content: flex-start;
    .module-title {
      margin-right: 10px;
    }
    .iconxinzengshijianchuzhi {
      color: #ff7c25;
      cursor: pointer;
    }
  }
}
.statistics-box {
  width: 100%;
  display: flex;
  justify-content: center;
  & > div {
    width: 188px;
    height: 106px;
    margin: 0 25px;
    background: url("../../assets/img/首页/地图弹出小框.svg") no-repeat center
      top;
    background-size: contain;
  }
  .title {
    width: 104px;
    margin-left: 8px;
    line-height: 44px;
    font-size: 18px;
    color: #f4f8ff;
    text-align: center;
  }
  .num {
    font-size: 36px;
    color: #57f9ec;
    text-align: center;
    line-height: 60px;
  }
}
.resource {
  .bar-chart {
    width: 100%;
    height: 440px;
  }
}
.video-monitor {
  .focus {
    font-size: 22px;
    color: #ffc236;
  }
  .video-box {
    display: flex;
    width: 100%;
    margin-top: 28px;
    flex-wrap: wrap;
    height: 240px;
    box-sizing: border-box;
    align-content: space-between;
    & > div {
      width: 48%;
      height: 118px;
      overflow: hidden;
      margin-bottom: 15px;
      &:nth-child(odd) {
        margin-right: 4%;
      }
      & > video {
        width: 100%;
        height: 100%;
        object-fit: fill;
      }
    }
  }
}
</style>