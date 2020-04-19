<!--  -->
<template>
  <div class="content">
    <div class="top">
      <Nav></Nav>
    </div>
    <div class="main">
      <div class="side-bar">
        <router-link to="CommandAgency"  class="command-agency" :class="{active:$route.name==='CommandAgency'}">
          <div></div>
          <span>指挥机构</span>
        </router-link>
        <router-link to="PersonnelManagement" class="personnel-management" :class="{active:$route.name==='PersonnelManagement'}">
          <div></div>
          <span>人员管理</span>
        </router-link>
        <router-link to="ChangePassword"  class="change-password" :class="{active:$route.name==='ChangePassword'}">
          <div></div>
          <span>修改密码</span>
        </router-link>
      </div>
      <router-view class="main-content"></router-view>
    </div>
  </div>
</template>

<script>
import Nav from "../Nav";
export default {
  data() {
    return {};
  },

  components: { Nav }
};
</script>
<style lang="scss" scoped>
@mixin bg($url) {
  background: url($url) no-repeat;
  background-size: contain;
}
.content {
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
      .active {
        color: #f7bb00;
        text-shadow: 0 2px 4px rgba(245, 215, 34, 0.5);
      }
      & > a {
        line-height: 35px;
        color: #fff;
        display: block;
        margin-bottom: 30px;
        &:hover {
          color: rgba(255, 179, 0, 0.904);
        }
        & > div {
          margin: 0 auto;
          width: 38px;
          height: 38px;
        }
      }

      .command-agency {
        & > div {
          @include bg("../../assets/img/系统维护/机构.png");
        }
        &.active> div ,
        &:hover> div  {
          @include bg("../../assets/img/系统维护/机构_yellow.png");
        }
      }
      .personnel-management {
           & > div {
        @include bg("../../assets/img/系统维护/人员.png");}
        &.active > div,
        &:hover> div {
          @include bg("../../assets/img/系统维护/人员_yellow.png");
        }
      }
      .change-password {
         & > div {
        @include bg("../../assets/img/系统维护/修改密码.png");
        }
        &.active > div ,
        &:hover > div  {
          @include bg("../../assets/img/系统维护/修改密码_yellow.png");
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
}
</style>