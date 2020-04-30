<!--  -->
<template>
  <div class="map-content">
    <div class="map" id="map"></div>
    <div class="trend-box" :style="{left,top}" v-show="showTrend">
      <h5 class="title ellipsis">{{regionArea}}</h5>
      <div class="trend-content">
        <TrendChart :region="regionCode" chartId="trend2" ref="trend"></TrendChart>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from "../../api/http";
import TrendChart from "./TrendChart";
// import MapData from `../../../public/map/${window.config.mapName}.json`
const mapOption = {
  grid: {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
  },
  visualMap: {
    min: 0,
    left: 26,
    bottom: 40,
    showLabel: !0,
    pieces: [
      {
        gt: 100,
        label: "> 100 人",
        color: "#7f1100"
      },
      {
        gte: 10,
        lte: 100,
        label: "10 - 100 人",
        color: "#ff5428"
      },
      {
        gte: 1,
        lt: 10,
        label: "1 - 9 人",
        color: "#ff8c71"
      },
      {
        gt: 0,
        lt: 1,
        label: "疑似",
        color: "#ffd768"
      },
      {
        value: 0,
        color: "#ffffff"
      }
    ],
    show: false
  },
  geo: {
    show: false,
    map: window.config.mapName,
    zoom: 1.2,
    aspectScale: 1
  },
  series: [
    {
      name: "散点",
      type: "scatter",
      coordinateSystem: "geo",
      data: [],
      symbolSize: 10,
      label: {
        normal: {
          formatter: "{b}",
          position: "right",
          show: false
        },
        emphasis: {
          show: true
        }
      },
      itemStyle: {
        normal: {
          color: "#fff"
        }
      }
    },
    {
      type: "map",
      map: window.config.mapName,
      zoom: 1.2,
      aspectScale: 1,
      // left:'10%',
      data: [
       
      ],
      label: {
        show: true,
        color: "#B6CFF9"
      },
      itemStyle: {
        borderColor: "#32C5FF",
        borderWidth: 1,
        areaColor: "rgba(5,123,169,0.18)"
      },
      emphasis: {
        label: {
          show: true,
          color: "#B6CFF9"
        },
        itemStyle: {
          areaColor: "rgba(5,123,169,0.5)"
        }
      }
    }
  ]
};
export default {
  data() {
    return {
      mapChart: null,
      mapOption,
      mapName: window.config.mapName,
      regionArea: "",
      regionCode:'',
      showTrend: false,
      left: 0,
      top: 0
    };
  },
  mounted() {
    this.initMap();
  },
  components: { TrendChart },
  methods: {
    initMap() {
      const that = this;
      this.mapChart = this.$echarts.init(document.getElementById("map"));
      this.mapChart.showLoading("default", {
        text: "loading",
        color: "#c23531",
        textColor: "#fff",
        maskColor: "rgba(255, 255, 255, 0)",
        zlevel: 0
      });
      this.mapChart.on("click", function(params) {
        console.log(params);
        if (params.componentSubType == "scatter") {
          return;
        }

        let {
          event: { offsetX, offsetY }
        } = params;
        let pos=that.mapChart.convertFromPixel('geo', [offsetX,offsetY]);
        let parameters={
          key:'1ebd4abbc27a1411331a30ae13570a11',
          location:pos.join(',')
        }
        get('https://restapi.amap.com/v3/geocode/regeo',parameters).then(res=>{
          console.log(res)
        })
        that.regionCode=params.data.adCode;
         that.regionArea=params.name;
        that.left = offsetX - 180 + "px";
        that.top = offsetY < 340 ? offsetY + 20 + "px" : offsetY - 350 + "px";
        that.$refs.trend.getTrend(that.$refs.trend.dateArea);
        that.showTrend = true;
      });
      this.mapChart.getZr().on("click", () => {
        if (this.showTrend) {
          this.showTrend = false;
        }
      });
      // let jsonData = require(`../../../public/map/${this.mapName}.json`);
      // this.mapChart.hideLoading();
      //   this.$echarts.registerMap(this.mapName, jsonData);
      //   this.mapChart.setOption(this.mapOption);
      get(`./map/${this.mapName}.json`).then(jsonData => {
        console.log(jsonData);
        this.mapOption.series[1].data=jsonData.features.map(item=>({
          name:item.properties.name,
          adCode:item.properties.adcode,
          parentCode:item.properties.parent.adcode
        }))
        this.mapChart.hideLoading();
        this.$echarts.registerMap(this.mapName, jsonData);
        this.mapChart.setOption(this.mapOption);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.map-content {
  width: 100%;
  height: 100%;
  position: relative;
  .map {
    width: 100%;
    height: 100%;
  }
  .trend-box {
    width: 360px;
    height: 340px;
    position: absolute;
    background: url("../../assets/img/首页/地图弹出.svg") no-repeat center top;
    background-size: contain;
    .title {
      width: 104px;
      height: 44px;
      margin-left: 8px;
      line-height: 44px;
      font-size: 18px;
      color: #f4f8ff;
      text-align: center;
    }
    .trend-content {
      width: 100%;

      box-sizing: border-box;

      padding: 0 20px;
    }
  }
}
</style>