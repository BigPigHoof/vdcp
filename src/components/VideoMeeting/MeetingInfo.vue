<!--  -->
<template>
  <div class="meeting-info">
    <ul class="meeting-list scroll-content">
      <li v-for="(item,index) in meetings" :key="item.id.confInternalId">
        <div class="left">
          <span
            class="title"
            :class="{active:meetingId==item.id.confInternalId}"
            :title="item.name+'会议'"
            @click="$emit('refresh',item.id.confInternalId)"
          >{{item.name+'会议'}}</span>
        </div>
        <div class="right">
          <i
            class="iconfont"
            :class="{iconfayan:item.mute==undefined||item.mute===true,iconjinzhifayan:item.mute===false}"
            @click="muteMeeting(item)"
          ></i>
          <i
            class="iconfont iconguangbo"
            :class="{iconguangbo:item.broadcast,iconguangboguzhang:!item.broadcast}"
         
            @click="broadcastMeeting(item)"
          ></i>
          <svg class="icon svg-icon" aria-hidden="true" @click="showPic(item.id.confInternalId)">
            <use xlink:href="#iconhuamianxuanze" />
          </svg>

          <i
            class="iconfont iconjieting1"
            style="transform: rotate(135deg);"
            @click="endMeeting(item.id.confInternalId,index)"
          ></i>
          <!-- <span class="end-call"  @click="endMeeting(item.id,index)"></span> -->
          <!-- <i class="iconfont iconjieting1" @click="endMeeting(item.id,index)"></i> -->
        </div>
      </li>
    </ul>
    <ul v-show="!show" class="site-list scroll-content">
      <li v-for="(item,index) in sites" :key="item.uri">
        <div class="left">
          <span class="title" :title="item.name" :uri="item.uri" :class="getStatus(item)">{{item.name}}</span>
        </div>
        <div class="right">
          <i
            class="iconfont"
            :class="!item.isMute?'iconfayan':'iconjinzhifayan'"
            @click="muteSite(item)"
          ></i>
          <i
            class="iconfont"
            :class="!item.isBroadCast?'iconguangbo':'iconguangboguzhang'"
            @click="broadcastSite(item)"
          ></i>
          <i
            class="iconfont iconjieting1"
            :class="{endcall:item.status.value != 'Disconnected'}"
            @click="callSite(item)"
          ></i>
          <i class="iconfont iconshanchu" @click="deleteSite(item,index)"></i>
        </div>
      </li>
    </ul>
    <ul v-show="show" class="picture-selection">
      <li>
        <div class="left">
          <span class="num">1</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(1,'CP_1_1')">
            <use xlink:href="#iconhuamian" />
          </svg>
          <!-- <span :style="{background: 'url(' + require('@/assets/img/视频会商/1画面.svg') + ')'}"></span> -->
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">2</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(2,'CP_2_1')">
            <use xlink:href="#iconhuamianzuoyou" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(2,'CP_2_2')">
            <use xlink:href="#iconhuamianshangxia" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(2,'CP_2_6')">
            <use xlink:href="#iconhuamianquanping" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(2,'CP_2_7')">
            <use xlink:href="#iconhuamiandapinglashen" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">3</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(3,'CP_3_1')">
            <use xlink:href="#iconhuamian1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(3,'CP_3_2')">
            <use xlink:href="#iconhuamianzuoshang" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(3,'CP_3_3')">
            <use xlink:href="#iconhuamianzhongshang" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(3,'CP_3_4')">
            <use xlink:href="#iconhuamianzuo" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(3,'CP_3_6')">
            <use xlink:href="#iconhuamianzuozhong" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(3,'CP_3_8')">
            <use xlink:href="#iconhuamiandapinglashen1" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">4</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(4,'CP_4_1')">
            <use xlink:href="#iconhuamian2" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(4,'CP_4_2')">
            <use xlink:href="#iconhuamianzuo1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(4,'CP_4_3')">
            <use xlink:href="#iconhuamianyou" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(4,'CP_4_4')">
            <use xlink:href="#iconhuamianshang" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(4,'CP_4_5')">
            <use xlink:href="#iconhuamianxia" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(4,'CP_4_6')">
            <use xlink:href="#iconhuamianquanping1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(4,'CP_4_7')">
            <use xlink:href="#iconhuamiandapinglashen2" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">5</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(5,'CP_5_1')">
            <use xlink:href="#iconhuamianshang1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(5,'CP_5_2')">
            <use xlink:href="#iconhuamianxia1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(5,'CP_5_3')">
            <use xlink:href="#iconhuamianzuo2" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(5,'CP_5_4')">
            <use xlink:href="#iconhuamianyou1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(5,'CP_5_6')">
            <use xlink:href="#iconhuamianquanping2" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(5,'CP_5_7')">
            <use xlink:href="#iconhuamiandapinglashen3" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">6</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(6,'CP_6_1')">
            <use xlink:href="#iconhuamian3" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(6,'CP_6_2')">
            <use xlink:href="#iconhuamianzuoshang1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(6,'CP_6_3')">
            <use xlink:href="#iconhuamianyoushang" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(6,'CP_6_4')">
            <use xlink:href="#iconhuamianzuoxia" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(6,'CP_6_5')">
            <use xlink:href="#iconhuamianyouxia" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(6,'CP_6_7')">
            <use xlink:href="#iconhuamianquanping3" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(6,'CP_6_8')">
            <use xlink:href="#iconhuamiandapinglashen4" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">7</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(7,'CP_7_1')">
            <use xlink:href="#iconhuamianzuoshang2" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(7,'CP_7_2')">
            <use xlink:href="#iconhuamianyoushang1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(7,'CP_7_3')">
            <use xlink:href="#iconhuamianyouxia1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(7,'CP_7_4')">
            <use xlink:href="#iconhuamianzuoxia1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(7,'CP_7_5')">
            <use xlink:href="#iconhuamianquanping4" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(7,'CP_7_6')">
            <use xlink:href="#iconhuamiandapinglashen5" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">8</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(8,'CP_8_1')">
            <use xlink:href="#iconhuamian4" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(8,'CP_8_2')">
            <use xlink:href="#iconhuamianzuoshang3" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(8,'CP_8_3')">
            <use xlink:href="#iconhuamianyoushang2" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(8,'CP_8_4')">
            <use xlink:href="#iconhuamianzuoxia2" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(8,'CP_8_6')">
            <use xlink:href="#iconhuamianyouxia2" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">9</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(9,'CP_9_1')">
            <use xlink:href="#iconhuamian5" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">10</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(10,'CP_10_1')">
            <use xlink:href="#iconhuamianzuoshang4" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(10,'CP_10_2')">
            <use xlink:href="#iconhuamianzuoxia3" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(10,'CP_10_3')">
            <use xlink:href="#iconhuamianshangzuo" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(10,'CP_10_4')">
            <use xlink:href="#iconhuamianyoushang3" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(10,'CP_10_5')">
            <use xlink:href="#iconhuamianzuozhong1" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(10,'CP_10_6')">
            <use xlink:href="#iconhuamianzhongshang1" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">13</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(13,'CP_13_1')">
            <use xlink:href="#iconhuamianzuoshang5" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(13,'CP_13_2')">
            <use xlink:href="#iconhuamianyoushang4" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(13,'CP_13_3')">
            <use xlink:href="#iconhuamianzuoxia4" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(13,'CP_13_4')">
            <use xlink:href="#iconhuamianyouxia3" />
          </svg>
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(13,'CP_13_5')">
            <use xlink:href="#iconhuamianzhong" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">16</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(16,'CP_16_1')">
            <use xlink:href="#iconhuamian6" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">20</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(20,'CP_20_1')">
            <use xlink:href="#iconhuamian7" />
          </svg>
        </div>
      </li>
      <li>
        <div class="left">
          <span class="num">25</span>
          <span>画面</span>
        </div>
        <div class="right">
          <svg class="icon svg-icon" aria-hidden="true" @click="setMultiScreen(25,'CP_25_1')">
            <use xlink:href="#iconhuamian8" />
          </svg>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {
  queryConfSitesStatus,
  setMuteSites,
  cancelBroadcast,
  setContinuousPresence,
  endMeeting,
  setBroadcast,
  callSiteToMeeting,deleteSiteFromMeeting
} from "../../api/api";

export default {
  props: ["meetingList", "meetingSites", "meetId"],
  data() {
    return {
      meetings: [],
      sites: [],
      meetingId: "",
      meetingMute: true,
      show: false
    };
  },
  watch: {
    meetingList: function(newVal) {
      this.meetings = newVal;
    },
    meetingSites: function(newVal) {
      this.sites = newVal;
    },
    meetId: function(newVal) {
      this.meetingId = newVal;
    }
  },

  components: {},
  methods: {
    getStatus(item) {
      console.log(item)
      let statusClass = "";
       if(item.status){
          statusClass = item.status.value == "Connected" ? "join" : "unjoin";
       }
      return statusClass;
    },
    muteMeeting(meeting) {
      let conferenceId = meeting.id.confInternalId,
        siteUris = [],
        mute = meeting.mute;
      setMuteSites({ conferenceId, siteUris, mute }).then(res => {
        if (res.ret == "ok") {
          meeting.mute = !mute;
          if (this.meetingId == meeting.id) {
            this.$emit("refresh", meeting.id);
          }
        }
      });
    },
    broadcastMeeting(meeting) {
      if (meeting.broadCastSiteUri) {
        cancelBroadcast({ meetId: meeting.id.confInternalId, uri: "" }).then(res => {
          if (res.ret == "ok") {
               this.$message.success('取消广播成功');
            meeting.broadCastSiteUri = null;
            this.meetingId = meeting.id;
            this.$emit("refresh", this.meetingId);
          } else {
            this.$message.error(res.msg);
          }
        });
      } else {
        setBroadcast({ meetId: meeting.id, uri: "" }).then(res => {
          if (res.ret == "ok") {
             this.$message.success('广播成功');
            meeting.broadCastSiteUri = !meeting.broadCastSiteUri;
            this.meetingId = meeting.id;
            this.$emit("refresh", this.meetingId);
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    endMeeting(meetId, index) {
      endMeeting({ meetId }).then(res => {
        if (res.ret == "ok") {
          this.meetings.splice(index, 1);
          console.log(this.meetings);
          if (this.meetingId == meetId) {
            this.meetingId = "";
            console.log(this.sites);
            this.sites = [];
            this.show=false;
            console.log(this.sites);
          }
        }
      });
    },
    muteSite(site) {
      let conferenceId = this.meetingId,
        siteUris = [site.uri],
        mute = !site.isMute;
      setMuteSites({ conferenceId, siteUris, mute }).then(res => {
        if (res.ret == "ok") {
          site.isMute = mute;
        }
      });
    },
    broadcastSite(site) {
      if(site.isBroadCast){
          cancelBroadcast({ uri: site.uri, meetId: this.meetingId }).then(res => {
        if (res.ret == "ok") {
          site.isBroadCast = !site.isBroadCast;
          this.$message.success('取消广播成功');
        } else {
          this.$message.error(res.msg);
        }
      });
      }else{
          setBroadcast({ uri: site.uri, meetId: this.meetingId }).then(res => {
        if (res.ret == "ok") {
          site.isBroadCast = !site.isBroadCast;
           this.$message.success('广播成功');
        } else {
          this.$message.error(res.msg);
        }
      });
      }
    
    },
    callSite(site) {
      if (site.status.value == "Disconnected") {
        let index = this.meetings.findIndex(item => item.id == this.meetingId);

        callSiteToMeeting({
          ...this.meetings[index],
          offLineSiteUri: [site.uri]
        }).then(res => {
          if (res.ret == "ok") {
            this.$emit("refresh", this.meetingId);
          }
        });
      }
    },
    deleteSite(site, index) {

      deleteSiteFromMeeting({
        siteUri:site.uri,
        meetId:this.meetingId
      }).then(res => {
        if (res.ret == "ok") {
          this.sites.splice(index, 1);
          console.log(this.sites);
        }else{
          this.$message.error(res.msg);
        }
      });
    },
    setMultiScreen(num, mode) {
      const that=this;
      queryConfSitesStatus({ meetId: this.meetingId }).then(res => {
        if (res.ret == "ok") {
          let arr = [];
          this.sites = res.content;
          for (const item of res.content[1]) {
            if (that.getStatus(item) == "join") {
              arr.push(item);
            }
          }
          if (arr.length == 0) {
            this.$message.warning("没有入会的会场");
          } else {
            arr = arr.length > num ? arr.slice(0, num) : arr;
            let parms = {
              meetId: this.meetingId,
              subPics: arr.map(item => item.uri),
              mode
            };
            setContinuousPresence(parms).then(res => {
              if (res.ret == "ok") {
                this.$message.success("设置成功");
              } else {
                this.$message.error(res.msg);
              }
            });
          }
        }
      });
    },
    showPic(id){
      if(this.meetingId!=id){
        this.meetingId=id;
        this.$emit("refresh",id);
        this.show=true;
      }else{
        this.show=!this.show;
      }
       
    }
  }
};
</script>
<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.meeting-info {
  margin-top: 46px;
  .scroll-content::-webkit-scrollbar-thumb {
    background: #0a283e;
  }
  li {
    display: flex;
    align-items: center;

    box-sizing: border-box;
  }
  .iconfont {
    color: #bbd5ff;
    &.endcall {
      transform: rotate(135deg);
    }
  }
  .left {
    width: calc(100% - 130px);
    text-align: right;
  }
  .right {
    padding: 0 16px;
    box-sizing: border-box;
    width: 130px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .meeting-list {
    height: 78px;
    overflow-y: auto;
    overflow: overlay;
    border-top: 1px solid #32c5ff;
    border-bottom: 1px solid #32c5ff;
    & > li {
      height: 50%;
    }
    .title {
      color: #a3d6ff;
      font-size: 20px;
      cursor: default;
      &.active{
            color: #0095ff;
           font-weight: 900;

      }
    }
  }
  .site-list {
    height: 330px;

    & > li {
      height: 36px;
    }
    .title {
      font-size: 18px;
    }
  }
  .outline {
    color: rgb(155, 155, 155);
  }
  .join {
    color: rgb(238, 62, 62);
  }
  .unjoin {
    color: rgb(32, 224, 64);
  }
}
.picture-selection {
  .left {
    width: 54px;
    text-align: right;
    .num {
      color: #bbd5ff;
    }
  }
  .right {
    display: inline-block;
    width: calc(100% - 54px);
    & > .icon {
      margin-right: 20px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>