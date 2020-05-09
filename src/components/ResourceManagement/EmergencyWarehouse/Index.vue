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
          <el-button type="primary" size="small" @click="search" style="margin-left:50px">查询</el-button>
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
            id="parentUnit"
            size="small"
            value-key="id"
            v-model="searchInfo.ssdwid"
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
      <el-table-column prop="mc" label="名称"></el-table-column>
      <el-table-column prop="cfdd" label="地址"></el-table-column>
      <el-table-column prop="ssdwmc" label="所属单位"></el-table-column>
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
      <el-pagination
      :current-page.sync="currentPage"
      :page-size="pageSize"
      layout="prev, pager, next, jumper"
      :total="tableData.length">
    </el-pagination>
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
            <el-form-item class="half" label="资源性质" prop="zyxz" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.zyxz">
                <el-option value="应急物资" label="应急物资"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="资源类型" prop="zylx" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.zylx">
                <el-option value="应急仓库" label="应急仓库"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              class="half"
              label="名称"
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
            <el-form-item class="half" label="所在单位" prop="ssdwid" :label-width="formLabelWidth">
              <el-select value-key="id" v-model="form.ssdwid" filterable clearable>
                <el-option
                  v-for="item in parentUnitData"
                  :key="item.id"
                  :label="item.dwmc"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="负责人" prop="fzr" :label-width="formLabelWidth">
              <el-select value-key="id" v-model="form.fzr" filterable clearable>
                <el-option
                  v-for="item in personsData"
                
                  :key="item.id"
                  :label="item.xm"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="负责人职务"  :label-width="formLabelWidth">
              <el-input v-model="form.fzr.zw" readonly autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="负责人办公电话"  :label-width="formLabelWidth">
              <el-input v-model="form.fzr.bgdh" readonly autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="负责人家庭电话"  :label-width="formLabelWidth">
              <el-input v-model="form.fzr.jtdh" readonly autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="负责人移动电话"  :label-width="formLabelWidth">
              <el-input v-model="form.fzr.yddh" readonly autocomplete="off"></el-input>
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
            <el-form-item class="half" label="仓库类型" prop="cklx" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.cklx">
                <el-option value="应急仓库" label="应急仓库"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="职能/用途" prop="zn" :label-width="formLabelWidth">
              <el-input type="textarea" :rows="4" v-model="form.zn"></el-input>
            </el-form-item>
            <el-form-item label="地址" prop="cfdd" :label-width="formLabelWidth">
              <el-input v-model="form.cfdd" autocomplete="off">
                <i slot="suffix" class="el-input__icon el-icon-search" @click="searchAddress"></i>
              </el-input>
            </el-form-item>
            <el-form-item class="half" label="经度" :label-width="formLabelWidth">
              <el-input v-model="form.jd" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="纬度" :label-width="formLabelWidth">
              <el-input v-model="form.wd" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="责任单位" prop="zrdwid" :label-width="formLabelWidth">
              <el-select value-key="id" v-model="form.zrdwid" filterable clearable>
                <el-option
                  v-for="item in parentUnitData"
                  :key="item.id"
                  :label="item.dwmc"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="主管领导" prop="zgldid" :label-width="formLabelWidth">
              <el-select value-key="id" v-model="form.zgldid" filterable clearable>
                <el-option
                  v-for="item in personsData"
                  :key="item.id"
                  :label="item.xm"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="联络员" prop="llyid" :label-width="formLabelWidth">
              <el-select value-key="id" v-model="form.llyid" filterable clearable>
                <el-option
                  v-for="item in personsData"
                  :key="item.id"
                  :label="item.xm"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item class="half" prop="sfyx" :label-width="formLabelWidth">
               <el-checkbox v-model="form.sfyx" @change="changeCheck">有效性</el-checkbox>
            </el-form-item>

            <el-form-item style="text-align:center;">
              <el-button type="primary" size="small" :loading="isSaving" @click="save">保存</el-button>
              <el-button type="primary" size="small" @click="showForm=false">关闭</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <MiniMap :address="this.form.cfdd" :showForm="showForm" ref="miniMap" @getPosition="setPosition"></MiniMap>
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
  queryEmergencyWarehouse,
  addOrUpdateEmergencyWarehouse,
  deleteEmergencyWarehouse,
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
        xzqy: null,
        zn: null,
        ssdwid: null
      },
      options: regionData,
      loading: false,
      tableData: [],
      isSearchingParent: false,
      parentUnitData: [],
      showForm: false,
      formTitle: "",
      form: {},
      formLabelWidth: "150px",
      isSaving: false,
      personsData: [],
      checked:false,
       currentPage:1,
      pageSize:30,

    };
  },
  components: { MiniMap },
  created() {

    this.getEmergencyWarehouse({});
    this.getEmergencyUnit();
    queryPerson({}).then(res=>{
      if(res.ret=='ok'){
        this.personsData=res.content;
      }
    })
  },
  methods: {
         indexMethod(index){
      return (this.currentPage-1)*this.pageSize+index+1;
    },
    getEmergencyUnit() {
      queryEmergencyUnit({}).then(res => {
        doRes(res, this.isSearchingParent, this.$message, content => {
          this.parentUnitData = content;
        });
      });
    },
    getEmergencyWarehouse(params) {
      queryEmergencyWarehouse(params).then(res => {
        doRes(res, this.loading, this.$message, content => {
          this.tableData = content;
        });
      });
    },
    search() {
      this.currentPage=1;
      this.getEmergencyWarehouse(this.searchInfo);
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

    deleteItem(ckid) {
      deleteEmergencyWarehouse({ ckid }).then(res => {
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
          zyxz: null,
          zylx: null,
          ssdwmc: null,
          ssdwid:null,
          mc: null,
          bm: null,
          fzr: {
            zw:null,
            yddh: null,
            jtdh:null,
            bgdh: null,
          },
          xzqy: null,
          cklx: null,
          zn: null,
          cfdd: null,
          jd: null,
          wd: null,
          zrdwid: null,
          zgldid: null,
          llyid: null,
          sfyx: false
        };
        this.formTitle = "新增应急仓库";
      } else {
        let formData = Object.assign({}, data);
        if(!formData.fzr){
          formData.fzr= {
            zw:null,
            yddh: null,
            jtdh:null,
            bgdh: null,
          };
        }
        if(formData.zgld){
          formData.zgldid=formData.zgld.id;
          delete formData.zgld;
        }
        if(formData.lly){
          formData.llyid=formData.lly.id;
            delete formData.lly;
        }
        this.form = formData;
        this.formTitle = "修改应急仓库";
      }
      this.showForm = true;
    },
    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log(this.form);
          if(this.form.fzr.id){
            this.form.fzrid=this.form.fzr.id;
          }
          delete this.form.fzr;
          addOrUpdateEmergencyWarehouse(this.form).then(res => {
            if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.getEmergencyWarehouse({});
              this.checked=false;
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
    },
changeCheck(val){
  console.log(val)
  // this.form.sfyx=val?1:0;
},
    searchAddress() {
      this.$refs.miniMap.searchAddress();
    },
    setPosition(pos) {
      if (Array.isArray(pos)) {
        if (pos.length == 3) {
          this.form.jd = pos[0];
          this.form.wd = pos[1];
          this.form.cfdd=pos[2];
        }
      }
    }
  }
};
</script>
<style scoped>
</style>