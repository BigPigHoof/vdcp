<!--  -->
<template>
  <div class="list-box">
    <ul
      class="list"
      :style="{ marginTop:top }"
      :class="{anim:isAnimate}"
      @mouseenter="stop"
      @mouseleave="start"
    >
      <li @click="goDetail(item.id)" class="item" v-for="(item) in listData" :key="item.id">
        <span :class="'level  l'+item.level">{{item.level?item.level+'级':''}}</span>
        <div class="info" :title="item.content">
          <div class="top">
            <span class="title ellipsis">{{item.title}}</span>
            <span class="circle"></span>
          </div>
          <div class="bottom">
            <span class="time">{{item.occurrTime}}</span>
            <span class="state">{{state[item.state]}}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ["listData"],
  data() {
    return {
      state: {
        "10": "接警",
        "20": "签收",
        "30": "到场",
        "40": "反馈",
        "90": "结束"
      },
      top: 0,
      isAnimate: false,
      timer: null
    };
  },

  mounted() {
    this.timer = setInterval(this.scroll, 2000);
  },
  methods: {
    goDetail(id) {
      this.$router.push({
        name: "EventDetail",
        params: {
          id: id
        }
      });
    },
    scroll() {
      if (this.listData.length > 6) {
        const that = this;
        this.top = "-77px";
        this.isAnimate = !this.isAnimate;
        setTimeout(function() {
          that.listData.push(that.listData[0]);
          that.listData.shift();
          that.top = "0px";
          that.isAnimate = !that.isAnimate;
        }, 500);
      }
    },

    stop() {
      clearInterval(this.timer);
    },
    start() {
      this.timer = setInterval(this.scroll, 2000);
    }
  }
};
</script>
<style lang="scss" scoped>
.list-box {
  width: 100%;
  height: 470px;
  overflow: hidden;

  .anim {
    transition: all 0.5s;
  }
  .item {
    width: 100%;
    height: 76px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #596d8d;
    cursor: pointer;
    transition: transform 1s;
  }

  .level {
    width: 40px;
    height: 40px;
    margin-right: 10px;

    line-height: 40px;
    border-radius: 50%;
    border: 3px solid;
    font-size: 18px;
    color: #ffffff;
    letter-spacing: 0.75px;
    text-align: center;
    &.l1 {
      background: #e13e3e;
      border-color: rgba(140, 70, 70, 0.7);
    }
    &.l2 {
      background: #ff7c25;
      border-color: rgba(136, 96, 69, 0.7);
    }
    &.l3 {
      background: #0091ff;
      border: 3px solid rgba(67, 104, 132, 0.7);
    }
    &.l4 {
      background: #71fd19;
      border: 3px solid rgba(91, 133, 65, 0.7);
    }
  }
  .info {
    width: calc(100% - 50px);
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        display: inline-block;
        width: 245px;
        text-indent: 1em;
        font-size: 16px;
        color: #ffffff;
        letter-spacing: 0.52px;
        line-height: 26px;
      }
      .circle {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: chocolate;
        border-radius: 50%;
      }
    }

    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .time {
        font-size: 14px;
        color: #d9d9d9;
        letter-spacing: 0.58px;
        line-height: 20px;
      }
      .state {
        padding: 0 4px;
        background: #e75252;
        border-radius: 4px;
        border-radius: 4px;
        font-size: 14px;
        color: #ffffff;
        letter-spacing: 0.58px;
        line-height: 20px;
      }
    }
  }
}
</style>