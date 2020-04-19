<!--  -->
<template>
  <div>
    <el-dialog :title="title" :visible="dialogVisible" @close="closeForm" width="80%">
      <div class="form-box">
        <el-form :model="form" size="small" label-suffix="：" :rules="rules" ref="form">
          <el-row :gutter="100">
            <el-col :span="12">
              <el-form-item label="名称" prop="zzjgmc" :label-width="formLabelWidth">
                <el-input v-model="form.zzjgmc" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="编码" prop="zzjgbm" :label-width="formLabelWidth">
                <el-input v-model="form.zzjgbm" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="100">
            <el-col :span="12">
              <el-form-item
                label="行政级别"
                prop="administrativeDivision.xzqhjb"
                :label-width="formLabelWidth"
              >
                <el-select
                  v-model="form.administrativeDivision.xzqhjb"
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
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="行政区域"
                prop="administrativeDivision.id"
                :label-width="formLabelWidth"
              >
                <el-cascader
                  v-model="form.administrativeDivision.id"
                  :options="options"
                  clearable
                  filterable
                  ref="cascader"
                  :emitPath="false"
                  :show-all-levels="false"
                  @change="regionChange"
                  :props="{ expandTrigger: 'hover',value:'id',label:'xzqhmc',checkStrictly : true,emitPath:false }"
                ></el-cascader>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="职能/描述" prop="znms" :label-width="formLabelWidth">
            <el-input type="textarea" :rows="5" v-model="form.znms"></el-input>
          </el-form-item>
          <el-row :gutter="100">
            <el-col :span="12">
              <el-form-item label="上级机构" prop="sjjgid" :label-width="formLabelWidth">
                <el-select
                  autocomplete="off"
                  v-model="form.sjjgid"
                  filterable
                  @change="parentChange"
                  clearable
                  ref="parent"            
                >
                  <el-option
                    v-for="item in parentData"
                    :key="item.id"
                    :label="item.zzjgmc"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="组建日期" prop="formatTime" :label-width="formLabelWidth">
                <el-date-picker v-model="form.formatTime" type="date"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="100">
            <el-col :span="12">
              <el-form-item label="主管领导" prop="leader" :label-width="formLabelWidth">
                <el-select
                  value-key="id"
                  v-model="form.leader"
                  filterable
                  clearable
                  @visible-change="searchGet($event,'leader')"
                  :loading="search.leader.loading"
                >
                  <el-option
                    v-for="item in search.leader.data"
                    :key="item.id"
                    :label="item.xm"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联络员" prop="liaison" :label-width="formLabelWidth">
                <el-select
                  value-key="id"
                  v-model="form.liaison"
                  filterable
                  clearable
                  @visible-change="searchGet($event,'liaison')"
                  :loading="search.liaison.loading"
                >
                  <el-option
                    v-for="item in search.liaison.data"
                    :key="item.id"
                    :label="item.xm"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-table
            v-if="title=='修改指挥机构'"
            :data="form.persons"
            style="width: 100%;margin-bottom:20px;"
            height="300"
            :loading="isUpdatingMember"
          >
            <el-table-column prop="xm" label="姓名"></el-table-column>
            <el-table-column prop="znzw" label="组内职务"></el-table-column>
            <el-table-column prop="znfg" label="组内分工"></el-table-column>
            <el-table-column prop="yddh" label="移动电话"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <span class="option" @click="openEidtMemberForm(scope.row)">修改</span>
                <el-popconfirm title="确定删除吗？" @onConfirm="deleteMember(scope.row)">
                  <span class="option" slot="reference">删除</span>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-form-item style="text-align:center;">
            <el-button type="primary" @click="add('close')" :loading="isSaving">保存后关闭</el-button>
            <el-button type="primary" @click="add('open')" :loading="isSaving">保存后添加成员</el-button>
            <el-button type="primary" @click="closeForm">关闭</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <el-dialog title="编辑成员" :visible.sync="showEditMember" width="60%">
      <div class="form-box">
        <el-form :model="memberForm" size="small" label-suffix="：" ref="memberForm">
          <el-row :gutter="100">
            <el-col :span="12">
              <el-form-item label="编码" prop="bm" :label-width="formLabelWidth">
                <el-input v-model="memberForm.bm" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="组内职务" prop="znzw" :label-width="formLabelWidth">
                <el-input v-model="memberForm.znzw" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="组内分工" prop="znfg" :label-width="formLabelWidth">
            <el-input type="textarea" :rows="5" v-model="memberForm.znfg"></el-input>
          </el-form-item>
          <el-form-item style="text-align:center;">
            <el-button type="primary" @click="saveMember" :loading="isSavingMember">保存</el-button>
            <el-button type="primary" @click="closeEditMember">关闭</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { regionData } from "../../../assets/js/regionData";
import {
  queryOganization,
  queryPersonOfOrg,
  addOganization,
  updateOganization,
  deletePersonOfOrg,
  updatePersonOfOrg
} from "../../../api/api";
export default {
  props: ["dialogVisible", "title", "form", "parentData"],
  data() {
    return {
      // form:this.formData,
      regionLevels: ["省部级", "地市级", "县处级"],
      formLabelWidth: "120px",
      search: {
        parentBody: {
          data: [],
          loading: false,
          get: queryOganization
        },
        leader: {
          data: [],
          loading: false,
          get: queryPersonOfOrg
        },
        liaison: {
          data: [],
          loading: false,
          get: queryPersonOfOrg
        }
      },
      isSaving: false,
      isToAddMember: false,
      options: regionData,
      nowLevel: "",
      lastParentId: "",
      rules: {
        zzjgmc: [{ required: true, message: "名称不能为空" }],
        zzjgbm: [{ required: true, message: "编码不能为空" }],
        "administrativeDivision.xzqhjb": [
          { required: true, message: "行政级别不能为空" }
        ],
        "administrativeDivision.id": [
          {
            required: true,
            message: "行政区域不能为空"
          }
        ]
      },
      showEditMember: false,
      isSavingMember: false,
      memberForm: {
        bm: "",
        znfg: "",
        znzw: ""
      },
      isUpdatingMember: false
    };
  },
  watch: {
    form(val) {
      if (val.leader) {
        this.search.leader.data =[val.leader];
      }
      if (val.liaison) {
        this.search.liaison.data = [val.liaison];
      }
      if (val.sjjgid) {
        this.lastParentId = val.sjjgid;
      }
    }
  },
  methods: {
    closeForm() {
      this.$refs["form"].resetFields();
      this.nowLevel = "";
      this.$emit("update:dialogVisible", false);
    },
    regionChange() {
      let nodesObj = this.$refs["cascader"].getCheckedNodes();
      if (nodesObj.length == 1) {
        this.form.administrativeDivision.xzqhmc = nodesObj[0].data.xzqhmc;
        // this.form.administrativeDivision.id = nodesObj[0].data.id;
        this.form.administrativeDivision.xzqhjb = nodesObj[0].data.xzqhjb;
        this.nowLevel = nodesObj[0].data.xzqhjb;
      } else {
        this.form.administrativeDivision.xzqhmc = "";
        // this.form.administrativeDivision.id = '';
      }
    },
    parentChange(val) {
      if (val) {
        if (val.id != this.lastParentId) {
          this.form.leader = null;
          this.form.liaison = null;
        }
        this.lastParentId = val.id;
      } else {
        this.form.leader = null;
        this.form.liaison = null;
        this.lastParentId = "";
      }
    },
    levelChange(item) {
      console.log(this.form.xzqhjb, item);
      if (item != this.nowLevel) {
        this.form.administrativeDivision.id = "";
      }
    },
    leaderChange(item) {
      console.log(this.$refs["leader"].getValueIndex(item), item);
    },
    liaisonChange(item) {
      console.log(this.$refs["liaison"], item);
    },

    searchGet(val, type) {
      if (val) {
        let params = {};
        if (type != "parentBody") {
          if (this.form.sjjgid) {
            params = { jgid: this.form.sjjgid };
          } else {
            this.search[type].data = [];
            this.$message.warning("请先选择上级机构");
            return;
          }
        }
        this.search[type].loading = true;
        this.search[type].get(params).then(res => {
          this.search[type].loading = false;
          if (res.ret == "ok") {
            this.search[type].data = res.content;
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    add(type) {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let data = this.form;
          let params = {
            jgbm: data.zzjgbm,
            jgmc: data.zzjgmc,
            xzqhjb: data.administrativeDivision.xzqhjb,
            xzqhmc: data.administrativeDivision.xzqhmc,
            xzqhid: data.administrativeDivision.id,
            znms: data.znms,
            sjjgmc: data.parent? data.parent.zzjgmc:null,
            zjrq: data.formatTime,
            sjjgid: data.parent?data.parent.id:null,
            zgldid: data.leader ? data.leader.id : "",
            llyid: data.liaison ? data.liaison.id : ""
          };
          for (const key in params) {
            if (!params[key]) {
              delete params[key];
            }
          }
          this.isSaving = true;
          if (this.title == "修改指挥机构") {
            params.id = data.id;
            updateOganization(params).then(res => {
             this.isSaving = false;
              if (res.ret == "ok") {
                this.$emit("refresh");
                this.$message.success("保存成功");
                this.closeForm();
                if (type == "open") {
                  this.$emit("openAddMemberForm", this.form.id);
                }
              } else {
                this.$message.error(res.msg);
              }
            });
          } else {
            addOganization(params).then(res => {
              this.isSaving = false;
              if (res.ret == "ok") {
                this.$emit("refresh");
                this.$message.success("保存成功");
                this.closeForm();
                if (type == "open") {
                  this.$emit("openAddMemberForm", res.content.id);
                }
              } else {
                this.$message.error(res.msg);
              }
            });
          }
        } else {
          return false;
        }
      });
    },

    saveMember() {
      let params = {
        bm: this.memberForm.bm,
        znzw: this.memberForm.znzw,
        znfg: this.memberForm.znfg,
        id: this.memberForm.id
      };
      this.isSavingMember = true;
      updatePersonOfOrg(params).then(res => {
        this.isSavingMember = false;
        if (res.ret == "ok") {
          this.updatePersons();
          this.$emit("refresh");
          this.showEditMember = false;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    closeEditMember() {
      this.showEditMember = false;
    },
    openEidtMemberForm(data) {
      this.memberForm = Object.assign({}, data);
      this.showEditMember = true;
    },
    deleteMember(item) {
      deletePersonOfOrg({ personId: item.id }).then(res => {
        if (res.ret == "ok") {
          this.$emit("refresh");
          this.updatePersons();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    updatePersons() {
      this.isUpdatingMember = true;
      queryOganization({ id: this.form.id }).then(res => {
        this.isUpdatingMember = false;
        if (res.ret == "ok") {
          this.form.persons = res.content[0].persons;
        } else {
          this.$message.error(res.msg);
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.form-box {
  width: 100%;
  padding: 0 6.5%;
  box-sizing: border-box;
  .el-input,
  .el-cascader,
  .el-select {
    width: 100%;
  }
  .option {
    color: #30c7ff;
    margin-right: 20px;
    cursor: pointer;
  }
}
</style>