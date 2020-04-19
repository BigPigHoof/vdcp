<!--  -->
<template>
  <transition name="el-fade-in-linear">
    <div class="form-box" v-show="show">
      <div class="head">
        <span class="title">{{formData.name}}</span>
        <i class="el-icon-close" @click="close"></i>
      </div>
      <div class="form">
        <el-row>
          <el-col :span="12">
            <label for="name">修改名称:</label>
            <el-input
              v-model="name"
              style="width:250px;margin:0 20px;"
              size="small"
              autocomplete="off"
            ></el-input>
            <el-button type="primary" size="small" @click="modifyName">保存</el-button>
          </el-col>
          <el-col :span="12" style="text-align:right;">
            <el-button type="primary" size="small" @click="dialogVisible=true">新建子目录</el-button>
            <el-popconfirm title="确定删除吗？" @onConfirm="deletePlan">
              <el-button
                slot="reference"
                :loading="isdeleting"
                type="primary"
                size="small"
                style="margin-right:60px;margin-left:15px"
              >删除目录</el-button>
            </el-popconfirm>
          </el-col>
        </el-row>
        <el-row style="margin:58px 0;">
          <el-col :span="12">
            <el-cascader
              ref="select"
              style="width:448px;"
              v-model="nowOrgId"
              :options="[sitesData]"
              :show-all-levels="false"
              size="small"
              filterable
              @change="chooseOrg"
              :props="{ expandTrigger: 'hover',value:'orgId',label:'orgName',children:'orgChildren' ,checkStrictly : true}"
            ></el-cascader>
          </el-col>
          <el-col :span="12" style="text-align:right;">
            <label for="name">查询条件:</label>
            <el-input v-model="searchValue" style="width:250px;margin:0 20px;" size="small" autocomplete="off"></el-input>
            <el-button type="primary" size="small" style="margin-right:60px;" @click="search">查询</el-button>
          </el-col>
        </el-row>
        <div>
          <el-transfer
            :props="{
              key: 'uri',
              label: 'name'
            }"
            :titles="['所有', '已选']"
            v-model="rightPageData"
            :data="leftPageData"
            @right-check-change="checkChange"
            target-order="unshift"
            style="display:inline-block;width:calc(100% - 60px);"
            @change="changeRightPageData"
          ></el-transfer>
          <div class="btns">
            <el-button
              :disabled="upDisabled"
              type="primary"
              icon="el-icon-arrow-up"
              style="margin-bottom:10px;"
              @click="up"
            ></el-button>
            <el-button
              :disabled="downDisabled"
              type="primary"
              icon="el-icon-arrow-down"
              @click="down"
            ></el-button>
          </div>
        </div>
        <div class="page-box">
          <el-pagination
            background
            class="page"
            @current-change="changeLeft"
            small
            :page-size="pageSize"
            style="margin-right:100px;"
            layout="prev, pager, next"
            :total="allLeftData.length"
          ></el-pagination>
        </div>
        <div style="text-align:center;margin-top:42px;">
          <el-button :loading="isUpdating" type="primary" size="small" @click="addSites">确认</el-button>
        </div>
      </div>
      <el-dialog
        title="新建子目录"
        :visible.sync="dialogVisible"
        :modal="false"
        width="40%"
        @close="resetAddChild"
      >
        <div style="text-align:center;">
          <label for="newChild" style="color:#ffffff">名称：</label>
          <el-input
            style="width:250px;"
            size="small"
            v-model="newChildName"
            name="childName"
            id="newChild"
          ></el-input>
        </div>

        <span slot="footer" class="dialog-footer" style="display:block;text-align:center;">
          <el-button size="small" @click="dialogVisible = false">取 消</el-button>
          <el-button size="small" :loading="isAddingChild" type="primary" @click="addChild">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </transition>
</template>

<script>
import { upGo, downGo } from "../../assets/js/function";
import {
  updateSitesMenu,
  addSitesMenu,
  deleteSitesMenu,
  addSites
} from "../../api/api";
export default {
  props: ["show", "formData", "sitesData"],
  data() {
    return {
      pageSize: 100,
      name: "",
      searchValue:'',
      allLeftData: [],
      leftPageData: [],
      rightPageData: [],
      nowOrgId: "",
      nowOrgSitesData:{},
      allRightData: [],
      upDisabled: "disabled",
      downDisabled: "disabled",
      rightChecked: [],
      isdeleting: false,
      dialogVisible: false,
      newChildName: "",
      isAddingChild: false,
      isUpdating: false
    };
  },
  computed: {},
  watch: {
    show: function(val,old) {
      if (val == true && old==false) {
      this.resetForm();
      }
    },
  formData: function() {

      this.resetForm();
      
    }
  },
  mounted() {
    console.log(this.sitesData.orgId);
  },
  methods: {
    close() {
      this.allLeftData = [];
      this.leftPageData = [];
      this.rightPageData = [];
      this.searchValue='';
      (this.nowOrgId = ""), this.$emit("update:show", false);
    },
    checkChange(e) {
      this.rightChecked = e;
      if (e.length == 1 && this.rightPageData.length > 1) {
        this.upDisabled = false;
        this.downDisabled = false;
      } else {
        this.upDisabled = "disabled";
        this.downDisabled = "disabled";
      }
    },
    up() {
      let index = this.rightPageData.findIndex(
        item => item == this.rightChecked[0]
      );
      upGo(this.rightPageData, index);
      console.log(this.rightPageData);
    },
    down() {
      let index = this.rightPageData.findIndex(
        item => item == this.rightChecked[0]
      );
      downGo(this.rightPageData, index);
      console.log(this.rightPageData);
    },
    deletePlan() {
      this.isdeleting = true;
      deleteSitesMenu({ menuId: this.formData.id }).then(res => {
        this.isdeleting = false;
        if (res.ret == "ok") {
          this.$message.success("删除成功");
          this.close();
          this.$emit("getPlans");
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    addChild() {
      if (this.newChildName.trim() == "") {
        this.$message.warning("名称不能为空");
        return;
      }
      this.isAddingChild = true;
      addSitesMenu({
        parentId: this.formData.id,
        name: this.newChildName
      }).then(res => {
        this.isAddingChild = false;
        if (res.ret == "ok") {
          this.$message.success("添加成功");
          this.$emit("getPlans");
          this.dialogVisible = false;
          this.newChildName = "";
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    resetAddChild() {
      this.newChildName = "";
      this.isAddingChild = false;
    },
    changeLeft(page) {
      this.leftPageData = this.allLeftData.slice(
        (page - 1) * this.pageSize,
        page * this.pageSize
      );
      const dom = document.querySelector(".el-checkbox-group");
      dom.scrollTop = 0;
      console.log(this.rightPageData);
    },
    changeRight(page) {
      this.rightPageData = this.allRightData.slice(
        (page - 1) * this.pageSize,
        page * this.pageSize
      );
      const dom = document.querySelectorAll(".el-checkbox-group")[1];
      dom.scrollTop = 0;
      console.log(this.rightPageData);
    },
    changeRightPageData(val) {
      console.log(val, this.rightPageData);
    },
    modifyName() {
      updateSitesMenu({ id: this.formData.id, name: this.name }).then(res => {
        if (res.ret == "ok") {
          this.formData.name = this.name;
          this.name = "";
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    chooseOrg() {
      this.nowOrgSitesData=this.$refs.select.getCheckedNodes()[0].data.siteChiidren;
      this.allLeftData = this.$refs.select.getCheckedNodes()[0].data.siteChiidren;
      this.leftPageData = this.allLeftData.slice(0, 20);
    },
    addSites() {
      this.isUpdating = true;
      let sites = [];
      for (const item of this.rightPageData) {
        for (const site of this.allLeftData) {
          if (item == site.uri) {
            let { name, uri } = site;
            sites.push({ siteName: name, siteUri: uri });
          }
        }
      }

      console.log(sites);
      addSites({ menuId: this.formData.id, sites }).then(res => {
        this.isUpdating = false;
        if (res.ret == "ok") {
          this.$emit("getPlans");
          this.close();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    search(){
      let val=this.searchValue.trim();
        this.allLeftData=this.nowOrgSitesData.filter(item=>{return item.name.indexOf(val)>-1});
          this.leftPageData = this.allLeftData.slice(0, this.pageSize);
      
    },
    resetForm(){
         this.nowOrgId = this.sitesData.orgId;
        this.nowOrgSitesData=this.sitesData.siteChiidren;
        this.allLeftData = this.sitesData.siteChiidren;
        this.rightPageData=[];
        this.leftPageData = this.allLeftData.slice(0, this.pageSize);
        for (const site of this.formData.sites) {
          for (const item of this.leftPageData) {
            if (item.uri == site.uri) {
              this.rightPageData.push(item.uri);
            }
          }
        }
    }
  }
};
</script>
<style lang="scss" scoped>
.el-button--small {
  font-size: 14px;
  min-width: 80px;
  border-radius: 6px;
  padding: 8px 15px;
}
/deep/.el-transfer-panel {
  width: 448px;
}
/deep/.el-transfer__buttons {
  width: 50px;
  padding: 0 22px;
}
/deep/.el-transfer__button {
  width: 50px;
  padding: 12px;
}
/deep/.el-button + .el-button {
  margin: 0;
}
/deep/.el-transfer-panel {
  background: rgba(6, 15, 21, 0.62);
  border-color: #456c82;
}
/deep/.el-transfer-panel__list::-webkit-scrollbar {
  /*滚动条整体样式*/
  height: 6px;
  width: 6px;
}
/deep/.el-transfer-panel__list::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 10px;
  background: #12314c;
}
/deep/.el-transfer-panel .el-transfer-panel__header {
  background: none;
  border-color: #456c82;
}
/deep/.el-transfer-panel
  .el-transfer-panel__header
  .el-checkbox
  .el-checkbox__label,
/deep/.el-transfer-panel__item.el-checkbox {
  color: #ffffff;
}
/deep/.el-transfer-panel__item:hover {
  color: #23a0ff;
}
/deep/.el-pagination.is-background .el-pager li {
  height: 22px;
  border-radius: 50%;
}
/deep/.el-pagination.is-background .btn-prev,
/deep/ .el-pagination.is-background .btn-next {
  height: 22px;
  border-radius: 50%;
}
.form-box {
  width: calc(100% - 40px);
  padding: 6px;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
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
  .form {
    padding: 46px 24px;
    box-sizing: border-box;
    font-size: 18px;
    .btns {
      width: 50px;
      display: inline-block;
      vertical-align: middle;
      margin-left: 10px;
      /deep/.el-button--primary {
        width: 50px;
      }
    }
    .page {
      margin-top: 12px;
      display: inline-block;
      text-align: center;
      width: 436px;
    }
  }
}
</style>
