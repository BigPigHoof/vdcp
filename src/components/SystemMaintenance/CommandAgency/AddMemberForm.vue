<!--  -->
<template>
  <el-dialog title="添加成员" :visible="show" width="60%" @close="closeForm">
    <el-row style="margin-bottom:20px;" class="search-bar">
      <el-col :span="10">
        <label for="name" class>姓名：</label>
        <el-input size="small" id="name" v-model="searchInfo.xm"></el-input>
      </el-col>
      <el-col :span="10">
        <label for="code">移动号码：</label>
        <el-input size="small" id="code" v-model="searchInfo.yddh"></el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" size="small" @click="getPersons(searchInfo)">查询</el-button>
      </el-col>
    </el-row>

    <div class="form-box">
      <el-form :model="form" size="small" label-suffix="：" ref="form">
        <el-form-item
          label="选择成员"
          prop="id"
          :label-width="formLabelWidth"
          :rules="[
      { required: true, message: '请选择成员' } ]"
        >
          <el-radio-group @change="changeRadio" v-model="form.id" style="width:100%">
            <el-table
              :data="persons"
              style="width: 100%;margin-bottom:20px;"
              height="300"
              :loading="isSearching"
            >
              <el-table-column label="序号" width="100">
                <template slot-scope="scope">
                  <el-radio :label="scope.row.id" style="color:white;">{{scope.$index+1}}</el-radio>
                </template>
              </el-table-column>

              <el-table-column prop="xm" label="姓名"></el-table-column>
              <el-table-column prop="xb" label="性别"></el-table-column>
              <el-table-column prop="yddh" label="移动电话"></el-table-column>
              <el-table-column prop="zw" label="职务"></el-table-column>
            </el-table>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="编码" prop="bm" :label-width="formLabelWidth">
          <el-input v-model="form.bm" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="组内职务" prop="znzw" :label-width="formLabelWidth">
          <el-input v-model="form.znzw" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="组内分工" prop="znfg" :label-width="formLabelWidth">
          <el-input type="textarea" :rows="5" v-model="form.znfg"></el-input>
        </el-form-item>
        <el-form-item style="text-align:center;">
          <el-button type="primary" @click="add('close')" :loading="isSaving">保存</el-button>
          <el-button type="primary" @click="add('open')" :loading="isSaving">保存并新增</el-button>
          <el-button type="primary" @click="closeForm">关闭</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import { queryPersonNoOrg, addPersonOfOrg } from "../../../api/api";
export default {
  props: ["show", "jgid"],
  data() {
    return {
      formLabelWidth: "120px",
      searchInfo: {
        xm: null,
        yddh: null
      },
      form: { id: null, bm: null, znzw: null, znfg: null },
      isSearching: false,
      persons: [],
      isSaving: false
    };
  },
  created() {
    this.getPersons({});
  },
  methods: {
    closeForm() {
      this.searchInfo = {
        xm: null,
        yddh: null
      };
      this.$emit("update:show", false);
    },
    getPersons(prams) {
      this.isSearching = true;
      queryPersonNoOrg(prams).then(res => {
        this.isSearching = false;
        if (res.ret == "ok") {
          this.persons = res.content;
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    changeRadio(val) {
      console.log(val);
    },
    add(type) {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.jgid = this.jgid;
          this.isSaving = true;
          addPersonOfOrg(this.form).then(res => {
            this.isSaving = false;
            if (res.ret == "ok") {
              this.$message.success("保存成功");
               this.getPersons({});
              this.$emit("refresh");
              this.$refs["form"].resetFields();
              if (type == "close") {
                this.closeForm();
              }
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          return false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.search-bar {
  label {
    color: white;
    display: inline-block;
    width: 100px;
    text-align: right;
  }
  .el-input {
    width: calc(100% - 110px);
  }
}
.form-box {
  padding: 0 60px;
  box-sizing: border-box;
}
</style>