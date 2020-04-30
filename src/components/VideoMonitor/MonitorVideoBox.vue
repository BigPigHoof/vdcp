<!--  -->
<template>
  <div class="monitors-box">
    <div class="head">
      <span class="title">监控预览</span>
      <!-- <i class="el-icon-close" @click="close"></i> -->
    </div>
    <div class="video-content">
      <div
      v-show="!(isMax&&nowIndex!=index)"
        :id="'vframe_'+index"
        :class="['model-'+nowPicNum,{'max':nowIndex==index&&isMax}]"
        v-for="(num,index) in nowPicNum"
        :key="index"
        @click="showRightMenu=false;"
        @dblclick="isMax=!isMax"
        @contextmenu="openRightMenu($event,index)"
      >
        <video
          style="width:100%; height:100%; object-fit: fill"
          autoplay
          playsinline
          :id="'video_'+index"
        ></video>
      </div>
      <ul class="right-menu" :style="styleObject" v-show="showRightMenu">
        <li @click="maxVideo">最大化</li>
        <li @click="revertVideo">还原</li>
        <li @click="closeVideo">关闭</li>
      </ul>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-undef */
import bus from "../../assets/js/bus";

let videoFrams = [];


export default {
  props: ["nowPicNum"],
  data() {
    return {
      showRightMenu: false,
      styleObject: {
        top: 0,
        left: 0
      },
      nowIndex:0,
      isMax:false,
    };
  },
  watch: {
    nowPicNum(val, oldVal) {
      //普通的watch监听
      console.log("a: " + val, oldVal);
      if (val > oldVal) {
        for (let i = oldVal; i < val; i++) {
          videoFrams.push({
            videoSrc: document.querySelector("#video_" + i),
            handler: null,
            inUse: false
          });
        }
      } else {
        let deleteArr = videoFrams.splice(val, oldVal - val);
        for (const item of deleteArr) {
          if (item.inUse) rtcCamClosePlayback(item.handler);
        }
      }
    }
  },
  created() {
    bus.$on("openVideo", this.playVideo);
  },
  mounted() {
         
      for (let i = 0; i < 9; i++) {
        videoFrams[i] = {
          videoSrc: document.querySelector("#video_" + i),
          handler: null,
          inUse: false
        };
      }
  },
  methods: {

    playVideo(code) {
      let feedIndex = findEmptyVideoFrame();
      if (feedIndex === -1) {
        this.$message.warning("没有多余的窗口显示监控视频！");
        return;
      }
      if (videoFrams.findIndex(item => item.name == code) > -1) {
        this.$message.warning("此监控视频已在播放中！");
        return;
      }
      let frame = videoFrams[feedIndex];
      let loading = this.$loading({
        target: document.querySelector("#vframe_" + feedIndex),
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0)",
        fullscreen: false
      });
      let mediaQuality=window.mediaQuality;
      let chCallback = function(handler, event) {
        switch (event.EventID) {
          case RtcCamEventID.RTC_CHANNEL_BUILD_SUCCESS:
            {
              frame.handler = handler;
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_OUTGOING:
            frame.inUse = true;
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_ACCEPTING:
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_ACCEPTED:
            frame.name = code;

            frame.playTime = 0;
            frame.stepFactor = 1.0;
            frame.timerId = setInterval(() => {
              frame.playTime += 0.5 * frame.stepFactor;

              if (frame.playTime <= 0) {
                frame.reachMax = true;
                clearInterval(frame.timerId);
                frame.playTime = 0;
              }
            }, 500);

            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_INCOMING:
            {
              let streamObj = event["EventObj"];
              rtcAttachStream(frame.videoSrc, streamObj);
              loading.close();
            }
            break;

          case RtcCamEventID.RTC_CHANNEL_REMOTE_CONNECT_FAIL:
            if (event.EventObj !== undefined) {
              console.log(userName + ": 未接通");
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_DISCONNECT:
            if (event.EventObj !== undefined) {
              console.log(userName + ": 已退出");
            }
            if (frame.timerId !== 0) {
              clearInterval(frame.timerId);
              frame.timerId = 0;

              frame.playTime = 0;
            }

            break;
          case RtcCamEventID.RTC_CHANNEL_CLOSED:
            frame.inUse = false;
            frame.handler = null;
            break;
        }
      };
      rtcCamOpenStream(
        "0" + code,
        RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO,
        { mediaQuality },
        chCallback
      );
    },
    openRightMenu(e, i) {
      console.log(e);
      if (videoFrams[i].inUse) {
        e.preventDefault();
        this.nowIndex=i;
        this.styleObject.left=e.offsetX+'px';
        this.styleObject.top=e.offsetY+'px';
        this.showRightMenu = true;
      }
    },
    maxVideo() {
      this.isMax=true;
        this.showRightMenu=false;
    },
    revertVideo() {
      this.isMax=false;
        this.showRightMenu=false;
    },
    closeVideo() {
       rtcCamClosePlayback(videoFrams[this.nowIndex].handler);
       videoFrams[this.nowIndex].handler=null;
       videoFrams[this.nowIndex].inUse=false;
       videoFrams[this.nowIndex].name=null;
       this.showRightMenu=false;
    }
  }
};
function findEmptyVideoFrame() {
  let index = -1;
  let i = 0;
  for (i; i < videoFrams.length; i++) {
    if (videoFrams[i].inUse === false) {
      index = i;
      break;
    }
  }
  return index;
}
</script>
<style lang="scss" scoped>
.monitors-box {
  // display: none;
  width: 1396px;
  height: calc(100% - 140px);
  padding: 18px 14px 0 14px;
  position: absolute;
  box-sizing: border-box;
  margin: 20px auto 0 70px;
  background-image: linear-gradient(to right, #234672, #000000);
  border: 1px #6388b6 solid;
  border-radius: 3px;
  .head {
    display: flex;
    justify-content: space-between;
    .title {
      font-size: 22px;
      font-weight: 700;
    }
    i {
      cursor: pointer;
    }
  }
  .video-content {
    display: flex;
    position: relative;
    flex-wrap: wrap;
    height: calc(100% - 30px);
    justify-content: space-between;
    & > div {
      position: relative;
      z-index: 1;
      background-color: rgba(11, 33, 58, 0.582);
    }
    .model-1 {
      width: 100%;
      height: 99%;
    }
    .model-4 {
      width: 49.5%;
      height: 49%;
    }
    .model-9 {
      width: 32.67%;
      height: 32%;
    }
    .model-16 {
      width: 24.25%;
      height: 23.5%;
    }
    .max {
      width: 100%;
      height: 99%;
    }
    .control-box {
      position: absolute;
      top: 2px;
      display: none;
    }
    .right-menu {
      position: absolute;
      z-index: 1;
      background: rgba(37, 80, 140, 0.8);
      border: 1px solid #3c82ed;
      font-size: 14px;
      color: #b6cff9;
      line-height: 30px;
      & > li {
        cursor: default;
        padding: 0 10px;
      }
        & > li:hover {
    color: #ffffff;
    background: rgba(35, 76, 122, 0.7);
  }
    }
  }
}
</style>