<!--  -->
<template>
  <div>
    <div class="search-bar" style="margin-bottom:20px;">
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
          <label for="warehouse" class>所在仓库：</label>
          <el-select
            id="warehouse"
            size="small"
            value-key="id"
            v-model="searchInfo.cfdck"
            filterable
            clearable
          >
            <el-option
              v-for="item in warehousesData"
              :key="item.id"
              :label="item.mc"
              :value="item.mc"
            ></el-option>
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
        <el-col :span="6"></el-col>
        <el-col :span="6"></el-col>
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
      <el-table-column prop="mc" label="名称"></el-table-column>
      <el-table-column prop="bm" label="编码"></el-table-column>
      <el-table-column prop="cfdckmc" label="所在仓库"></el-table-column>
      <el-table-column prop="xzqy" label="存放行政区域"></el-table-column>
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
         :rules="rules"
      >
        <el-form-item
          label="名称"
          class="half"
          prop="mc"
          :label-width="formLabelWidth"
          
        >
          <el-input v-model="form.mc" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          class="half"
          label="编码"
          prop="bm"
          :label-width="formLabelWidth"

        >
          <el-input v-model="form.bm" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          label="存放地仓库"
          prop="cfdckid"
          :label-width="formLabelWidth"
 
        >
          <el-select v-model="form.cfdckid" filterable clearable>
            <el-option
              v-for="item in warehousesData"
              :key="item.id"
              :label="item.mc"
              :value="item.id"
            ></el-option>
          </el-select>
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
        <el-form-item
          class="half"
          label="责任单位"
          prop="zrdwid"
          :label-width="formLabelWidth"

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
        <el-form-item class="half" label="管理员" prop="gly" :label-width="formLabelWidth">
          <el-input v-model="form.gly" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item class="half" label="管理员电话" prop="gyldh" :label-width="formLabelWidth">
          <el-input v-model="form.gyldh" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item
          class="half"
          label="常备数量"
          prop="cbsl"
          :label-width="formLabelWidth"

        >
         <!-- <el-input-number :controls="false" v-model="form.cbsl" :min="0"></el-input-number> -->
          <el-input v-model="form.cbsl" oninput="value=value.replace(/\D/g,'')" autocomplete="off"></el-input>
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

        >
          <el-input v-model="form.yxsl" oninput="value=value.replace(/\D/g,'')" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item class="half" label="储备形式" prop="cbxs" :label-width="formLabelWidth">
          <el-select autocomplete="off" v-model="form.cbxs">
            <el-option value="自备" label="自备"></el-option>
            <el-option value="托管" label="托管"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="bz" :label-width="formLabelWidth">
          <el-input type="textarea" :rows="4" v-model="form.bz"></el-input>
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
  queryEmergencySupplies,
  queryEmergencyWarehouse,
  queryEmergencyUnit,
  deleteEmergencySupplies,
  addOrUpdateEmergencySupplies
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
    var validateNum = (rule, value, callback) => {
      if (value !== ""&&value!==null ) {
        if ( this.form.yxsl !== "" && this.form.yxsl!==null) {
          this.$refs.form.validateField("yxsl");  
          callback();
        }
        callback();
      } else{
        callback(new Error("常备数量不能为空!"));
      }
    };
     var validateNum2 = (rule, value, callback) => {
      if (value === ""||value===null) {
        callback();
      } else {
        if ( this.form.cbsl !=="" && this.form.cbsl !==null) {
          let num=parseInt(value);
          let num2=parseInt(this.form.cbsl);
          if(num>num2){
             callback(new Error("可使用数量不能大于常备数量!"));
          } 
          callback();
        }
        callback();
      }
    };
    return {
      searchInfo: {
        mc: null,
        bm: null,
        xzqy: null,
        cfdck: null,
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
      rules:{
        mc:[{ required: true, message: '请填写名称' }],
        bm:[{ required: true, message: '请填写编码' }],
        cfdckid:[{ required: true, message: '请选择存放地仓库' }],
        zrdwid:[{ required: true, message: '请选择责任单位' }],
        cbsl:[{ validator: validateNum, trigger: "blur", },{ required: true, message: '请填写常备数量' }],
        yxsl:[{ validator: validateNum2, trigger: "blur", },{ required: true, message: '请填写可使用数量' }],    
      }
    };
  },

  created() {
    this.getEmergencySupplies({});
    queryEmergencyUnit({}).then(res => {
      if (res.ret == "ok") {
        this.parentUnitData = res.content;
      }
    });
    queryEmergencyWarehouse({}).then(res => {
      if (res.ret == "ok") {
        this.warehousesData = res.content;
      }
    });
  },
  methods: {
          indexMethod(index){
      return (this.currentPage-1)*this.pageSize+index+1;
    },
    getEmergencySupplies(params) {
      queryEmergencySupplies(params).then(res => {
        doRes(res, this.loading, this.$message, content => {
          this.tableData = content;
        });
      });
    },
    search() {
       this.currentPage=1;
      this.getEmergencySupplies(this.searchInfo);
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

    deleteItem(wzid) {
      deleteEmergencySupplies({ wzid }).then(res => {
        if (res.ret == "ok") {
          this.getEmergencySupplies({});
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    openForm(type, data) {
      if (type == "add") {
        this.form = {
          cfdckid: null,
          ggxh: null,
          mc: null,
          bm: null,
          zrdwmc: null,
          zrdwid:null,
          szdwmc:null,
           szdwid:null,
          xzqy: null,
          gly: null,
          gyldh: null,
          cbsl: null,
          jldw: null,
          yxsl: null,
          cbxs: null,
          bz: null,
          
        };
        this.formTitle = "新增应急物资";
      } else {
        this.form = Object.assign({}, data);

        this.formTitle = "修改应急物资";
      }
      this.showForm = true;
    },
    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.isSaving=true;
          addOrUpdateEmergencySupplies(this.form).then(res => {
            this.isSaving=false;
            if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.getEmergencySupplies({});
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