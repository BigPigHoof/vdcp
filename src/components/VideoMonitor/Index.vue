
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
        <button class="btn refresh" @click="refresh">
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
   
      <MonitorVideoBox v-show="!showForm" :nowPicNum="picChoose"></MonitorVideoBox>
   
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
import bus from "../../assets/js/bus";
import Nav from "../Nav";
import TabView from "../VideoMeeting/TabView";
import PlanList from "./PlanList";
import PlanForm from "./PlanForm";
import MonitorList from "./MonitorList";
import MonitorChildren from "./MonitorChildren";
import MonitorVideoBox from "./MonitorVideoBox";
import {
  queryMonitorsMenu,
  queryMonitorList,
  loginInSmc,
  queryScheduleConferences,
  addSiteToMeeting
} from "../../api/api";
// import { get } from "../../api/http";

export default {
  data() {
    return {
      picChoose: 9,

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

  },
  mounted() {
    this.refresh();
  },
  activated(){
    this.refresh();
  },
  components: {
    Nav,
    TabView,
    PlanList,
    PlanForm,
    MonitorList,
    MonitorChildren,
    MonitorVideoBox
  },

  methods: {
    createLoading(dom) {
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
      this.getPlans();
    this.getAllMonitors();
    loginInSmc().then(res => {
      if (res.ret == "ok") {
        this.getAllMeetings();
      } else {
        this.$message.error(res.msg);
      }
    });
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
      console.log(params)
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
      console.log(this.joinInfo)
      let params = {
        siteUri: this.joinInfo.code,
        siteName: this.joinInfo.name||this.joinInfo.monitorName,
        siteType: '',
        meetId: meeting.id.confInternalId
      };

      addSiteToMeeting(params).then(res => {
        if (res.ret == "ok") {
          this.$message.success("加入成功");
        } else {
          this.$message.error(res.msg);
        }
      });
      this.showList = false;
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
    }
  }
};
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
      background-color: rgba(11, 33, 58, 0.582);
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