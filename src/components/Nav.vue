<!--  -->
<template>
  <div class="menu">
    <div :class="{active:$route.name==='Home'}">
      <router-link  to="/Home">系统首页</router-link>
    </div>
    <div :class="{active:$route.name==='VideoMeeting'}">
      <router-link to="/VideoMeeting">视频会商</router-link>
    </div>
    <div :class="{active:$route.name==='VideoMonitor'}">
      <router-link to="/VideoMonitor">视频监控</router-link>
    </div>
    <div :class="{active:$route.path.indexOf('ResourceManagement')>-1}">
      <router-link to="/ResourceManagement">资源管理</router-link>
    </div>
    <div :class="{active:$route.path.indexOf('SystemMaintenance')>-1}">
      <router-link to="/SystemMaintenance">系统维护</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

    };
  },

  components: {}
};
</script>
<style lang="scss" scoped>
@mixin bg($url) {
    background: url($url) no-repeat bottom;
    background-size: contain;
}
.menu {
  width: 100%;
  height: 45px;
  text-align: center;
  font-size: 24px;
  display: flex;
  justify-content: center;

  &>div:nth-child(1){
    width: 174px;
    @include bg('../assets/img/首页/系统首页.png');
    &.active{
       @include bg('../assets/img/首页/系统首页高亮.png');
    }
  }
   &>div:nth-child(2){
     margin-left: 12px;
    width: 174px;
     @include bg('../assets/img/首页/视频会商.png');
    &.active{
       @include bg('../assets/img/首页/视频会商高亮.png');
    }
  }
   &>div:nth-child(3){
    width: 174px;
    margin: 0 24px;
     @include bg('../assets/img/首页/视频监控.png');
    &.active{
       @include bg('../assets/img/首页/视频监控高亮.png');
    }
  }
   &>div:nth-child(4){
       margin-right: 12px;
    width: 174px;
     @include bg('../assets/img/首页/资源管理.png');
    &.active{
       @include bg('../assets/img/首页/资源管理高亮.png');
    }
  }
   &>div:nth-child(5){
    width: 174px;
     @include bg('../assets/img/首页/系统维护.png');
    &.active{
       @include bg('../assets/img/首页/系统维护高亮.png');
    }
  }
 .active > a{
      color: #ffb300;
  }
  a{
       line-height: 35px;
     color: #fff;
  }
  a:hover {
    color: rgba(255, 179, 0, 0.904);
  }
}
</style>