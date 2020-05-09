<!--  -->
<template>
  <div>
    <div class="search-bar" style="margin-bottom:20px;">
      <el-row :gutter="30">
        <el-col :span="6">
          <label for="name" class>账号：</label>
          <el-input size="small" id="name" v-model="searchInfo.userName"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="role">类型：</label>
          <el-select id="role" size="small" v-model="searchInfo.roleId" clearable>
            <el-option v-for="(item,index) in roles" :key="index" :label="item" :value="index+1"></el-option>
     
          </el-select>
     
        </el-col>
        <el-col :span="6">
          <label for="status">状态：</label>
          <el-select id="status" size="small" v-model="searchInfo.status" clearable>
            <el-option label="失效" :value="0"></el-option>
            <el-option label="生效" :value="1"></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" size="small" style="margin-left: 50px;" @click="search">查询</el-button>
        </el-col>
      </el-row>
    </div>
    <el-button v-if="$store.state.hasCompetence" type="primary" size="small"  style="margin-bottom:20px;" @click="openForm('add')">新增</el-button>
    <el-table
      :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      style="width: 100%;margin-bottom:14px;"
      max-height="600"
    >
      <el-table-column type="index" label="序号" :index="indexMethod"></el-table-column>
      <el-table-column prop="dsUserName" label="账号"></el-table-column>
      <el-table-column prop="roleId" label="类型" :formatter="formatterRole"></el-table-column>
      <el-table-column prop="status" label="状态" :formatter="formatterStatus"></el-table-column>
      <el-table-column prop="personName" label="关联人员"></el-table-column>

      <el-table-column v-if="$store.state.hasCompetence" label="操作">
        <template slot-scope="scope">
          <span class="option" @click=" openForm('edit',scope.row)">修改</span>
          <el-popconfirm title="确定删除吗？" @onConfirm="deleteItem(scope.row.id)">
            <span class="option" slot="reference">删除</span>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page.sync="currentPage"
      :page-size="pageSize"
      layout="prev, pager, next, jumper"
      :total="tableData.length"
    ></el-pagination>
  <AssignForm :show.sync="showForm" :type="formType" :form="formData"  ref="assignForm" @refresh="getAccounts({})"></AssignForm>
  </div>
</template>

<script>
import { queryAccountList,deleteAccountInfo } from "../../../api/api";
import AssignForm from "./AssignForm";
export default {
  data() {
    return {
      roles: ["系统管理员", "指挥员", "高级用户", "一般用户"],
      searchInfo: {
        userName: "",
        roleId: "",
        status: ""
      },
      isChecked: false,
      allAccountsData: [],
      tableData: [],
      currentPage: 1,
      pageSize: 30,
      loading: false,
      showForm:false,
      formType:'add',
      formData:{},
    };
  },
    components: { AssignForm },
  created() {
    this.getAccounts({});
  },
  methods: {
    indexMethod(index) {
      return (this.currentPage - 1) * this.pageSize + index + 1;
    },
    getAccounts(params) {
      this.loading=true;
      queryAccountList(params).then(res => {
        this.loading=false;
        if (res.ret == "ok") {
          console.log(res);
          this.allAccountsData = res.content;
          this.tableData = res.content;
        }
      });
    },
    search(){
      this.currentPage=1;
      this.getAccounts(this.searchInfo);
    },
    formatterRole(row) {
      return this.roles[parseInt(row.roleId)-1];
    },
    formatterStatus(row) {
      return row.status ? "生效" : "失效";
    },
    openForm(type,data){
      this.formType=type;
      if(type=='add'){
        this.formData= {
        dsUserName: "",
        dsPassWord: "",
        repeatPassword: "",
        smcUserName: "",
        smcPassWord: "",
        smcIP: "",
        smcHcUr: "",
        smcHcPwd: "",
        roleId: "",
        remark: "",
        status:1
      }
      }else{
         this.formData= Object.assign({}, data);
         this.formData.roleId=parseInt(this.formData.roleId);
      }
      this.showForm=true;
    },
    deleteItem(userId){
      deleteAccountInfo({userId}).then(res=>{
        if(res.ret=='ok'){
          this.getAccounts({})
        }else{
          this.$message.error(res.msg)
        }
      })
    }
  }
};
</script>
<style lang="scss" scoped>
</style>