<!--  -->
<template>
  <div>
    <div class="search-bar" style="margin-bottom:20px;">
      <el-row :gutter="30" style="margin-bottom:20px;">
        <el-col :span="6">
          <label for="name" class>名称：</label>
          <el-input size="small" id="name" v-model="searchInfo.cxmc"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="code">编码：</label>
          <el-input size="small" id="code" v-model="searchInfo.bm"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="plate">车牌号：</label>
          <el-input size="small" id="plate" v-model="searchInfo.cph"></el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" size="small" @click="search" style="margin-left:50px">查询</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="30">
        <el-col :span="6">
          <label for="model">型号：</label>
          <el-input size="small" id="model" v-model="searchInfo.dpxh"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="state">状态：</label>
          <el-select id="state" autocomplete="off" size="small" v-model="searchInfo.zt">
            <el-option value="0" label="待命"></el-option>
            <el-option value="1" label="出动"></el-option>
          </el-select>
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
    <el-button v-if="$store.state.hasCompetence" style="margin-bottom:20px;" type="primary" size="small" @click="openForm('add')">新增</el-button>
    <el-table
      :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      v-loading="loading"
      element-loading-background="rgba(0, 0, 0, 0.5)"
     style="width: 100%;margin-bottom:14px;"
     max-height="600"
    >
    <el-table-column type="index" label="序号" :index="indexMethod"></el-table-column>
      <el-table-column prop="cxmc" label="名称"></el-table-column>
      <el-table-column prop="bm" label="编码"></el-table-column>
      <el-table-column prop="cph" label="车牌号"></el-table-column>
      <el-table-column prop="dpxh" label="型号"></el-table-column>
      <el-table-column prop="zt" label="状态" :formatter="formatterState"></el-table-column>
      <el-table-column prop="zrdwmc" label="责任单位"></el-table-column>
      <el-table-column v-if="$store.state.hasCompetence" label="操作">
        <template slot-scope="scope">
          <span class="option" @click="openForm('edit',scope.row)">修改</span>
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
      :total="tableData.length">
    </el-pagination>
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
        <el-form-item class="half" label="资源类别" prop="zylx" :label-width="formLabelWidth">
          <el-select autocomplete="off" v-model="form.zylx">
            <el-option value="1" label="应急车辆"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="车型名称"
          class="half"
          prop="cxmc"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请填写名称' }]"
        >
          <el-input v-model="form.cxmc" autocomplete="off"></el-input>
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
        <el-form-item
          class="half"
          label="车牌号"
          prop="cph"
          :label-width="formLabelWidth"
          :rules="[{ required: true, message: '请填写车牌号' }]"
        >
          <el-input v-model="form.cph" autocomplete="off"></el-input>
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
        <el-form-item class="half" label="底盘型号" prop="dpxh" :label-width="formLabelWidth">
          <el-input v-model="form.dpxh" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item class="half" label="状态" prop="zt" :label-width="formLabelWidth">
          <el-select autocomplete="off" v-model="form.zt">
            <el-option :value="0" label="待命"></el-option>
            <el-option :value="1" label="出动"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="half" label="投用年份" prop="tynf" :label-width="formLabelWidth">
          <el-input v-model="form.tynf" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="half" label="支持业务" prop="zcyw" :label-width="formLabelWidth">
          <el-input v-model="form.zcyw" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="half" label="是否安装GPS" prop="gps" :label-width="formLabelWidth">
          <el-select autocomplete="off" v-model="form.gps">
            <el-option :value="1" label="是"></el-option>
            <el-option :value="0" label="否"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="half" label="联络员" prop="lyy" :label-width="formLabelWidth">
          <el-input v-model="form.lyy" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="half" label="联系电话" prop="lxdh" :label-width="formLabelWidth">
          <el-input v-model="form.lxdh" autocomplete="off"></el-input>
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

        <el-form-item label="备注" prop="bz" :label-width="formLabelWidth">
          <el-input type="textarea" :rows="4" v-model="form.bz"></el-input>
        </el-form-item>
         <el-form-item  prop="sfyx" :label-width="formLabelWidth">
               <el-checkbox v-model="form.sfyx" >有效性</el-checkbox>
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
  queryEmergencyVehicle,
  queryEmergencyUnit,
  deleteEmergencyVehicle,
  addOrUpdateEmergencyVehicle
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
        cxmc: null,
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
      warehousesData: [],
      showForm: false,
      formTitle: "",
      form: {},
      formLabelWidth: "140px",
      isSaving: false,
      currentPage:1,
      pageSize:30,
    };
  },

  created() {
    this.getEmergencyVehicle({});
    queryEmergencyUnit({}).then(res => {
      if (res.ret == "ok") {
        this.parentUnitData = res.content;
      }
    });
  },
  methods: {
      indexMethod(index){
      return (this.currentPage-1)*this.pageSize+index+1;
    },
    getEmergencyVehicle(params) {
      queryEmergencyVehicle(params).then(res => {
        doRes(res, this.loading, this.$message, content => {
          this.tableData = content;
        });
      });
    },
    search() {
      this.currentPage=1;
      this.getEmergencyVehicle(this.searchInfo);
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
    deleteItem(clid) {
      deleteEmergencyVehicle({ clid }).then(res => {
        if (res.ret == "ok") {
          this.getEmergencyVehicle({});
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    openForm(type, data) {
      if (type == "add") {
        this.form = {
          bm: null,
          cxmc: null,
          zyxz: null,
          zylx: null,
          cph: null,
          dpxh: null,
          zt: null,
          tynf: null,
          zcyw: null,
          gps: null,
          lyy: null,
          lxdh: null,
          zrdwmc: null,
             zrdwid: null,
             szdwid:null,
          bz: null,
          sfyx:false
        };
        this.formTitle = "新增应急车辆";
      } else {
        this.form = Object.assign({}, data);

        this.formTitle = "修改应急车辆";
      }
      this.showForm = true;
    },
    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log(this.form);
          addOrUpdateEmergencyVehicle(this.form).then(res => {
            if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.getEmergencyVehicle({});
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