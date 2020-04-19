<!--  -->
<template>
  <div v-if="model.id">
    <div class="menu-father">
      <div class="left" :class="{hasitem:isFolder}" @click="toggle">
        <span class="dot"></span>
        <span>{{ model.name}}</span>
      </div>
      <div class="right">
        <input
         class="check"
          type="checkbox"
          :style="{visibility:isVisible(model)}"
          :checked="checked(model)"
          @click="checkAll(model)"
        />
        <i
          class="iconfont iconbianji"
          style="font-size: 22px;position: relative;top: 3px;"
          @click="bus.$emit('openForm',model);"
        ></i>
        <span
          @click="toggle"
          class="expand"
          :style="{transform:open?'rotate(-180deg)':'',visibility:isFolder?'visible':'hidden'}"
        >▼</span>
      </div>
    </div>

    <el-collapse-transition>
      <div class="item" v-if="isFolder" v-show="open">
        <ul class="menu">
          <PlanList v-for="(item) in model.children" :model="item" :key="item.id"></PlanList>
        </ul>
        <ul class="site">
          <li v-for="item in model.sites" :key="item.uri">
            <div class="left">
              <span class="dot"></span>
              <!-- <span class="state" :class="getStatus(item)"></span> -->
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
              <i class="iconfont iconjiahao"  @click.stop="bus.$emit('openMeetingList', [item, $event])"></i>
            </div>
          </li>
        </ul>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import bus from "../../assets/js/bus";
export default {
  props: ["model",'meetingList'],
  name: "PlanList",
  data() {
    return {
      bus,

      open: false
    };
  },

  mounted() {},
  computed: {
    mainSiteInfo() {
      return this.$store.mainSite;
    },
    // 是否还有子列表需要渲染，作为v-if的判断条件
    isFolder() {
      return (
        (this.model.children && this.model.children.length) ||
        (this.model.sites && this.model.sites.length)
      );
    }
  },

  methods: {
    toggle() {
      if (this.isFolder) {
        this.open = !this.open;
      }
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
    },
    checked(data) {
      let arr = [];
      recursive(data, arr);
      return checkInclude(this.$store.state.selectedSites, arr)
        ? "checked"
        : false;
    },
    checkAll(data) {
      let arr = [];
      recursive(data, arr);
      let result = checkInclude(this.$store.state.selectedSites, arr);
      for (const item of arr) {
        let index = this.$store.state.selectedSites.findIndex(
          item2 => item2.uri == item.uri
        );
        if (result) {
          this.$store.state.selectedSites.splice(index, 1);
          if (item.uri == this.$store.state.mainSite.mainSiteUri) {
            this.$store.state.mainSite = {
              name: "",
              mainSiteUri: ""
            };
          }
        } else {
          if (index == -1) {
            this.$store.state.selectedSites.push(item);
          }
        }
      }
    },
    isVisible(data) {
      let arr = [];
      recursive(data, arr);
      return arr.length ? "" : "hidden";
    }
  }
};
const checkInclude = (aa, bb) => {
  for (const item of bb) {
    if (aa.findIndex(item2 => item2.uri == item.uri) == -1) {
      return false;
    }
  }
  return true;
};
const recursive = (data, arr) => {
  if (data.sites.length > 0) {
    for (const item of data.sites) {
      arr.push({ name: item.name, uri: item.uri });
    }
  }
  if (data.children.length > 0) {
    for (const item of data.children) {
      recursive(item, arr);
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
  .choosed {
    color: #36aeff;
  }
}
.dot {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-right: 10px;
  border-radius: 50%;
}
.menu-father {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  .dot {
    background: #f7b500;
  }
  .expand {
    transition: all 0.5s;
    font-size: 12px;
    cursor: pointer;
  }
  .iconbianji {
    cursor: pointer;
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
  .site {
    width: 100%;
    & > li {
      display: flex;
    }
    .dot {
      background: #1594f5;
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
  }
}

</style>