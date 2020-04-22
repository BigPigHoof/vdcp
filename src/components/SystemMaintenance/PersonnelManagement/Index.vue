<!--  -->
<template>
  <div>
    <div class="search-bar">
      <el-row :gutter="30">
        <el-col :span="6">
          <label for="name" class>姓名：</label>
          <el-input size="small" id="name" v-model="searchInfo.xm"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="code">用户名：</label>
          <el-input size="small" id="code" v-model="searchInfo.userName"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="parentBody">所属机构：</label>
          <el-select
            size="small"
            value-key="id"
            v-model="searchInfo.jgid"
            filterable
            clearable
            @visible-change="searchAgency"
            :loading="isSearchingAgency"
          >
            <el-option
              v-for="item in agencyData"
              :key="item.id"
              :label="item.zzjgmc"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <label for="code">职务：</label>
          <el-input size="small" id="code" v-model="searchInfo.zw"></el-input>
        </el-col>
      </el-row>
    </div>
    <div class="function">
      <el-checkbox @change="filterUser" v-model="isChecked">只显示有账号的用户账号名</el-checkbox>
      <div class="btns">
        <el-button type="primary" size="small" @click="openPersonForm('add')">新增</el-button>
        <el-button type="primary" size="small" @click="getPersons(searchInfo)">查询</el-button>
      </div>
    </div>
    <el-table
      :data="tableData"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      style="width: 100%"
      height="680"
    >
      <el-table-column prop="xm" label="名称"></el-table-column>
      <el-table-column prop="xb" label="性别" :formatter="formatterSex"></el-table-column>
      <el-table-column prop="yddh" label="移动电话"></el-table-column>
      <el-table-column prop="zzjgmc" label="所属机构"></el-table-column>
      <el-table-column prop="xtzh" label="已有账号"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <span class="option" @click="openAssignForm(scope.row)">分配</span>
          <span class="option" @click=" openPersonForm('edit',scope.row)">修改</span>
          <el-popconfirm title="确定删除吗？" @onConfirm="deleteItem(scope.row.id)">
            <span class="option" slot="reference">删除</span>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <PersonForm :show.sync="showPersonForm" ref="personForm" :title="formTitle" :form="formData" @refresh="getPersons"></PersonForm>
    <AssignForm :show.sync="showAssignForm" :person="person" ref="assignForm" @refresh="getPersons"></AssignForm>
  </div>
</template>

<script>
import { queryOganization, queryPerson, deletePerson } from "../../../api/api";
import PersonForm from "./PersonForm";
import AssignForm from "./AssignForm";
export default {
  data() {
    return {
      searchInfo: {
        xm: null,
        userName: null,
        jgid: null,
        zw: null
      },
      agencyData: [],
      isSearchingAgency: false,
      isChecked: false,
      allPersonsData: [],
      tableData: [],
      loading: false,
      showPersonForm: false,
      showAssignForm:false,
      person:{xm:'',id:''},
      formTitle: "添加人员",
      formData: {
        jgmc: null,
        xm: null,
        zw: null,
        csrq: null,
        xb: null,
        zzmm: null,
        yddh: null,
        jtdh: null,
        bgdh: null,
        zgxl: null,
        txdz: null,
        dzyj: null,
        zylb: null,
        cyzc: null,
        tx: null
      }
    };
  },
  created() {
    this.getPersons({});
  },
  components: { PersonForm,AssignForm },
  methods: {
    searchAgency() {
      this.isSearchingAgency = true;
      queryOganization().then(res => {
        this.isSearchingAgency = false;
        if (res.ret == "ok") {
          this.agencyData = res.content;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    filterUser(val) {
      this.tableData = val
        ? this.allPersonsData.filter(item => item.xtzh)
        : this.allPersonsData;
    },
    openAssignForm(item) {
      const {xm,id}=item;
      this.person={xm,id};
      this.showAssignForm=true;
    },
    deleteItem(personId) {
      deletePerson({ personId }).then(res => {
        if (res.ret == "ok") {
          this.$message.success("删除成功");
          this.getPersons({});
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getPersons(prams) {
      this.loading = true;
      queryPerson(prams).then(res => {
        this.loading = false;
        if (res.ret == "ok") {
          this.allPersonsData = res.content;
          this.filterUser(this.isChecked);
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    formatterSex(row) {
      return row.xb ? "男" : "女";
    },
    openPersonForm(type, item) {
      if (type == "add") {
        this.formTitle = "添加人员";
        this.formData = {
          jgid: null,
          xm: null,
          zw: null,
          csrq: null,
          xb: null,
          zzmm: null,
          yddh: null,
          jtdh: null,
          bgdh: null,
          zgxl: null,
          txdz: null,
          dzyj: null,
          zylb: null,
          cyzc: null,
          tx: null
        };
      } else {
        this.formTitle = "修改人员";
        item.jgid=item.zzjgid;
        this.formData = Object.assign({}, item);
      }
      this.showPersonForm = true;
    }
  }
};
</script>
<style lang="scss" scoped>
.search-bar {
  label {
    display: inline-block;
    width: 140px;
    text-align: right;
  }
  .el-input,
  .el-cascader,
  .el-autocomplete,
  .el-select {
    width: calc(100% - 140px);
  }
}
.function {
  margin: 20px 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .el-checkbox {
    color: white;
  }
  button {
    margin-left: 20px;
    min-width: 70px;
  }
}
.option {
  color: #30c7ff;
  margin-right: 20px;
  cursor: pointer;
}
</style>