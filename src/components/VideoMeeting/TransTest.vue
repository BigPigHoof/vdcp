<!--  -->
<template>
  <div>
    <transition-group
      class="list"
      name="list-complete"
      tag="ul"
  
    >
      <li class="list-complete-item" v-for="item in list" :key="item">{{item}}</li>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    const createList = num => {
      let arr = [];
      for (let i = 0; i < num; i++) {
        let str = "";
        for (let index = 0; index < 10; index++) {
          str += i + "";
        }
        arr.push(str);
      }
      return arr;
    };
    return {
      timer: null,
      list: createList(10),
  
    };
  },
  mounted() {
    this.timer = setInterval(this.scroll, 3000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    scroll() {
      var str = this.list.shift();

      setTimeout(() => {
           this.list.push(str);
      }, 500);
    },

  }
};
</script>
<style lang="scss" scoped>
.list {
  position: relative;
  height: 80px;
  overflow: hidden;
  li {
    height: 30px;
  }
}
.list-complete-item {
  transition: all 1s;
}
.list-complete-enter {
  opacity: 0;
}
.list-complete-leave-to {
  opacity: 0;
  transform: translateY(-30px);
  // margin-top: -30px;
}
.list-complete-leave-active {
  position: absolute;
}
</style>