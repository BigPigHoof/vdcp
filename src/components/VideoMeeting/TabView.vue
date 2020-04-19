<!--  -->
<template>
  <div class="tab-wrapper">
    <div class="head">
      <div @click="toTab('left')" :class="{active:nowTab=='left'}" :style="{width:heads[1]?'50%':'100%'}">
        <span>{{heads[0]}}</span>
        <span v-if="totals">{{totals[0]?`(${totals[0]})`:''}}</span>
      </div>
      <div v-if="heads[1]" @click="toTab('right')" :class="{active:nowTab=='right'}">
        <span>{{heads[1]}}</span>
        <span v-if="totals">{{totals[1]?`(${totals[1]})`:''}}</span>
      </div>
    </div>
    <div class="content" :style="{left:left}">
      <div class="left">
           <slot name="left"></slot>
      </div>
      <div class="right" v-if="heads[1]">
          <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["heads", "totals"],
  data() {
    return {
      nowTab: "left",
      left: "0"
    };
  },

  components: {},
  methods: {
    toTab(tabName) {
      if (tabName == this.nowTab) return;
      if (tabName == "left") {
        this.left = 0;
      } else {
        this.left = "-100%";
      }
      this.nowTab = tabName;
    }
  }
};
</script>
<style lang="scss" scoped>
.tab-wrapper {
  width: 100%;
  overflow: hidden;
  .head {
    line-height: 30px;
    font-size: 22px;
    & > div {
      width: 50%;
      text-align: center;
      cursor: pointer;
      display: inline-block;
      color: #ffffff;
      &.active {
        color: #fabf36;
      }
    }
  }
  .content {
    width: 200%;
    position: relative;
    margin-top: 30px;
    display: flex;
    transition: left 0.5s;
    align-items: flex-start;
    & > div {
      width: 50%;
    }
  }
}
</style>