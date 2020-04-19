<!--  -->
<template>
  <div>
    <div class="top">
      <Nav></Nav>
    </div>
    <div class="main">
      <div class="side-bar">
        <router-link
          class="item"
          v-for="item in menu"
          :key="item.name"
          :to="item.name"
          :class="{active:$route.name===item.name}"
        >
          <div></div>
          <span>{{item.title}}</span>
        </router-link>
      </div>
      <router-view class="main-content"></router-view>
    </div>
  </div>
</template>

<script>
import { resourceChildren } from "../../router";
import Nav from "../Nav";
export default {
  data() {
    return {
      menu: resourceChildren
    };
  },

  components: { Nav }
};
</script>
<style lang="scss" >
$bgnames: "单位", "专家", "仓库", "物资", "车辆", "移动终端", "单兵图传";
@mixin bg($url) {
  background: url($url) no-repeat;
  background-size: contain;
}

.main {
  margin-top: 40px;
  display: flex;
  align-items: flex-start;
  .side-bar {
    width: 140px;
    text-align: center;
    position: relative;
    padding: 46px 0;
    background: linear-gradient(
      to right,
      rgb(1, 9, 13),
      rgba(20, 62, 95, 0.993)
    );
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
    //  border-image: linear-gradient(to right,rgba(26, 150, 216, 0), #1a96d8 ) 1 1;
    &::after {
      position: absolute;
      top: -2px;
      bottom: -2px;
      left: 0;
      right: -2px;
      background: linear-gradient(to right, rgba(26, 150, 216, 0), #1a96d8);
      content: "";
      z-index: -1;
      border-top-right-radius: 30px;
      border-bottom-right-radius: 30px;
    }

    .item {
      display: block;
      line-height: 35px;
      color: #fff;
      margin-bottom: 30px;
      @each $name in $bgnames {
        $i: index($bgnames, $name);
        &:nth-child(#{$i}) {
          & > div {
            margin: 0 auto;
            width: 38px;
            height: 38px;
            @include bg("../../assets/img/资源管理/#{$name}.png");
          }
          &.active > div,
          &:hover > div {
            @include bg("../../assets/img/资源管理/#{$name}_yellow.png");
          }
          &:hover {
            color: rgba(255, 179, 0, 0.904);
          }
          &.active {
            color: #f7bb00;
          }
        }
      }
    }
  }
  .main-content {
    padding: 0 44px;
    width: calc(100% - 140px);
    height: 850px;
    box-sizing: border-box;
  }
}
.search-bar {
  label {
    display: inline-block;
    width: 140px;
    text-align: right;
  }
  .el-input,
  .el-cascader,
  .el-autocomplete,
  .el-select {
    width: 250px;
  }
}
.option {
  color: #30c7ff;
  margin-right: 20px;
  cursor: pointer;
}
.form-box {
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
  .half {
  display: inline-block;
  width: 50%;
}
  .el-input,
  .el-cascader,
  .el-select {
    width: 100%;
  }
}

</style>