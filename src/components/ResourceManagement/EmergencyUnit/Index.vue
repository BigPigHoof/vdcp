<!--  -->
<template>
  <div>
    <div class="search-bar" style="margin-bottom:20px;">
      <el-row :gutter="30" style="margin-bottom:20px;">
        <el-col :span="6">
          <label for="name" class>名称：</label>
          <el-input size="small" id="name" v-model="searchInfo.dwmc"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="code">编码：</label>
          <el-input size="small" id="code" v-model="searchInfo.dwbm"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="region">行政区域：</label>
          <el-cascader
            id="region"
            v-model="searchInfo.xzqy"
            :options="options"
            clearable
            ref="cascader"
            filterable
            :emitPath="false"
            size="small"
            @change="regionChange"
            :show-all-levels="false"
            :props="{ expandTrigger: 'hover',value:'xzqhmc',label:'xzqhmc',checkStrictly : true }"
          ></el-cascader>
        </el-col>
        <el-col :span="6">
          <el-button
            type="primary"
            size="small"
            @click="search"
            style="margin-left:50px"
          >查询</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="30">
        <el-col :span="6">
          <label for="duty" class>职能：</label>
          <el-input size="small" id="duty" v-model="searchInfo.zn"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="parentUnit">上级单位：</label>
          <el-select
            size="small"
            v-model="searchInfo.sjdwid"
            filterable
            clearable
          >
            <el-option
              v-for="item in parentUnitData"
              :key="item.id"
              :label="item.dwmc"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="6"></el-col>
        <el-col :span="6"></el-col>
      </el-row>
    </div>
    <el-button v-if="$store.state.hasCompetence" style="margin-bottom:20px;" type="primary" size="small" @click="openForm('add')">新增</el-button>
    <el-table
      :data="tableData"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      style="width: 100%"
      height="650"
    >
      <el-table-column prop="dwmc" label="名称"></el-table-column>
      <el-table-column prop="dwbm" label="编码"></el-table-column>
      <el-table-column prop="sjdwmc" label="上级单位"></el-table-column>
      <el-table-column prop="xzqy" label="所属行政区域"></el-table-column>
      <el-table-column v-if="$store.state.hasCompetence" label="操作">
        <template slot-scope="scope">
          <span class="option" @click="openForm('edit',scope.row)">修改</span>
          <el-popconfirm title="确定删除吗？" @onConfirm="deleteItem(scope.row.id)">
            <span class="option" slot="reference">删除</span>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="formTitle" :visible.sync="showForm" width="90%">
      <el-row :gutter="30">
        <el-col :span="12">
          <el-form
            v-if="showForm"
            class="form-box"
            :model="form"
            size="small"
            label-suffix="："
            ref="form"
          >
            <el-form-item
              label="名称"
              prop="dwmc"
              :label-width="formLabelWidth"
              :rules="[{ required: true, message: '请填写名称' }]"
            >
              <el-input v-model="form.dwmc" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="资源性质" prop="zyxz" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.zyxz">
                <el-option value="1" label="应急资源"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="单位类型" prop="dwlx" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.dwlx">
                <el-option value="1" label="应急单位"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              class="half"
              label="编码"
              prop="dwbm"
              :label-width="formLabelWidth"
              :rules="[{ required: true, message: '请填写编码' }]"
            >
              <el-input v-model="form.dwbm" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="上级单位" prop="sjdwid" :label-width="formLabelWidth">
              <el-select
                value-key="id"
                v-model="form.sjdwid"
                filterable
                clearable
              >
                <el-option
                  v-for="item in parentUnitData"
                  :key="item.id"
                  :label="item.dwmc"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="行政区域" prop="xzqy" :label-width="formLabelWidth">
              <el-cascader
                v-model="form.xzqy"
                :options="options"
                clearable
                ref="cascader2"
                filterable
                :emitPath="false"
                size="small"
                @change="regionChange2"
                :show-all-levels="false"
                :props="{ expandTrigger: 'hover',value:'xzqhmc',label:'xzqhmc',checkStrictly : true }"
              ></el-cascader>
            </el-form-item>
            <el-form-item class="half" label="联网状态" prop="lwzt" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.lwzt">
                <el-option :value="1" label="已联"></el-option>
                <el-option :value="0" label="未联"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="地址" prop="dwdz" :label-width="formLabelWidth">
              <el-input v-model="form.dwdz" autocomplete="off">
                <i slot="suffix" class="el-input__icon el-icon-search" @click="searchAddress"></i>
              </el-input>
            </el-form-item>
            <el-form-item class="half" label="坐标" :label-width="formLabelWidth">
              <el-input v-model="form.dwjd" autocomplete="off" style="width:45%;margin-right:10%;"></el-input>
              <el-input v-model="form.dwwd" autocomplete="off" style="width:45%"></el-input>
            </el-form-item>
            <el-form-item class="half" label="传真" prop="dwcz" :label-width="formLabelWidth">
              <el-input v-model="form.dwcz" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="值班电话" prop="zbdh" :label-width="formLabelWidth">
              <el-input v-model="form.zbdh" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="办公电话1" prop="bgdh1" :label-width="formLabelWidth">
              <el-input v-model="form.bgdh1" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="办公电话2" prop="bgdh2" :label-width="formLabelWidth">
              <el-input v-model="form.bgdh2" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="职能" prop="zn" :label-width="formLabelWidth">
              <el-input type="textarea" :rows="4" v-model="form.zn"></el-input>
            </el-form-item>
            <el-form-item label="单位描述" prop="dwms" :label-width="formLabelWidth">
              <el-input type="textarea" :rows="4" v-model="form.dwms"></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="bz" :label-width="formLabelWidth">
              <el-input type="textarea" :rows="4" v-model="form.bz"></el-input>
            </el-form-item>
            <el-form-item style="text-align:center;">
              <el-button type="primary" size="small" :loading="isSaving" @click="save">保存</el-button>
              <el-button type="primary" size="small" @click="showForm=false">关闭</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <MiniMap :address="this.form.dwdz" ref="miniMap" @getPosition="setPosition"></MiniMap>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import MiniMap from "../MiniMap";
import { regionData } from "../../../assets/js/regionData";
import {
  queryEmergencyUnit,
  deleteEmergencyUnit,
  addOrUpdateEmergencyUnit
} from "../../../api/api";
const doRes = (res, loading, message, callback) => {
  loading = false;
  if (res.ret == "ok") {
    callback(res.content);
  } else {
    message.error(res.msg);
  }
};
export default {
  data() {
    return {
      searchInfo: {
        dwmc: null,
        dwbm: null,
        xzqy: null,
        zn: null,
        sjdwid: null
      },
      options: regionData,
      loading: false,
      tableData: [],
      parentUnitData: [],
      showForm: false,
      formTitle: "",
      form: {},
      formLabelWidth: "100px",
      isSaving: false
    };
  },
  components: { MiniMap },
  created() {
    this.getEmergencyUnit({});
  },
  methods: {
    getEmergencyUnit() {
      queryEmergencyUnit({}).then(res => {
        doRes(res, this.loading, this.$message, content => {
          this.tableData = content;
          this.parentUnitData=content;
        });
      });
    },
    search(){
        queryEmergencyUnit(this.searchInfo).then(res => {
        doRes(res, this.loading, this.$message, content => {
          this.tableData = content;
        });
      });
    },
    regionChange(value) {
      console.log(value);
      let nodesObj = this.$refs["cascader"].getCheckedNodes();
      if (nodesObj.length == 1) {
        this.searchInfo.xzqy = nodesObj[0].data.xzqhmc;
      } else {
        this.searchInfo.xzqy = null;
      }
    },

    deleteItem(dwid) {
      deleteEmergencyUnit({ dwid }).then(res => {
        if (res.ret == "ok") {
          this.getEmergencyUnit({});
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    openForm(type, data) {
      if (type == "add") {
        this.form = {
          dwbm: null,
          dwmc: null,
          sjdwmc: null,
          sjdwid:null,
          zyxz: null,
          dwlx: null,
          xzqy: null,
          lwzt: null,
          dwdz: null,
          dwjd: null,
          dwwd: null,
          dwcz: null,
          bgdh1: null,
          bgdh2: null,
          zbdh: null,
          zn: null,
          dwms: null,
          bz: null
        };
        this.formTitle = "新增应急单位";
      } else {
        this.form = Object.assign({}, data);
        delete(this.form["children"]);
        this.formTitle = "修改应急单位";
      }
      this.showForm = true;
    },
    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log(this.form);
          addOrUpdateEmergencyUnit(this.form).then(res=>{
            if(res.ret=='ok'){
              this.$message.success('保存成功');
              this.getEmergencyUnit({});
              this.showForm=false;
            }else{
              this.$message.error(res.msg);
            }
          })
        } else {
          return false;
        }
      });
    },
    regionChange2(value) {
      console.log(value);
      let nodesObj = this.$refs["cascader2"].getCheckedNodes();
      if (nodesObj.length == 1) {
        this.form.xzqy = nodesObj[0].data.xzqhmc;
      } else {
        this.form.xzqy = null;
      }
    },
    searchAddress() {
      this.$refs.miniMap.searchAddress();
    },
    setPosition(pos) {
      if (Array.isArray(pos)) {
        if (pos.length == 2) {
          this.form.dwjd = pos[0];
          this.form.dwwd = pos[1];
        }
      }
    }
  }
};
</script>
<style scoped>
</style>