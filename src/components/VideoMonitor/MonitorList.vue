<!--  -->
<template>
  <div v-if="model.id">
    <div class="menu-name" :class="{hasitem:isFolder}" @click="toggle">
      <div class="left">
        <span class="dot"></span>
        <span class="ellipsis">{{ model.name}}</span>
      </div>
      <div class="right">
        <span v-if="isFolder" class="expand" :style="{transform:open?'rotate(-180deg)':''}">▼</span>
      </div>
    </div>

    <el-collapse-transition>
      <div class="item" v-if="isFolder" v-show="open">
        <ul class="menu" v-if="model.children.length">
          <MonitorList v-for="(item) in model.children" :model="item" :key="item.id"></MonitorList>
        </ul>
        <MonitorChildren :list="model.monitors" @openMeetingList="openList"></MonitorChildren>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import bus from "../../assets/js/bus";
import MonitorChildren from "./MonitorChildren";
export default {
  props: ["model", "meetingList"],
  name: "MonitorList",
  data() {
    return {
      bus,
      open: false,
      show: false
    };
  },
  components:{MonitorChildren},
  computed: {
    mainSiteInfo() {
      return this.$store.mainSite;
    },
    // 是否还有子列表需要渲染，作为v-if的判断条件

    isFolder() {
      return (
        (this.model.children && this.model.children.length) ||
        (this.model.monitors && this.model.monitors.length)
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
    openList(params){
       this.$emit('openMeetingList',params);
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
justify-content: flex-end;
}
.menu-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;

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
}
</style>