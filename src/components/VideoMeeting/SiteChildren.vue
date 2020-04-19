<!--  -->
<template>
  <div>
    <ul class="site">
      <li v-for="item in list" :key="item.uri">
        <div class="left">
          <span class="state" :class="getStatus(item)"></span>
          <span class="name ellipsis" :title="item.name">{{item.name}}</span>
        </div>
        <div class="right">
          <input
            class="check"
            type="checkbox"
            v-model="$store.state.selectedSites"
            :value="{name:item.name,uri:item.uri}"
            :uri="item.uri"
            @change="bus.$emit('checkChange',[$event,item.uri]);"
          />
          <i
            class="iconfont iconhuichang"
            :class="{choosed:$store.state.mainSite.mainSiteUri==item.uri}"
            @click="setMainSite({name:item.name,uri:item.uri})"
          ></i>
          <i class="iconfont iconjiahao" @click.stop="bus.$emit('openMeetingList', [item, $event])"></i>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import bus from "../../assets/js/bus";
export default {
    props:['list'],
  data() {
    return {
      bus
    };
  },

  components: {},
  methods: {
    getStatus(item) {
      let stateClass = "";
      if (
        item.deviceStatus.liveStatus.value != "DeviceStatus_Ok" &&
        item.deviceStatus.sipStatus.value != "DeviceStatus_Ok"
      ) {
        stateClass = "outline";
        // outlineSitesUri.push(item.uri);
      }
      if (
        (item.deviceStatus.liveStatus.value == "DeviceStatus_Ok" ||
          item.deviceStatus.sipStatus.value == "DeviceStatus_Ok") &&
        item.deviceStatus.callStatus.value == "DeviceStatus_Ok"
      ) {
        stateClass = "join";
      }
      if (
        (item.deviceStatus.liveStatus.value == "DeviceStatus_Ok" ||
          item.deviceStatus.sipStatus.value == "DeviceStatus_Ok") &&
        item.deviceStatus.callStatus.value != "DeviceStatus_Ok"
      ) {
        stateClass = "unjoin";
      }
      return stateClass;
    },
    choose(item) {
      console.log("click");
      item.checked = !item.checked;
    },
    setMainSite(item) {
      this.$store.state.mainSite.mainSiteUri = item.uri;
      this.$store.state.mainSite.name = item.name;
      if (this.$store.state.selectedSites.indexOf(item) == -1)
        this.$store.state.selectedSites.push(item);
    }
  }
};
</script>
<style lang="scss" scoped>
.left {
  display: flex;
  align-items: center;
  width: calc(100% - 130px);
}
.right {
  padding: 0 20px;
  box-sizing: border-box;
  flex-shrink: 0;
  align-items: center;
  display: flex;
  width: 130px;
  justify-content: space-between;
}
.site {
  width: 100%;
  & > li {
    display: flex;
    padding: 10px 0;
  }

  .state {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-right: 10px;
    border-radius: 50%;
    background: burlywood;
    &.outline {
      background: rgb(155, 155, 155);
    }
    &.join {
      background: rgb(238, 62, 62);
    }
    &.unjoin {
      background: rgb(32, 224, 64);
    }
  }

  .choosed {
    color: #36aeff;
  }
}
</style>