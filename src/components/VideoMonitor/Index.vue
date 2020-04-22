
<!--  -->
<template>
  <div class="content">
    <div class="left">
      <div class="module-head"></div>
      <el-input class="search-input" v-model="searchValue" @input="showAll">
        <i slot="suffix" class="el-input__icon el-icon-search" @click="search"></i>
      </el-input>
      <TabView :heads="['监控列表']" :totals="[monitorsTotal,0]">
        <template v-slot:left>
          <div class="monitor-list scroll-content" style="height:520px;">
            <PlanList
              v-show="!showSearchList"
              :model="plansData"
              ref="plan"
              @openForm="openPlanForm"
              @openMeetingList="openList"
            ></PlanList>
            <MonitorList
              v-show="!showSearchList"
              v-for="item in monitorsData"
              :model="item"
              :key="item.id"
              @openMeetingList="openList"
            ></MonitorList>
            <MonitorChildren v-show="showSearchList" :list="searchList" @openMeetingList="openList"></MonitorChildren>
          </div>
        </template>
        <template v-slot:right>
          <div class="meeting-list scroll-content" style="height:520px;">
            <ul>
              <li class="meeting-item" v-for="item in meetingsData" :key="item.id.confInternalId">
                <span class="dot"></span>
                <span class="name ellipsis" :title="item.name+'会议'">{{item.name+'会议'}}</span>
              </li>
            </ul>
          </div>
        </template>
      </TabView>

      <div class="passageway">
        <label for="picChoose">画面选择:</label>
        <select name="picChoose" id="picChoose" v-model="picChoose">
          <option :value="1">单画面</option>
          <option :value="4">4画面</option>
          <option :value="9">9画面</option>
          <option :value="16">16画面</option>
        </select>
        <button class="btn refresh" @click="refresh" :disabled="refreshing?'disabled':false">
          <i class="el-icon-loading" v-show="refreshing"></i>
          <span>刷 新</span>
        </button>
      </div>
    </div>
    <div class="mid">
      <Nav></Nav>
      <PlanForm
        :show.sync="showForm"
        :formData="formData"
        :monitorsData="monitorsData"
        @getPlans="getPlans"
      ></PlanForm>
      <div class="monitors-box" v-show="!showForm">
        <div class="head">
          <span class="title">监控预览</span>
          <!-- <i class="el-icon-close" @click="close"></i> -->
        </div>
        <div class="video-content">
          <div
            :id="'vframe_'+index"
            :class="'model-'+picChoose"
            v-for="(num,index) in picChoose"
            :key="index"
          >
            <video
              style="width:100%; height:100%; object-fit: fill"
              autoplay
              playsinline
              :id="'video_'+index"
            ></video>
            <div class="control-box">
              <span
                class="label label-info hide"
                :id="'name_'+index"
                style="position: absolute; top: 2px; left: 2px; margin: 0;"
              ></span>
              <span
                class="label label-warning hide"
                :id="'muted_'+index"
                style="position: absolute; top: 2px; right: 2px; margin: 0;"
              ></span>
              <span
                class="label label-primary hide"
                :id="'quality_'+index"
                style="position: absolute; bottom: 2px; right: 2px; margin: 0;"
              ></span>
              <button
                class="btn btn-sm btn-primary hide"
                :id="'audiolisten_'+index"
                style="text-align-all:center;position: absolute; bottom: 2px; left: 80px; margin: 0;"
              ></button>
              <button
                class="btn btn-sm btn-primary hide"
                :id="'videolisten_'+index"
                style="text-align-all:center;position: absolute; bottom: 2px; left: 2px; margin: 0;"
              ></button>
              <span :id="'control_'+index" class="hide">
                <button
                  class="btn btn-sm btn-primary"
                  :id="'play_'+index"
                  style="text-align-all:center;position: absolute; bottom: 20px; left: 8px; margin: 0;"
                >暂停</button>
                <button
                  class="btn btn-sm btn-warning"
                  :id="'stop_'+index"
                  style="text-align-all:center;position: absolute; bottom: 20px; left: 58px; margin: 0;"
                >停止</button>
                <button
                  class="btn btn-sm btn-success"
                  :id="'forwardf_'+index"
                  style="text-align-all:center;position: absolute; bottom: 20px; left: 116px; margin: 0;"
                >快进(x2)</button>
                <button
                  class="btn btn-sm btn-success"
                  :id="'forwards_'+index"
                  style="text-align-all:center;position: absolute; bottom: 20px; left: 186px; margin: 0;"
                >慢进(x0.5)</button>
                <button
                  class="btn btn-sm btn-success"
                  :id="'backward_'+index"
                  style="text-align-all:center;position: absolute; bottom: 20px; left: 266px; margin: 0;"
                >后退(x2)</button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value="0"
                  @onchange="randomPlay(index)"
                  :id="'progress_'+index"
                  style="position: absolute; bottom: 0px; left: 8px; width:80%"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="right"></div>
    <ul ref="box" class="meeting-list" v-show="showList" :style="{top:top}">
      <li
        v-for="item in meetingsData"
        :key="item.id.confInternalId"
        @click.stop="addToMeeting(item)"
      >{{item.name+'会议'}}</li>
    </ul>
  </div>
</template>

<script>
/* eslint-disable no-undef */

import bus from "../../assets/js/bus";
import Nav from "../Nav";
import TabView from "../VideoMeeting/TabView";
import PlanList from "./PlanList";
import PlanForm from "./PlanForm";
import MonitorList from "./MonitorList";
import MonitorChildren from "./MonitorChildren";
import {
  queryMonitorsMenu,
  queryMonitorList,
  loginInSmc,
  queryScheduleConferences
} from "../../api/api";
// import { get } from "../../api/http";
let videoFrams = [];

let mediaQuality = { video: {}, audio: {} };

export default {
  data() {
    return {
      picChoose: 9,
      refreshing: false,
      searchValue: null,
      plansData: {},
      allMonitors: [],
      monitorsData: [],
      meetingsData: [],
      showForm: false,
      formData: {},
      showList: false,
      top: 0,
      joinInfo: {},
      showSearchList: false,
      searchList: [],
      monitorsTotal: null
    };
  },
  created() {
    const that = this;
    document.addEventListener("click", () => {
      that.showList = false;
    });
    bus.$on("openMonitorsPlanForm", this.openPlanForm);
    bus.$on("openVideo", this.playVideo);
  },
  mounted() {
    this.getPlans();
    this.getAllMonitors();
    loginInSmc().then(res => {
      if (res.ret == "ok") {
        this.getAllMeetings();
      } else {
        this.$message.error(res.msg);
      }
    });
    this.initVideo();
  },
  components: {
    Nav,
    TabView,
    PlanList,
    PlanForm,
    MonitorList,
    MonitorChildren
  },
  methods: {
    createLoading(dom) {
      console.log(document.querySelector(dom));
      return this.$loading({
        target: document.querySelector(dom),
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0)",
        fullscreen: false
      });
    },
    refresh() {
      this.refreshing = true;
    },
    getAllMonitors() {
      const loading = this.createLoading(".monitor-list");
      queryMonitorList().then(res => {
        loading.close();
        if (res.ret == "ok") {
          const getTotal = datas => {
            for (const data of datas) {
              for (const item of data.monitors) {
                if (
                  this.allMonitors.findIndex(item2 => item2.id == item.id) == -1
                ) {
                  this.allMonitors.push(item);
                }
              }
              if (data.children.length > 0) {
                getTotal(data.children);
              }
            }
          };
          getTotal(res.content);
          this.monitorsTotal = this.allMonitors.length;
          this.monitorsData = res.content;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getAllMeetings() {
      const loading = this.createLoading(".meeting-list");
      queryScheduleConferences().then(res => {
        loading.close();
        if (res.ret == "ok") {
          this.meetingsData = res.content;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getPlans() {
      queryMonitorsMenu().then(res => {
        if (res.ret == "ok") {
          this.plansData = res.content;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    openPlanForm(formData) {
      // if (!this.sitesData.orgId) {
      //   this.$message.warning("目前没有会场信息");
      //   return;
      // }
      this.formData = formData;
      this.showForm = true;
      console.log(formData);
    },
    randomPlay(index) {
      console.log(index);
    },
    openList(params) {
      if (this.meetingsData.length == 0) {
        this.$message.warning("暂无会议");
      } else {
        this.joinInfo = params[0];
        this.top = params[1].pageY - params[1].offsetY + 8 + "px";
        this.showList = true;
        return false;
      }
    },
    addToMeeting(meeting) {
      console.log(meeting);
      // let { uri, name } = this.joinInfo;
      // let type = this.joinInfo.type
      //   ? this.joinInfo.type.value
      //   : "SiteType_VoIpSip";
      // let params = {
      //   siteUri: uri,
      //   siteName: name,
      //   siteType: type,
      //   meetId: meeting.id.confInternalId
      // };

      // get(params).then(res => {
      //   if (res.ret == "ok") {
      //     this.$message.success("加入成功");
      //     this.getConfSitesStatus(meeting.id.confInternalId);
      //   } else {
      //     this.$message.error(res.msg);
      //   }
      // });
      // this.showList = false;
    },
    search() {
      if (this.searchValue) {
        const value = this.searchValue;
        this.searchList = this.allMonitors.filter(
          item =>
            item.monitorName.indexOf(value) > -1 ||
            item.code.indexOf(value) > -1
        );
        this.showSearchList = true;
      } else {
        this.showSearchList = false;
      }
    },
    showAll(value) {
      if (!value) {
        this.showSearchList = false;
        this.searchList = [];
      }
    },
    initVideo() {
      let rtcSession = null;
      let serverAddr = window.config.videoServiceIp;
      let sessionCfg = {};
      sessionCfg[RtcSessionConfigKey.KEY_LOG_LEVEL] =
        RtcLogLevel.RTC_LOG_LEVEL_ALL;
      sessionCfg[RtcSessionConfigKey.KEY_MEDIA_TRANSPORT_TYPE] =
        RtcTransportType.RTC_TRANSPORT_TYPE_UDP;
      mediaQuality.video.quality = RtcVideoQuality.RTC_VIDEO_QUALITY_CIF;
      mediaQuality.video.frameRate = 25;
      mediaQuality.video.bitRateType =
        RtcVideoBitrateType.RTC_VIDEO_BITRATE_TYPE_CONSTANT;
      mediaQuality.audio.quality = RtcAudioQuality.RTC_AUDIO_QUALITY_HQ_HBR;
      for (let i = 0; i < 9; i++) {
        videoFrams[i] = {
          videoSrc: document.querySelector("#video_" + i),
          handler: null,
          inUse: false
        };
      }
      rtcSession = rtcInitSession(serverAddr, this.sessionCallback, sessionCfg);
      if (rtcSession === null) {
        console.log("rtc session init failed!");
      }
    },
    sessionCallback(result) {
      const that = this;
      let evtID = result["EventID"];
      let isError = result["isError"];
      if (isError) {
        //let errReason = result["ErrReason"];
        //alert("error:"+evtID+"\nreason:"+errReason);
        switch (evtID) {
          case RtcCommonEventID.RTC_SESSION_CONNECTION_FAILED:
            that.$message.error("监控服务器连接失败");
            break;
        }
        return;
      }
      let serviceCallback = function(handler, event) {
        if (event.isError) {
          if (event.EventID === RtcCamEventID.RTC_CHANNEL_LOGIN_FAILED) {
            that.$message.error("监控服务器登录失败");
          } else if (
            event.EventObj !== undefined &&
            event.EventObj.request !== undefined
          ) {
            that.$message.error(
              event.EventObj.request + "请求失败; \n原因：" + event.ErrReason
            );
          } else {
            that.$message.error(event.ErrReason);
          }
          return;
        }
        switch (event.EventID) {
          case RtcCamEventID.RTC_CHANNEL_CALL_INCOMING:
            {
              let callInfo = event.EventObj;
              $("#status").text(callInfo.peerName + "来电...");
              bootbox.dialog({
                message: "是否接听" + callInfo.peerName + "的来电?",
                title: "来电",
                closeButton: false,
                buttons: {
                  success: {
                    label: "接听",
                    className: "btn-success",
                    callback: function() {
                      rtcCamAnswerCall(
                        handler,
                        RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO
                      );
                    }
                  },
                  danger: {
                    label: "拒绝",
                    className: "btn-danger",
                    callback: function() {
                      rtcCamRejectCall(handler);
                    }
                  }
                }
              });
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_LOCAL_STREAM_INCOMING:
            {
              let streamObj = event["EventObj"];
              rtcAttachStream($("#video_local").get(0), streamObj);
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_INCOMING:
            {
              let streamObj = event["EventObj"];
              rtcAttachStream($("#video_remote").get(0), streamObj);
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_LOCAL_NO_CAMERA:
            $("#no_camera_local")
              .removeClass("hide")
              .text("无摄像头")
              .show();
            break;
          case RtcCamEventID.RTC_CHANNEL_LOCAL_NO_MICROPHONE:
            $("#no_mic_local")
              .removeClass("hide")
              .text("无麦克风")
              .show();
            break;
          case RtcCamEventID.RTC_CHANNEL_CALL_OUTGOING:
            {
              $("#status").text("呼叫中...");
              $("#name_local")
                .removeClass("hide")
                .text("我");
              $("#makeCall").text("挂断");
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_CALL_ACCEPTING:
            {
              $("#status").text("等待接听中...");
              $("#makeCall").text("挂断");
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_CALL_ACCEPTED:
            {
              let callInfo = event["EventObj"];
              $("#status").text("已接通" + callInfo.peerName);
              $("#makeCall").text("挂断");
              $("#name_remote")
                .removeClass("hide")
                .text(callInfo.peerName);
              $("#name_local")
                .removeClass("hide")
                .text("我");
              if (!$("#matrixWin").hasClass("hide")) {
                $("#show_matrix").click();
              }

              //加入本地和远端窗口的右击菜单
              let vData_local = [
                [
                  {
                    text: "切换静音",
                    func: function() {
                      //本地静音
                      if (
                        rtcCamIsLocalMediaMuted(
                          RtcMediaType.RTC_MEDIA_TYPE_AUDIO
                        )
                      ) {
                        rtcCamMuteLocalMedia(
                          RtcMediaType.RTC_MEDIA_TYPE_AUDIO,
                          false
                        );
                        $("#muted_local_audio")
                          .text("静音")
                          .addClass("hide");
                      } else {
                        rtcCamMuteLocalMedia(
                          RtcMediaType.RTC_MEDIA_TYPE_AUDIO,
                          true
                        );
                        $("#muted_local_audio")
                          .text("静音")
                          .removeClass("hide");
                      }
                    }
                  },
                  {
                    text: "切换禁像",
                    func: function() {
                      //本地静音
                      if (
                        rtcCamIsLocalMediaMuted(
                          RtcMediaType.RTC_MEDIA_TYPE_VIDEO
                        )
                      ) {
                        rtcCamMuteLocalMedia(
                          RtcMediaType.RTC_MEDIA_TYPE_VIDEO,
                          false
                        );
                        $("#muted_local_video")
                          .text("禁像")
                          .addClass("hide");
                      } else {
                        rtcCamMuteLocalMedia(
                          RtcMediaType.RTC_MEDIA_TYPE_VIDEO,
                          true
                        );
                        $("#muted_local_video")
                          .text("禁像")
                          .removeClass("hide");
                      }
                    }
                  }
                ]
              ];
              let options_local = {
                name: "menu_local",
                beforeShow: function() {
                  $.smartMenu.remove();
                }
              };
              $("#vframe_local").smartMenu(vData_local, options_local);

              let vData_remote = [
                [
                  {
                    text: "切换静音",
                    func: function() {
                      //远端静音
                      if (
                        rtcCamIsRemoteMediaListened(
                          handler,
                          RtcMediaType.RTC_MEDIA_TYPE_AUDIO
                        )
                      ) {
                        rtcCamListenRemoteMedia(
                          handler,
                          RtcMediaType.RTC_MEDIA_TYPE_AUDIO,
                          false
                        );
                        $("#muted_remote_audio")
                          .text("静音")
                          .removeClass("hide");
                      } else {
                        rtcCamListenRemoteMedia(
                          handler,
                          RtcMediaType.RTC_MEDIA_TYPE_AUDIO,
                          true
                        );
                        $("#muted_remote_audio")
                          .text("静音")
                          .addClass("hide");
                      }
                    }
                  },
                  {
                    text: "切换禁像",
                    func: function() {
                      //本地静音
                      if (
                        rtcCamIsRemoteMediaListened(
                          handler,
                          RtcMediaType.RTC_MEDIA_TYPE_VIDEO
                        )
                      ) {
                        rtcCamListenRemoteMedia(
                          handler,
                          RtcMediaType.RTC_MEDIA_TYPE_VIDEO,
                          false
                        );
                        $("#muted_remote_video")
                          .text("禁像")
                          .removeClass("hide");
                      } else {
                        rtcCamListenRemoteMedia(
                          handler,
                          RtcMediaType.RTC_MEDIA_TYPE_VIDEO,
                          true
                        );
                        $("#muted_remote_video")
                          .text("禁像")
                          .addClass("hide");
                      }
                    }
                  }
                ]
              ];
              let options_remote = {
                name: "menu_remote",
                beforeShow: function() {
                  $.smartMenu.remove();
                }
              };
              $("#vframe_remote").smartMenu(vData_remote, options_remote);
            }
            break;
        }
      };
      switch (evtID) {
        case RtcCommonEventID.RTC_SESSION_INIT_SUCCESS:
          rtcApplyService(
            rtcSession,
            RtcServiceType.RTC_SERVICE_TYPE_CAM,
            serviceCallback
          );
          //... 可以申请更多服务
          break;
        case RtcCommonEventID.RTC_SERVICE_APPLY_SUCCESS:
          console.log("EventID:" + evtID);
          if (result.EventObj !== RtcServiceType.RTC_SERVICE_TYPE_CAM) {
            that.$message.error("非视频监控服务!");
            break;
          }
          break;
        case RtcCommonEventID.RTC_SESSION_DESTROYED:
          window.location.reload();
          break;
        default:
          console.log("EventID:" + evtID);
          break;
      }
    },

    playVideo(code) {
        let feedIndex = findEmptyVideoFrame();
    if(feedIndex === -1)
    {
        this.$message.warning("没有多余的窗口显示监控视频！");
        return;
    }
    let frame = videoFrams[feedIndex];
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
            
            if (frame.videoSrc !== null) {
              frame.videoSrc.bind("playing", function() {
                if (this.videoWidth) frame.videoSrc.removeClass("hide").show();
              });
            }
            frame.playTime = 0;
            frame.stepFactor = 1.0;
            frame.timerId = setInterval(() => {
              frame.playTime += PLAY_STEP * frame.stepFactor;
              //console.log("timerId:"+frame.timerId+";playTime="+frame.playTime);
              progress.get(0).value = frame.playTime;
              if (
                frame.playTime > parseFloat(progress.get(0).max) ||
                frame.playTime <= 0
              ) {
                frame.reachMax = true;
                clearInterval(frame.timerId);
                frame.playTime = 0;
                progress.get(0).value = frame.playTime;
                btnPlay.text("播放");
              }
            }, PLAY_INTERVAL);
            btnPlay.text("暂停");
            if (isPlayback) {
              controlArea.removeClass("hide");
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_INCOMING:
            {
              let streamObj = event["EventObj"];
              rtcAttachStream(frame.videoSrc, streamObj);
              
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_NO_AUDIO:
            //status.text(userName+":无音频流");
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_STREAM_NO_VIDEO:
            // status.text(userName+":无视频流");
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_CONNECT_FAIL:
            if (event.EventObj !== undefined) {
              status.text(userName + ": 未接通");
            }
            break;
          case RtcCamEventID.RTC_CHANNEL_REMOTE_DISCONNECT:
            if (event.EventObj !== undefined) {
              status.text(userName + ": 已退出");
            }
            if (frame.timerId !== 0) {
              clearInterval(frame.timerId);
              frame.timerId = 0;
              progress.get(0).value = 0;
              frame.playTime = 0;
            }
            btnPlay.unbind();
            btnStop.unbind();
            btnForwardf.unbind();
            btnForwards.unbind();
            btnBackward.unbind();
            break;
          case RtcCamEventID.RTC_CHANNEL_CLOSED:
            status.text(userName + ": 已断开");
            labelName.addClass("hide");
            labelQuality.addClass("hide");
            frame.inUse = false;
            frame.handler = null;
            if (isPlayback) {
              controlArea.addClass("hide");
            }

            break;
        }
      };
      rtcCamOpenStream(
        code,
        RtcMediaType.RTC_MEDIA_TYPE_AUDIO_VIDEO,
        { mediaQuality },
        chCallback
      );
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
.content {
  display: flex;
  padding: 0 20px;
  box-sizing: border-box;
  & > .left,
  & > .right {
    width: 364px;
    height: 950px;
    padding: 34px 20px;
    box-sizing: border-box;
    background: url("../../assets/img/首页/左侧背景.png") no-repeat bottom;
    background-size: contain;
  }
  & > .right {
    visibility: hidden;
  }
  & > .mid {
    flex-grow: 1;
    position: relative;
  }
}
.passageway {
  margin-top: 8px;

  box-sizing: border-box;
  text-align: right;
  color: #2fc4fc;
  select {
    background: transparent;
    color: #2fc4fc;
    border: none;
    border-bottom: 1px solid #2fc4fc;
    outline: none;
    font-size: 16px;
    padding-left: 10px;
    margin-right: 12px;
  }
  option {
    background-color: #092439;
    border: none;
    outline: none;
    line-height: 20px;
  }
  .btn {
    cursor: pointer;
    min-width: 70px;
    padding: 0 4px;
    height: 34px;
    margin: 0;
    border-radius: 4px;
    outline: none; //消除默认点击蓝色边框效果
    &:hover,
    &:active {
      background-image: linear-gradient(
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0.15)
      );
    }
  }
  .refresh {
    background: #72ba25;
    border: 2px solid #2a570c;
  }
}
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
    flex-wrap: wrap;
    height: calc(100% - 30px);
    justify-content: space-between;
    & > div {
      position: relative;
      z-index: 1;
      background-color: #000000;
    }
    .model-1 {
      width: 100%;
      height: 100%;
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
    .control-box {
      position: absolute;
      top: 2px;
      display: none;
    }
  }
}
.meeting-item {
  line-height: 32px;
  .dot {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 10px;
    background: #f7b500;
    border-radius: 50%;
    vertical-align: middle;
  }
  .name {
    width: calc(100% - 26px);
  }
}
.meeting-list {
  position: absolute;
  z-index: 2;
  left: 340px;
  transform: translateY(-50%);
  background: rgba(20, 35, 56, 0.9);
  border: 1px solid #3c82ed;
  font-size: 18px;
  color: #b6cff9;
  line-height: 34px;
  & > li {
    cursor: default;
    padding: 0 22px;
  }
  & > li:hover {
    color: #ffffff;
    background: rgba(35, 76, 122, 0.7);
  }
}
</style>