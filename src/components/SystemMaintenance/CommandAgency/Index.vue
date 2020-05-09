<!--  -->
<template>
  <div>
    <div class="search-bar" style="margin-bottom:20px;">
      <el-row :gutter="30" style="margin-bottom:20px;">
        <el-col :span="6">
          <label for="name" class>名称：</label>
          <el-input size="small" id="name" v-model="searchInfo.jgmc"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="code">编码：</label>
          <el-input size="small" id="code" v-model="searchInfo.jgbm"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="administrativeLevel">行政级别：</label>
          <el-select
            v-model="searchInfo.xzqhjb"
            id="administrativeLevel"
            size="small"
            clearable
            @change="levelChange"
          >
            <el-option
              v-for="(item,index) in regionLevels"
              :key="item"
              :label="item"
              :value="index+1"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" size="small" @click="searchAgency" style="margin-left:50px">查询</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="30">
        <el-col :span="6">
          <label for="duty" class>职能：</label>
          <el-input size="small" id="duty" v-model="searchInfo.znms"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="parentBody">上级机构：</label>
          <el-select
            size="small"
            value-key="id"
            v-model="searchInfo.sjjgid"
            filterable
            clearable
            @visible-change="searchParentBody"
            :loading="isSearchingParent"
          >
            <el-option
              v-for="item in parentBodyData"
              :key="item.id"
              :label="item.zzjgmc"
              :value="item.id"
            ></el-option>
          </el-select>
          <!-- <el-autocomplete
            size="small"
            v-model="searchInfo.sjjgmc"
            :fetch-suggestions="searchParentBody"
                @select="selectParentBody"
            suffix-icon="el-icon-search"
          ></el-autocomplete>-->
        </el-col>
        <el-col :span="6">
          <label for="region">行政区域：</label>
          <el-cascader
            id="region"
            v-model="searchInfo.xzqhid"
            :options="options"
            clearable
            ref="cascader"
            filterable
            size="small"
            :show-all-levels="false"
            :props="{ expandTrigger: 'hover',value:'id',label:'xzqhmc',checkStrictly : true }"
            @change="regionChange"
          ></el-cascader>
        </el-col>
        <el-col :span="6"></el-col>
      </el-row>
    </div>
    <el-button
      v-if="$store.state.hasCompetence"
      style="margin-bottom:20px;"
      type="primary"
      size="small"
      @click="openAddForm"
    >新增</el-button>
    <el-table
      :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      style="width: 100%;margin-bottom:14px;"
     max-height="600"
    >
      <el-table-column type="index" label="序号" :index="indexMethod"></el-table-column>
      <el-table-column prop="zzjgmc" label="名称"></el-table-column>
      <el-table-column prop="zzjgbm" label="编码"></el-table-column>
      <el-table-column
        prop="administrativeDivision.xzqhjb"
        :formatter="formatterLevel"
        label="行政级别"
      ></el-table-column>
      <el-table-column prop="sjjgmc" label="上级机构"></el-table-column>
      <el-table-column prop="administrativeDivision.xzqhmc" label="所属行政区域"></el-table-column>

      <el-table-column v-if="$store.state.hasCompetence" label="操作">
        <template slot-scope="scope">
          <span class="option" @click="openEditForm(scope.row)">修改</span>
          <el-popconfirm title="确定删除吗？" @onConfirm="deleteItem(scope.row)">
            <span class="option" slot="reference">删除</span>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
     <el-pagination
      :current-page.sync="currentPage"
      :page-size="pageSize"
      layout="prev, pager, next, jumper"
      :total="tableData.length">
    </el-pagination>
    <AddEditForm
      :dialogVisible.sync="showForm"
      :title="formTitle"
      :parentData="allData"
      :form="formData"
      @refresh="getAgencyTable"
      @openAddMemberForm="openAddMemberForm"
    ></AddEditForm>
    <AddMemberForm
      :show.sync="showAddMemberForm"
      :jgid="nowJgid"
      @refresh="getAgencyTable"
      ref="member"
    ></AddMemberForm>
  </div>
</template>

<script>
import AddEditForm from "./AddEditForm";
import AddMemberForm from "./AddMemberForm";
import { regionData } from "../../../assets/js/regionData";
import { queryOganization, deleteOganization } from "../../../api/api";
export default {
  data() {
    return {
      allData: [],
      nowJgid: "",
      searchInfo: {
        xzqhjb: null,
        xzqhid: null,
        sjjgmc: null,
        jgbm: null,
        jgmc: null,
        znms: null
      },
      nowLevel: "",
      regionLevels: ["省部级", "地市级", "县处级"],
      options: regionData,
      loading: false,
      tableData: [],
      currentPage:1,
      pageSize:30,
      parentBodyData: [],
      isSearchingParent: false,
      showForm: false,
      formTitle: "",
      cas: {
        background: "burlywood"
      },
      formData: {
        zzjgbm: "",
        zzjgmc: "",
        parent: {},
        znms: "",
        formatTime: "",
        administrativeDivision: {
          id: "",
          xzqhjb: "",
          xzqhmc: ""
        },
        leader: { id: null, xm: null },
        liaison: { id: null, xm: null }
      },
      showAddMemberForm: false,
      memberData: {}
    };
  },
  components: { AddEditForm, AddMemberForm },
  created() {
    this.getAgencyTable({});
  },

  methods: {
     indexMethod(index){
      return (this.currentPage-1)*this.pageSize+index+1;
    },
    regionChange(value) {
      console.log(value);
      let nodesObj = this.$refs["cascader"].getCheckedNodes();
      if (nodesObj.length == 1) {
        this.searchInfo.xzqhjb = nodesObj[0].data.xzqhjb;
        this.nowLevel = nodesObj[0].data.xzqhjb;
      }
    },
    openAddForm() {
      this.formData = {
        zzjgbm: "",
        zzjgmc: "",
        sjjgid: "",
        znms: "",
        formatTime: "",
        xzqhjb: "",
        administrativeDivision: {
          id: "",
          xzqhjb: "",
          xzqhmc: ""
        },
        leader: null,
        liaison: null
      };
      this.formTitle = "新增指挥机构";
      this.showForm = true;
      console.log(this.formData);
    },
    openEditForm(data) {
      let formData = Object.assign({}, data);
      this.formData = formData;
      this.formTitle = "修改指挥机构";
      this.showForm = true;
    },
    deleteItem(item) {
      deleteOganization({ orgId: item.id }).then(res => {
        if (res.ret == "ok") {
          this.getAgencyTable();
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    getAgencyTable(params) {
      this.loading = true;
      queryOganization(params).then(res => {
        this.loading = false;
        if (res.ret == "ok") {
          this.allData = res.content;
          this.tableData = res.content;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    formatterLevel(row) {
      if (row.administrativeDivision) {
        return this.regionLevels[
          parseInt(row.administrativeDivision.xzqhjb) - 1
        ];
      }
    },
    searchAgency() {
      if (this.searchInfo.xzqhid) {
        this.searchInfo.xzqhid = this.searchInfo.xzqhid.toString();
        console.log(this.searchInfo.xzqhid);
      }

      this.loading = true;
      queryOganization(this.searchInfo).then(res => {
        this.loading = false;
        if (res.ret == "ok") {
          this.tableData = res.content;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    searchParentBody(val) {
      if (val) {
        this.isSearchingParent = true;
        queryOganization().then(res => {
          this.isSearchingParent = false;
          if (res.ret == "ok") {
            this.parentBodyData = res.content;
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    levelChange(item) {
      if (item != this.nowLevel) {
        this.searchInfo.xzqhmc = "";
      }
      console.log(this.searchInfo.xzqhjb, item);
    },
    openAddMemberForm(id) {
      this.nowJgid = id;
      this.$refs.member.getPersons({});
      this.showAddMemberForm = true;
    }
  }
};
</script>
<style lang="scss" scoped>
.el-button {
  min-width: 80px;
  border-radius: 6px;
}


.cas {
  background-color: burlywood;
}
</style>