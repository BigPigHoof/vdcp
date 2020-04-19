<!--  -->
<template>
  <div v-if="model.orgId">
    <div class="menu-name" :class="{hasitem:isFolder}" @click="toggle">
      <div class="left">
        <span class="dot"></span>
        <span>{{ model.orgName}}</span>
      </div>
      <div class="right">
        <span v-if="isFolder" class="expand" :style="{transform:open?'rotate(-180deg)':''}">▼</span>
      </div>
    </div>

    <el-collapse-transition>
      <div class="item" v-if="isFolder" v-show="open">
        <ul class="menu" v-if="model.orgChildren.length">
          <SiteList v-for="(item) in model.orgChildren" :model="item" :key="item.orgId"></SiteList>
        </ul>
        <SiteChildren :list="model.siteChiidren"></SiteChildren>
        <!-- <ul class="site">
          <li v-for="item in model.siteChiidren" :key="item.uri">
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
        </ul> -->
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import bus from "../../assets/js/bus";
import SiteChildren from "./SiteChildren";
export default {
  props: ["model", "meetingList"],
  name: "SiteList",
  data() {
    return {
      bus,
      open: false,
      show: false
    };
  },
    components: {SiteChildren},
  computed: {

    // 是否还有子列表需要渲染，作为v-if的判断条件
    isFolder() {
      return (
        (this.model.orgChildren && this.model.orgChildren.length) ||
        (this.model.siteChiidren && this.model.siteChiidren.length)
      );
    }
  },

  methods: {
    // 切换列表显示隐藏的方法
    toggle() {
      if (this.isFolder) {
        this.open = !this.open;
      }
    },
    // getStatus(item) {
    //   let stateClass = "";
    //   if (
    //     item.deviceStatus.liveStatus.value != "DeviceStatus_Ok" &&
    //     item.deviceStatus.sipStatus.value != "DeviceStatus_Ok"
    //   ) {
    //     stateClass = "outline";
    //     // outlineSitesUri.push(item.uri);
    //   }
    //   if (
    //     (item.deviceStatus.liveStatus.value == "DeviceStatus_Ok" ||
    //       item.deviceStatus.sipStatus.value == "DeviceStatus_Ok") &&
    //     item.deviceStatus.callStatus.value == "DeviceStatus_Ok"
    //   ) {
    //     stateClass = "join";
    //   }
    //   if (
    //     (item.deviceStatus.liveStatus.value == "DeviceStatus_Ok" ||
    //       item.deviceStatus.sipStatus.value == "DeviceStatus_Ok") &&
    //     item.deviceStatus.callStatus.value != "DeviceStatus_Ok"
    //   ) {
    //     stateClass = "unjoin";
    //   }
    //   return stateClass;
    // },
    // choose(item) {
    //   console.log("click");
    //   item.checked = !item.checked;
    // },
    // setMainSite(item) {
    //   this.$store.state.mainSite.mainSiteUri = item.uri;
    //   this.$store.state.mainSite.name = item.name;
    //   if (this.$store.state.selectedSites.indexOf(item) == -1)
    //     this.$store.state.selectedSites.push(item);
    // },
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
.menu-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  .right {
    justify-content: flex-end;
  }
  .dot {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-right: 10px;
    border-radius: 50%;
    background: #9570e5;
  }
  .expand {
    transition: all 0.5s;
    font-size: 12px;
  }
}
.hasitem {
  cursor: pointer;
}
.item {
  width: 100%;
  padding-left: 20px;
  box-sizing: border-box;
  transition: all 0.5s;
  li,
  .menu {
    padding: 10px 0;
  }
  // .site {
  //   width: 100%;
  //   & > li {
  //     display: flex;
  //   }

  //   .state {
  //     width: 16px;
  //     height: 16px;
  //     flex-shrink: 0;
  //     margin-right: 10px;
  //     border-radius: 50%;
  //     background: burlywood;
  //     &.outline {
  //       background: rgb(155, 155, 155);
  //     }
  //     &.join {
  //       background: rgb(238, 62, 62);
  //     }
  //     &.unjoin {
  //       background: rgb(32, 224, 64);
  //     }
  //   }

  //   .choosed {
  //     color: #36aeff;
  //   }
  // }
}
</style>