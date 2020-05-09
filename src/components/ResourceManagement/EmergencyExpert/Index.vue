<!--  -->
<template>
  <div>
    <div class="search-bar">
      <el-row :gutter="30" style="margin-bottom:20px;">
        <el-col :span="6">
          <label for="name" class>名称：</label>
          <el-input size="small" id="name" v-model="searchInfo.xm"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="code">职务</label>
          <el-input size="small" id="code" v-model="searchInfo.zw"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="parentUnit">所属单位：</label>
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
        <el-col :span="6">
          <el-button type="primary" size="small" @click="search" style="margin-left:50px">查询</el-button>
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
    <el-table-column type="index" label="序号"  :index="indexMethod"></el-table-column>
      <el-table-column prop="xm" label="名称"></el-table-column>
      <el-table-column prop="zw" label="职务"></el-table-column>
      <el-table-column prop="xb" label="性别" :formatter="formatterSex"></el-table-column>
      <el-table-column prop="yddh" label="移动电话"></el-table-column>
      <el-table-column prop="jtdh" label="固定电话"></el-table-column>
      <el-table-column prop="ssdwmc" label="所属单位"></el-table-column>
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
    <el-dialog :title="formTitle" :visible.sync="showForm" width="80%">
      <el-form
        v-if="showForm"
        class="form-box"
        :model="form"
        size="small"
        label-suffix="："
        ref="form"
      >
        <el-row :gutter="30">
          <el-col :span="12">
            <el-form-item class="half" label="资源性质" prop="zyxz" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.zyxz">
                <el-option value="专家" label="专家"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="资源类型" prop="zylx" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.zylx">
                <el-option value="应急专家" label="应急专家"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="所属单位" prop="ssdwid" :label-width="formLabelWidth">
              <el-select value-key="id" v-model="form.ssdwid" filterable clearable>
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
              label="姓名"
              prop="xm"
              :label-width="formLabelWidth"
              :rules="[{ required: true, message: '请填写姓名' }]"
            >
              <el-input v-model="form.xm" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="职务" prop="zw" :label-width="formLabelWidth">
              <el-input v-model="form.zw" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="出生年月" prop="csrq" :label-width="formLabelWidth">
              <el-date-picker v-model="form.csrq" type="date"></el-date-picker>
            </el-form-item>
            <el-form-item class="half" label="性别" prop="xb" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.xb">
                <el-option value="1" label="男"></el-option>
                <el-option value="0" label="女"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="政治面貌" prop="zzmm" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.zzmm">
                <el-option value="中共党员" label="中共党员"></el-option>
                <el-option value="中共预备党员" label="中共预备党员"></el-option>
                <el-option value="共青团员" label="共青团员"></el-option>
                <el-option value="群众" label="群众"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="移动电话" prop="yddh" :label-width="formLabelWidth">
              <el-input v-model="form.yddh" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="家庭电话" prop="jtdh" :label-width="formLabelWidth">
              <el-input v-model="form.jtdh" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="办公电话" prop="bgdh" :label-width="formLabelWidth">
              <el-input v-model="form.bgdh" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="最高学历" prop="zgxl" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.zgxl">
                <el-option value="1" label="博士研究生"></el-option>
                <el-option value="2" label="硕士研究生"></el-option>
                <el-option value="3" label="本科"></el-option>
                <el-option value="4" label="专科"></el-option>
                <el-option value="5" label="中专/高中"></el-option>
                <el-option value="6" label="初中"></el-option>
                <el-option value="7" label="小学"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="通讯地址" prop="txdz" :label-width="formLabelWidth">
              <el-input v-model="form.txdz" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="电子邮件" prop="dzyj" :label-width="formLabelWidth">
              <el-input v-model="form.dzyj" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="专业类别" prop="zylb" :label-width="formLabelWidth">
              <el-input v-model="form.zylb" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="成员职称" prop="zc" :label-width="formLabelWidth">
              <el-input v-model="form.zc" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="毕业院校" prop="byyx" :label-width="formLabelWidth">
              <el-input v-model="form.byyx" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="个人专长" prop="grzc" :label-width="formLabelWidth">
              <el-input type="textarea" :rows="3" v-model="form.grzc"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="tx" :label-width="formLabelWidth" style="text-align:center;">
              <el-upload
                style="display:inline-block;"
                :action="imageUploadUrl"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="form.tx" :src="imgSrc?imgSrc:ip+form.tx" style="width:100%;" />
                <i v-else class="upload-icon" :class="isUploading?'el-icon-loading':'el-icon-plus'"></i>
              </el-upload>
            </el-form-item>
            <el-form-item label="应急处置经验" prop="czjy" :label-width="formLabelWidth">
              <el-input type="textarea" :rows="3" v-model="form.czjy"></el-input>
            </el-form-item>
            <el-form-item label="学术成果" prop="xscg" :label-width="formLabelWidth">
              <el-input type="textarea" :rows="3" v-model="form.xscg"></el-input>
            </el-form-item>
            <el-form-item label="责任单位" prop="zrdwid" :label-width="formLabelWidth">
              <el-select value-key="id" v-model="form.zrdwid" filterable clearable>
                <el-option
                  v-for="item in parentUnitData"
                  :key="item.id"
                  :label="item.dwmc"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
               <el-form-item  prop="sfyx" :label-width="formLabelWidth">
               <el-checkbox v-model="form.sfyx" >有效性</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
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
import {formatterSex} from '../../../assets/js/function'
import {
  queryEmergencyUnit,
  queryEmergencyExpert,
  deleteEmergencyExpert,
  addOrUpdateEmergencyExpert
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
        xm: null,
        zw: null,
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
      formLabelWidth: "110px",
      isSaving: false,
      isUploading: false,
      imgSrc: null,
      imageUploadUrl: window.config.apiIp + "/file/imageUpload/",
      ip: window.config.apiIp,
        currentPage:1,
      pageSize:30,
    };
  },

  created() {
    this.getEmergencyExpert({});
    this.getEmergencyUnit({});
  },
  methods: {
      indexMethod(index){
      return (this.currentPage-1)*this.pageSize+index+1;
    },
    getEmergencyExpert(params) {
      queryEmergencyExpert(params).then(res => {
        doRes(res, this.loading, this.$message, content => {
          this.tableData = content;
        });
      });
    },
    getEmergencyUnit() {
      queryEmergencyUnit({}).then(res => {
        doRes(res, this.isSearchingParent, this.$message, content => {
          this.parentUnitData = content;
        });
      });
    },
    search() {
       this.currentPage=1;
      this.getEmergencyExpert(this.searchInfo);
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

    formatterSex,
    deleteItem(zjid) {
      deleteEmergencyExpert({ zjid }).then(res => {
        if (res.ret == "ok") {
          this.getEmergencyExpert({});
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    openForm(type, data) {
      if (type == "add") {
        this.form = {
          zyxz: null,
          zylx:null,
          ssdwmc: null,
          ssdwid:null,
          xm: null,
          zw: null,
          csrq: null,
          xb: null,
          zzmm: null,
          yddh: null,
          jtdh: null,
          bgdh: null,
          txdz: null,
          dzyj: null,
          zylb: null,
          zc: null,
          byyx: null,
          grzc: null,
          czjy: null,
          xscg: null,
          zgxl: null,
          zrdwid: null,
          sfyx:false
        };
        this.formTitle = "新增应急专家";
      } else {
        this.form = Object.assign({}, data);
        this.formTitle = "修改应急专家";
      }
      this.showForm = true;
    },
    handleAvatarSuccess(res, file) {
      this.isUploading = false;
      if (res.ret == "ok") {
        this.form.tx = res.content;
        this.imgSrc = URL.createObjectURL(file.raw);
      } else {
        this.$message.error(res.msg);
      }
      console.log(this.imageUrl);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG、PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      if (isJPG && isLt2M) {
        this.isUploading = true;
      }
      return isJPG && isLt2M;
    },

    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log(this.form);
          addOrUpdateEmergencyExpert(this.form).then(res => {
            if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.getEmergencyExpert({});
              this.showForm = false;
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
<style scoped>
.upload-icon {
  font-size: 30px;
}
.upload-icon :hover {
  color: #409eff;
}
</style>