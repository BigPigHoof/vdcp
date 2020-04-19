<!--  -->
<template>
  <div class="map">
    <div id="miniMap"></div>
    <div id="pickerBox" v-show="showAMapUI">
      <input v-model="searchName" id="pickerInput" />
      <div id="poiInfo"></div>
    </div>
  </div>
</template>

<script>
import AMap from "AMap";
import AMapUI from "AMapUI";
export default {
  props: ["address"],
  data() {
    return {
      miniMap: null,
      AMapUI: null,
      showAMapUI: false,
      poiPicker: null,
      searchName: ""
    };
  },
  mounted(){
      this.initMiniMap();
  },
  methods: {
    initMiniMap() {
      this.miniMap = new AMap.Map("miniMap", {
        mapStyle: "amap://styles/darkblue", //设置地图的显示样式
        resizeEnable: true,
        zoom: 10
      });
      this.initAMapUI();
      console.log(this.miniMap);
    },
    initAMapUI() {
      const map = this.miniMap;
      const that = this;
      AMapUI.loadUI(["misc/PoiPicker"], function(PoiPicker) {
        that.poiPicker = new PoiPicker({
          input: "pickerInput"
        });
        var marker = new AMap.Marker();
        that.poiPicker.on("poiPicked", function(poiResult) {
          var poi = poiResult.item;
          marker.setMap(map);
          marker.setPosition(poi.location);
          map.setCenter(poi.location);
          that.$emit("getPosition", [poi.location.lng, poi.location.lat]);
        });
      });
    },
    searchAddress() {
      if (this.address) {
        const address = this.address;
        this.searchName = address;
        this.poiPicker.suggest(address);
        this.showAMapUI = true;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.map {
  width: 100%;
  height: 700px;
  position: relative;
  background: rgba(6, 15, 21, 0.62);
  border: 1px solid #adccdd;
  #miniMap {
    width: 100%;
    height: 100%;
  }
  #pickerBox {
    position: absolute;
    z-index: 9999;
    top: 50px;
    left: 20px;
    width: 300px;
  }

  #pickerInput {
    width: 200px;
    padding: 5px 5px;
  }
}
</style>