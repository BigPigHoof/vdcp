<!--  -->
<template>
  <div>
    <el-dialog :title="title" :visible="show" width="60%" @close="closeForm">
      <el-form v-if="show" :model="form" size="small" label-suffix="：" ref="form" class="form-box">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item prop="tx">
              <el-upload
                :action="imageUploadUrl"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="form.tx" :src="imgSrc?imgSrc:ip+form.tx" style="width:100%;" />
                <i v-else class="upload-icon" :class="isUploading?'el-icon-loading':'el-icon-plus'"></i>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item
              class="half"
              label="姓名"
              prop="xm"
              :label-width="formLabelWidth"
              :rules="[{ required: true, message: '请填写姓名' }]"
            >
              <el-input v-model="form.xm" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="上级机构" prop="jgmc" :label-width="formLabelWidth">
              <el-select
                autocomplete="off"
                v-model="form.jgmc"
                filterable
                @visible-change="searchAgency"
                clearable
                :loading="isSearchingAgency"
              >
                <el-option
                  v-for="item in agencyData"
                  :key="item.id"
                  :label="item.zzjgmc"
                  :value="item.zzjgmc"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="职务" prop="zw" :label-width="formLabelWidth">
              <el-input v-model="form.zw" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="组建日期" prop="csrq" :label-width="formLabelWidth">
              <el-date-picker v-model="form.csrq" type="date"></el-date-picker>
            </el-form-item>
            <el-form-item class="half" label="性别" prop="xb" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.xb">
                <el-option value="0" label="女"></el-option>
                <el-option value="1" label="男"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="half" label="政治面貌" prop="zzmm" :label-width="formLabelWidth">
              <el-select autocomplete="off" v-model="form.zzmm">
                <el-option value="1" label="中共党员"></el-option>
                <el-option value="2" label="中共预备党员"></el-option>
                <el-option value="3" label="共青团员"></el-option>
                <el-option value="4" label="群众"></el-option>
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
            <el-form-item class="half" label="专业类别" prop="zylb" :label-width="formLabelWidth">
              <el-input v-model="form.zylb" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="half" label="职称" prop="zc" :label-width="formLabelWidth">
              <el-input v-model="form.zc" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="通讯地址" prop="txdz" :label-width="formLabelWidth">
              <el-input v-model="form.txdz" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="电子邮件" prop="dzyj" :label-width="formLabelWidth">
              <el-input v-model="form.dzyj" autocomplete="off"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div style="text-align:center;">
          <el-button type="primary" size="small" @click="$refs.form.resetFields()">重置</el-button>
          <el-button type="primary" size="small" :loading="isSaving" @click="save">保存</el-button>
          <el-button type="primary" size="small" @click="closeForm">关闭</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { queryOganization, addPerson } from "../../../api/api";
export default {
  props: ["show", "form", "title"],
  data() {
    return {
      agencyData: [],
      isSearchingAgency: false,
      formLabelWidth: "120px",
      isUploading: false,
      imgSrc: null,
      imageUploadUrl: window.config.apiIp + "/file/imageUpload/",
      isSaving: false,
      ip: window.config.apiIp
    };
  },

  methods: {
    closeForm() {
      this.$emit("update:show", false);
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
    save() {
      console.log(this.form);
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.isSaving = true;
          addPerson(this.form).then(res => {
            this.isSaving = false;
            if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.closeForm();
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
.upload-icon {
  font-size: 30px;
  &:hover {
    color: #409eff;
  }
}
.form-box {
  .el-input {
    width: 100%;
  }
  .half {
    display: inline-block;
    width: 50%;
  }
}
</style>