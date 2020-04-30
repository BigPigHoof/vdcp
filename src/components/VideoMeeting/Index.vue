
<!--  -->
<template>
  <div class="content">
    <div class="left">
      <div class="module-head"></div>
      <el-input class="search-input" v-model="searchValue" @input="showAll">
        <i slot="suffix" class="el-input__icon el-icon-search" @click="search"></i>
      </el-input>
      <TabView :heads="['会场列表','联系人']" :totals="[sitesTotal,contactsTotal]" ref="tabView">
        <template v-slot:left>
          <div class="scroll-content" style="height:520px;">
            <PlanList v-show="!showSearchSiteList" :model="plansData" ref="plan" :meetingList="allMeetings"></PlanList>
            <SiteList v-show="!showSearchSiteList" :model="sitesData" ref="site" :meetingList="allMeetings"></SiteList>
            <SiteChildren v-show="showSearchSiteList" :list="searchSiteList"></SiteChildren>
          </div>
        </template>
        <template v-slot:right>
          <div class="contacts scroll-content" style="height:520px;">
            <ContactList :allData="searchContactList" ref="contact"></ContactList>
          </div>
        </template>
      </TabView>
      <el-row style="margin-top:60px;">
        <el-col :span="12" style="display:none">
          <div class="passageway">
            <label for="passageway">通道数:</label>
            <select name="passageway" id="passageway" v-model="passageway">
              <option value="0">0</option>
              <option v-for="item in 10" :key="item" :value="item">{{item}}</option>
            </select>
          </div>
        </el-col>
        <el-col :span="12" class="btns">
          <button class="btn refresh" @click="refresh">刷新</button>
          <button
            :disabled="isStarting?'disabled':false"
            class="btn call-meeting"
            @click="callMeeting"
          >
            <i class="el-icon-loading" v-show="isStarting"></i>
            <span>呼叫会议</span>
          </button>
        </el-col>
      </el-row>
    </div>
    <div class="mid">
      <Nav></Nav>
      <div class="tab-box" v-show="!showForm">
        <div class="mid-tab">
          <span class="item" :class="{active:nowMidTab=='tree'}" @click="toTab('tree')">树形图</span>
          <span class="item" :class="{active:nowMidTab=='video'}" @click="toTab('video')">会议预览</span>
        </div>
        <div class="mid-content">
          <transition-group name="el-fade-in-linear">
            <div class="tree-chart" id="treeChart" v-show="nowMidTab=='tree'" key="tree"></div>
              
            <TransTest v-show="nowMidTab=='video2'" key="video2">
  
            </TransTest>
          </transition-group>
          
            <!-- <transition name="el-fade-in-linear">

            <TransTest v-show="nowMidTab=='video'"></TransTest>
          </transition> -->
        </div>
      </div>
      <PlanForm
        :show.sync="showForm"
        :formData="formData"
        :sitesData="sitesData"
        @getPlans="getPlans"
      ></PlanForm>
    </div>
    <div class="right">
      <Dial :meetingId="nowMeetingId" :meetings="allMeetings" @refresh="getAllMeetings"></Dial>
      <MeetingInfo
        :meetingList="allMeetings"
        :meetingSites="meetingSites"
        :meetId="nowMeetingId"
        @refresh="getConfSitesStatus"
        ref="meetingInfo"
      ></MeetingInfo>
    </div>
    <ul ref="box" class="meeting-list" v-show="showList" :style="{top:top}">
      <li v-for="item in allMeetings" :key="item.id.confInternalId" @click.stop="addToMeeting(item)">{{item.name+'会议'}}</li>
    </ul>
  </div>
</template>

<script>
import bus from "../../assets/js/bus";
import Nav from "../Nav";
import TabView from "./TabView";
import SiteList from "./SiteList";
import PlanList from "./PlanList";
import ContactList from "./ContactList";
import Dial from "./Dial";
import MeetingInfo from "./MeetingInfo";
import PlanForm from "./PlanForm";
import SiteChildren from "./SiteChildren";
import TransTest from "./TransTest";
import {
  loginInSmc,
  getAllSites,
  startMeeting,
  addSiteToMeeting,
  queryConfSitesStatus,
  queryScheduleConferences,
  querySitesMenu,
  queryContactList
} from "../../api/api";
import { get, } from "../../api/http";
export default {
  data() {
    return {
      searchValue: "",
      searchSiteList:[],
      searchContactList:[],
      showSearchSiteList:false,
      isSmcLogin: false,
      sitesData: {},
      allSites:[],
      plansData: {},
      sitesProps: {
        children: "siteChiidren",
        label: "orgName"
      },
      passageway: 5,
      isStarting: false,
      nowMidTab: "tree",
      treeChart: null,
      allMeetings: [],
      allContacts: [],
      meetingSites: [],
      nowMeetingId: "",
      showForm: false,
      formData: {},
      checkedSites: [],
      testD: {},
      sitesTotal: "",
      contactsTotal: "",
      showList: false,
      joinInfo: {},
      top: 0
    };
  },
  components: {
    Nav,
    TabView,
    SiteList,
    Dial,
    MeetingInfo,
    PlanForm,
    PlanList,
    ContactList,
    SiteChildren,
    TransTest
  },
  computed: {},
  created() {
    const that = this;
    document.addEventListener("click", () => {
      that.showList = false;
    });
  },
  mounted() {
// /* eslint-disable */ 
//     // login();
//     const callb=function(data){
//       console.log(data)
//     };
//     tsdkClient.queryConferenceList({confRight:1,isIncludeEnd:0,pageIndex:1,pageSize:100},callb);
    loginInSmc().then(res => {
      if (res.ret == "ok") {
        this.getAllSites();
        this.getAllMeetings();
      }else{
        this.$message.error(res.msg);
      }
    });
    this.initTreeChart();
    this.getPlans();
    this.getAllContacts();
    bus.$on("openForm", this.openPlanForm);
    bus.$on("checkChange", this.checkedChange);
    bus.$on("openMeetingList", this.openList);
  },
  methods: {
    getAllSites() {
      const loading = this.createLoading(".tab-wrapper .scroll-content");
      getAllSites().then(res => {
        loading.close();
        if (res.ret == "ok") {
          let total = 0;
          this.sitesData = res.content;
          const getTotal = data => {
            total += data.siteChiidren.length;
            this.allSites=this.allSites.concat(data.siteChiidren);
            if (data.orgChildren.length > 0) {
              for (const item of data.orgChildren) {
                getTotal(item);
              }
            }
          };
          getTotal(res.content);
          console.log(this.allSites)
          this.sitesTotal = total;
        }
      });
    },
    createLoading(dom) {
      return this.$loading({
        target: document.querySelector(dom),
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0)"
      });
    },
    callMeeting() {
      let { name, mainSiteUri } = this.$store.state.mainSite;
      let sites = this.$store.state.selectedSites;
      if (sites.length == 0 && !mainSiteUri) {
        this.$message.warning("请选择会场");
      } else if (sites.length == 1 && !mainSiteUri) {
        this.$message.warning("请选择主会场");
      } else if (sites.length == 1 && sites[0].uri == mainSiteUri) {
        this.$message.warning("请选择分会场");
      } else {
        sites = sites.map(item => ({ name: item.name, uri: item.uri }));
        if (sites.length > 1 && !mainSiteUri) {
          name = sites[0].name;
          mainSiteUri = sites[0].uri;
        }
        let params = {
          name,
          mainSiteUri,
          sites,
          // monitorChannelCount: this.passageway,
          contacts: this.$refs.contact.selectedContacts,
          rate: "1920k"
        };
        this.isStarting = true;
        startMeeting(params).then(res => {
          this.isStarting = false;
          if (res.ret == "ok") {
            this.$message.success("呼叫成功");
            this.$store.state.selectedSites = [];
            this.$store.state.mainSite = {
              name: "",
              mainSiteUri: ""
            };
            this.$refs.contact.selectedContacts = [];
            this.nowMeetingId=res.content[0].id.confInternalId;
             this.getAllMeetings();
            // this.allMeetings.push(res.content[0]);
            // this.getConfSitesStatus(res.content[0].id.confInternalId);
          } else {
            this.$message.error(res.msg);
          }
          console.log(res);
        });
      }

      console.log(11);
    },
    refresh() {
      this.getAllSites();
      this.getAllContacts();
    },
    toTab(name) {
      this.nowMidTab = name;
    },
    initTreeChart() {
      this.treeChart = this.$echarts.init(document.getElementById("treeChart"));
      this.treeChart.showLoading("default", {
        text: "loading",
        color: "#c23531",
        textColor: "#fff",
        maskColor: "rgba(255, 255, 255, 0)",
        zlevel: 0
      });
      get(`./map/${window.config.mapName}.json`).then(jsonData => {
        let regionArr = [];
        for (const item of jsonData.features) {
          regionArr.push(item.properties.name);
        }
        let option = {
          tooltip: {
            trigger: "item",
            triggerOn: "mousemove",
            formatter: function(e) {
              if (e.value == undefined) {
                return "";
              } else {
                return e.name + "：" + e.value;
              }
            }
          },
          series: [
            {
              type: "tree",

              data: [
                {
                  name: window.config.mapName,
                  children: formatterCityRegion(regionArr)
                }
              ],

              left: "2%",
              right: "2%",
              top: "8%",
              bottom: "20%",
              symbol: "rect",
              symbolSize: [80, 30],
              orient: "vertical",
              expandAndCollapse: true,
              itemStyle: {
                color: "rgba(128, 128, 128,0)",
                borderWidth: 0
              },
              label: {
                position: "inside",
                verticalAlign: "middle",
                align: "center",
                fontSize: 18,
                padding: [5, 20, 5, 20],
                color: "#000",
                backgroundColor: "#FFD153",
                borderColor: "#B78600",
                borderWidth: 2,
                borderRadius: 2
              },

              leaves: {
                itemStyle: {
                  color: "rgba(128, 128, 128,0)"
                },
                label: {
                  position: "inside",
                  verticalAlign: "middle",
                  align: "center",
                  fontSize: 18,
                  padding: [5, 20, 5, 20],
                  color: "#000",
                  backgroundColor: "#ACC7EF",
                  borderWidth: 0
                }
              },
              lineStyle: {
                color: "#31BAF2"
              },

              animationDurationUpdate: 750
            }
          ]
        };
        this.treeChart.hideLoading();
        this.treeChart.setOption(option);
      });
    },
    getConfSitesStatus(meetId) {
      // this.nowMeetingId = meetId;
      this.meetingSites = [];
      const loading = this.createLoading(".site-list.scroll-content");
      queryConfSitesStatus({ meetId }).then(res => {
        loading.close();
        if (res.ret == "ok") {
          // this.$refs["meetingInfo"].show = false;
          this.nowMeetingId = meetId;
          this.meetingSites = res.content[0];
        }
      });
    },
    getAllMeetings() {
       const loading = this.createLoading(".meeting-list");
      queryScheduleConferences().then(res => {
         loading.close();
        if (res.ret == "ok") {
          this.allMeetings = res.content;
          if (res.content.length > 0) {
            this.nowMeetingId = this.nowMeetingId
              ? this.nowMeetingId
              : res.content[0].id.confInternalId;
            this.getConfSitesStatus(this.nowMeetingId);
          }
        }else{
          this.$message.error(res.msg);
        }
      });
    },
    getAllContacts() {
      const loading = this.createLoading(".contacts");
      queryContactList().then(res => {
        loading.close();
        if (res.ret == "ok") {
          this.contactsTotal = res.content.length;
          this.allContacts = res.content;
          this.searchContactList=res.content;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getPlans() {
      querySitesMenu().then(res => {
        if (res.ret == "ok") {
          this.plansData = res.content;
        }
      });
    },
    openPlanForm(formData) {
      if (!this.sitesData.orgId) {
        this.$message.warning("目前没有会场信息");
        return;
      }
      this.formData = formData;
      this.showForm = true;
      console.log(formData);
    },
    checkedChange(params) {
      console.log(params);
      if (!params[0].target.checked) {
        let index = this.$store.state.selectedSites.findIndex(
          item => item.uri == params[1]
        );
        if (index > -1) {
          this.$store.state.selectedSites.splice(index, 1);
        }

        if (params[1] == this.$store.state.mainSite.mainSiteUri) {
          this.$store.state.mainSite = {
            name: "",
            mainSiteUri: ""
          };
        }
      }
    },
    openList(params) {
        console.log('allMeetings:',this.allMeetings);
      console.log('params:',params);
      if (this.allMeetings.length == 0) {
        this.$message.warning("暂无会议");
      } else {
      
        this.joinInfo = params[0];
        this.top = params[1].pageY - params[1].offsetY + 8 + "px";
        this.showList = true;
        return false;
      }
    },
    addToMeeting(meeting) {
      let { uri, name } = this.joinInfo;
      let type = this.joinInfo.type
        ? this.joinInfo.type.value
        : "SiteType_VoIpSip";
      // let arr = type == "SiteType_Sip" ? meeting.sites : meeting.contacts;
      // if (arr.findIndex(item => item.uri == uri) > -1) {
      //   this.$message.warning("已在会议中");
      // } else {
        let params={
          siteUri:uri,
          siteName:name,
          siteType:type,
          meetId:meeting.id.confInternalId
        }
       
        addSiteToMeeting(params).then(res => {
          if (res.ret == "ok") {
            this.$message.success("加入成功");
            this.getConfSitesStatus(meeting.id.confInternalId);
          } else {
            this.$message.error(res.msg);
          }
        });
        this.showList = false;
      // }
    },
    search(){
      if(this.searchValue){
        const value=this.searchValue;
        if(this.$refs.tabView.nowTab=='left'){
          this.searchSiteList=this.allSites.filter(item=>(item.name.indexOf(value)>-1||item.uri.indexOf(value)>-1));
          this.showSearchSiteList=true;
        }else{
          console.log(this.allContacts);
          this.searchContactList=this.allContacts.filter(item=>{
       
            return (item.xm?item.xm.indexOf(value)>-1:false||item.yddh?item.yddh.indexOf(value)>-1:false)
            });
        }
      }else{
        this.showSearchSiteList=false;
      }
    },
    showAll(value){
      if(!value){
        this.showSearchSiteList=false;
         this.searchContactList=this.allContacts;
      }
    }
  }
};
function formatterCityRegion(data) {
  if (Array.isArray(data)) {
    let children = [];
    let len = data.length;
    let l1 = Math.floor(len / 2),
      l2 = len - l1;
    if (l1 % 2 != 0) {
      l1--;
      l2 = len - l1;
    }
    for (let i = 0; i < l1; i++) {
      children.push({
        name: data[i],
        value: 0
      });
    }

    children.splice(l1 / 2, 0, {
      name: "level",
      children: [],
      label: {
        show: false
      },
      itemStyle: {
        opacity: 0
      }
    });
    for (let i = 0; i < l2; i++) {
      children[l1 / 2].children.push({
        name: data[i + l1],
        value: 0
      });
    }
    console.log(children);
    return children;
  }
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
    background: url("../../assets/img/首页/右侧背景.png") no-repeat bottom;
  }
  .mid {
    position: relative;
    flex-grow: 1;
    padding: 0 20px;
    box-sizing: border-box;
  }
}
.passageway {
  margin-top: 8px;
  padding: 0 20px;
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
  }
  option {
    background-color: #092439;
    border: none;
    outline: none;
    line-height: 20px;
  }
}
.btns {
  text-align: center;
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
    margin-right: 6px;
  }
  .call-meeting {
    color: #ffffff;
    background: #55c26e;
    border: 2px solid #2b663f;
  }
}
.mid-tab {
  margin: 30px 0;
  width: 284px;
  height: 70px;
  text-align: center;
  .item {
    cursor: pointer;
    font-size: 18px;
    line-height: 50px;
    display: inline-block;
    width: 127px;
    height: 57px;
    background: url("../../assets/img/视频会商/tab未选中.png") no-repeat top
      left;
    &.active {
      color: #fbcc36;
      background: url("../../assets/img/视频会商/tab选中.png") no-repeat top
        left;
    }
  }
}
.mid-content {
  width: 100%;
  height: 700px;
  background: #162637;
  border-radius: 6px;
  .tree-chart {
    width: 100%;
    height: 700px;
  }
}
.meeting-list {
  position: absolute;
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
input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  position: relative;
  margin: 0;
}

input[type="checkbox"]:after {
  position: absolute;
  width: 16px;
  height: 16px;
  top: 0;
  content: "";
  color: #fff;
  display: inline-block;
  box-sizing: border-box;
  border-radius: 2px;
  background: #e2e2e2;
  border: 1px solid #ffffff;
}

input[type="checkbox"]:checked:after {
  content: "";
  background-color: #008eff;
  border: 2px solid #cbe5ff;
}
</style>