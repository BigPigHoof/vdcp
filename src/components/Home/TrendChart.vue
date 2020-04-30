<!--  -->
<template>
  <div class="trend-analysis">
    <div class="module-head">
      <h5 class="module-title">趋势分析</h5>
      <div class="change-box">
        <span :class="{choosed:dateArea=='yy'}" @click="getTrend('yy')">年统计</span>
        <span :class="{choosed:dateArea=='mm'}" @click="getTrend('mm')">月统计</span>
        <span :class="{choosed:dateArea=='iw'}" @click="getTrend('iw')">周统计</span>
      </div>
    </div>
    <el-row class="event-num">
      <el-col :span="12">
        <span>累计案件量：</span>
        <span>{{eventTotalNum}}</span>
      </el-col>
      <el-col :span="12">
        <span>新案件量：</span>
        <span>{{eventAddNum}}</span>
      </el-col>
    </el-row>
    <div class="chart-box">
      <div class="chart" :id="chartId"></div>
    </div>
  </div>
</template>

<script>
import {  getIncidentsAnalysis } from "../../api/api";
const option = {
  grid: {
    top: 10,
    left: "15%",
    right: "10%",
    bottom: 25
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "none",
      lineStyle: {
        color: "#5282ab"
      }
    }
  },
  xAxis: {
    type: "category",
    data: [],
    boundaryGap: false,
    axisLine: {
      show: true,
      lineStyle: {
        color: "#5282ab"
      }
    },
    axisLabel: {
      fontSize: 14,
      color: "#ffffff"
    },
    axisTick: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: "value",
    axisLine: {
      show: true,
      lineStyle: {
        color: "#5282ab"
      }
    },
    axisLabel: {
      showMaxLabel: true,
      fontSize: 14,
      color: "#ffffff"
    },
    axisTick: {
      show: false
    },
    splitLine: {
      show: false
    }
  },
  series: [
    {
      data: [],
      type: "line",
      smooth: true,
      itemStyle: {
        opacity: 0
      },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "rgba(27,219,207,0.40)" // 0% 处的颜色
            },
            {
              offset: 1,
              color: "rgba(35,222,209,0.00)" // 100% 处的颜色
            }
          ],
          global: false // 缺省为 false
        }
      },
      lineStyle: {
        width: 3,
        color: "#2FCBE9"
      }
    }
  ]
};
export default {
  props: ["chartId", "region"],
  data() {
    return {
        dateArea: "",
      eventTotalNum: null,
      eventAddNum: null,
      chart: null,
      option
    };
  },
  mounted() {
    this.$nextTick(()=>{
       this.chart = this.$echarts.init(document.getElementById(this.chartId));
        this.getTrend('iw');
    })
  },
  methods: {
    getTrend(dateArea) {
      this.dateArea = dateArea;
      this.chart.showLoading("default", {
        text: "loading",
        color: "#c23531",
        textColor: "#fff",
        maskColor: "rgba(255, 255, 255, 0)",
        zlevel: 0
      });
      getIncidentsAnalysis({ dateRange:dateArea, regionCode: this.region }).then(res => {
        this.chart.hideLoading();
        if (res.ret == "ok") {
          this.eventTotalNum = res.content.totalCount;
          this.eventAddNum = res.content.weekCount;
          this.option.series[0].data=res.content.list.map(item => item.dayCount);
          this.option.xAxis.data= res.content.list.map(item => dateArea == 'dd' ? item.dateTime : item.dateTime.substr(5));
          this.chart.setOption(this.option);
       }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.trend-analysis {
  margin-top: 5px;
  .change-box {
    font-size: 16px;
    color: #30c7ff;
    .choosed {
      color: #ffb300;
    }
    & > span {
      cursor: pointer;
    }
    & > span:nth-child(2) {
      margin: 0 20px;
    }
  }
  .event-num {
    margin: 12px 0;
    font-size: 14px;
    color: #f4f8ff;
  }
  .chart-box {
    width: 100%;
    height: 210px;
    .chart {
      width: 324px;
      height: 210px;
    }
  }
}
</style>
