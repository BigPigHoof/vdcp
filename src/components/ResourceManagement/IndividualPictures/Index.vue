<!--  -->
<template>
  <div>
    <div class="search-bar">
      <el-row :gutter="30" style="margin-bottom:20px;">
        <el-col :span="6">
          <label for="name" class>名称：</label>
          <el-input size="small" id="name" v-model="searchInfo.mc"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="code">编码：</label>
          <el-input size="small" id="code" v-model="searchInfo.bm"></el-input>
        </el-col>
         <el-col :span="6">
          <label for="region">存放行政区域：</label>
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
          <el-button type="primary" size="small" @click="search" style="margin-left:50px">查询</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="30">
        <el-col :span="6">
          <label for="duty">职能：</label>
          <el-input size="small" id="duty" v-model="searchInfo.zn"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="parentUnit">责任单位：</label>
          <el-select
            id="parentUnit"
            size="small"
            value-key="id"
            v-model="searchInfo.zrdwid"
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
      </el-row>
    </div>
    <el-button style="margin:20px 0;" type="primary" size="small" @click="openForm('add')">新增</el-button>
    <el-table
      :data="tableData"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
      style="width: 100%"
      height="650"
    >
      <el-table-column prop="mc" label="名称"></el-table-column>
      <el-table-column prop="bm" label="编码"></el-table-column>
      <el-table-column prop="zn" label="职能"></el-table-column>
      <el-table-column prop="zrdwmc" label="责任单位"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <span class="option" @click="openForm('edit',scope.row)">修改</span>
          <el-popconfirm title="确定删除吗？" @onConfirm="deleteItem(scope.row.id)">
            <span class="option" slot="reference">删除</span>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="formTitle" :visible.sync="showForm" width="50%">
      <el-form
        v-if="showForm"
        class="form-box"
        :model="form"
        size="small"
        label-suffix="："
        ref="form"
      >
        <el-form-item class="half" label="资源性质" prop="zyxz" :label-width="formLabelWidth">
          <el-select autocomplete="off" v-model="form.zyxz">
            <el-option value="应急装备" label="应急装备"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="half" label="资源类型" prop="zylx" :label-width="formLabelWidth">
          <el-select autocomplete="off" v-model="form.zylx">
            <el-option value="单兵图传" label="单兵图传"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="名称"
          class="half"
          prop="mc"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请填写名称' }]"
        >
          <el-input v-model="form.mc" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          class="half"
          label="编码"
          prop="bm"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请填写编码' }]"
        >
          <el-input v-model="form.bm" autocomplete="off"></el-input>
        </el-form-item>
             <el-form-item class="half" label="规格型号" prop="ggxh" :label-width="formLabelWidth">
          <el-input v-model="form.ggxh" autocomplete="off"></el-input>
        </el-form-item>
           <el-form-item class="half" label="存放行政区域" prop="xzqy" :label-width="formLabelWidth">
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

        <el-form-item class="half" label="所在单位" prop="szdwid" :label-width="formLabelWidth">
          <el-select value-key="id" v-model="form.szdwid" filterable clearable>
            <el-option
              v-for="item in parentUnitData"
              :key="item.id"
              :label="item.dwmc"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
       <el-form-item class="half" label="负责人" prop="fzr" :label-width="formLabelWidth">
             <el-input v-model="form.fzr"  autocomplete="off"></el-input>
            </el-form-item>
                  <el-form-item class="half" label="负责人职务"  :label-width="formLabelWidth">
              <el-input v-model="form.fzrzw"  autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="负责人办公电话"  :label-width="formLabelWidth">
              <el-input v-model="form.fzrbgdh"  autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="负责人家庭电话"  :label-width="formLabelWidth">
              <el-input v-model="form.fzrjtdh"  autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="负责人移动电话"  :label-width="formLabelWidth">
              <el-input v-model="form.fzrsj"  autocomplete="off"></el-input>
            </el-form-item>
                <el-form-item label="职能" prop="zn" :label-width="formLabelWidth">
          <el-input type="textarea" :rows="4" v-model="form.zn"></el-input>
        </el-form-item>
  <el-form-item label="存放地点"  :label-width="formLabelWidth">
              <el-input v-model="form.cfdd"  autocomplete="off"></el-input>
            </el-form-item>
       <el-form-item
          class="half"
          label="常备数量"
          prop="cbsl"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请填写常备数量' }]"
        >
          <el-input v-model="form.cbsl" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item class="half" label="计量单位" prop="jldw" :label-width="formLabelWidth">
          <el-select autocomplete="off" v-model="form.jldw">
            <el-option value="箱" label="箱"></el-option>
            <el-option value="个" label="个"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="half"
          label="可使用数量"
          prop="yxsl"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请填写可使用数量' }]"
        >
          <el-input v-model="form.yxsl" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item class="half" label="储备形式" prop="cbxs" :label-width="formLabelWidth">
          <el-select autocomplete="off" v-model="form.cbxs">
            <el-option value="自备" label="自备"></el-option>
            <el-option value="托管" label="托管"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          class="half"
          label="责任单位"
          prop="zrdwid"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请选择责任单位' }]"
        >
          <el-select value-key="id" v-model="form.zrdwid" filterable clearable>
            <el-option
              v-for="item in parentUnitData"
              :key="item.id"
              :label="item.dwmc"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
           <el-form-item class="half" label="主管领导" prop="zgld" :label-width="formLabelWidth">
          <el-input v-model="form.zgld" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="half" label="联络员" prop="lly" :label-width="formLabelWidth">
          <el-input v-model="form.lly" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item style="text-align:center;">
          <el-button type="primary" size="small" :loading="isSaving" @click="save">保存</el-button>
          <el-button type="primary" size="small" @click="showForm=false">关闭</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { regionData } from "../../../assets/js/regionData";
import {
  querySingleTransmission,
  queryEmergencyUnit,
  deleteSingleTransmission,
  addOrUpdateSingleTransmission,
  queryPerson
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
        mc: null,
        bm: null,
        cph: null,
        dpxh: null,
        zt: null,
        zrdwid: null
      },
      options: regionData,
      loading: false,
      tableData: [],
      parentUnitData: [],
      personsData: [],
      showForm: false,
      formTitle: "",
      form: {},
      formLabelWidth: "140px",
      isSaving: false
    };
  },

  created() {
    this.getSingleTransmission({});
   queryPerson({}).then(res=>{
      if(res.ret=='ok'){
        this.personsData=res.content;
      }
    })
    queryEmergencyUnit({}).then(res => {
      if (res.ret == "ok") {
        this.parentUnitData = res.content;
      }
    });
  },
  methods: {
    getSingleTransmission(params) {
      querySingleTransmission(params).then(res => {
        doRes(res, this.loading, this.$message, content => {
          this.tableData = content;
        });
      });
    },
    search() {
      this.getSingleTransmission(this.searchInfo);
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
    formatterState(row) {
      if (row.zt === 0) {
        return "待命";
      } else if (row.zt === 1) {
        return "出动";
      } else {
        return null;
      }
    },
    deleteItem(dbid) {
      deleteSingleTransmission({ dbid }).then(res => {
        if (res.ret == "ok") {
          this.getSingleTransmission({});
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    openForm(type, data) {
      if (type == "add") {
        this.form = {
          bm: null,
          mc: null,
          zyxz: null,
          zylx: null,
          szdwid:null,
          xzqy: null,
          ggxh: null,
          fzr: null,
          fzrzw: null,
          fzrbgdh: null,
          fzrjtdh: null,
          fzrsj: null,
          zn: null,
          cfdd: null,
          cbsl: null,
           jldw: null,
           yxsl:null,
           zrdwmc:null,
            zrdwid:null,
           cbxs:null,
           zgld:null,
           lly:null,
        };
        this.formTitle = "新增单兵图传";
      } else {
        this.form = Object.assign({}, data);

        this.formTitle = "修改单兵图传";
      }
      this.showForm = true;
    },
    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log(this.form);
          addOrUpdateSingleTransmission(this.form).then(res => {
            if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.getSingleTransmission({});
              this.showForm = false;
            } else {
              this.$message.error(res.msg);
            }
          });
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
    }
  }
};
</script>
<style scoped>
</style>