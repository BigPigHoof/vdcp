<!--  -->
<template>
  <div>
    <ul class="site">
      <li v-for="item in list" :key="item.id">
        <div class="left"  @dblclick="bus.$emit('openVideo',item.code)">
          <span class="state"></span>
          <span class="name ellipsis" :title="item.monitorName">{{item.monitorName}}</span>
        </div>
        <div class="right">
          <i class="iconfont iconjiahao" @click.stop="$emit('openMeetingList', [item, $event])"></i>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import bus from "../../assets/js/bus";
export default {
  props: ["list"],
  data() {
    return {
      bus
    };
  },

  components: {}
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
.site {
  width: 100%;
  & > li {
    display: flex;
    align-items: center;
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
</style>