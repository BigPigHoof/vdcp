<!--  -->
<template>
  <div>
    <el-dialog title="修改密码" :visible.sync="show" width="50%" :modal="false">
      <el-form v-if="show" :model="form" size="small"    :rules="rules" label-suffix="：" ref="form" class="form-box">
        <el-form-item prop="passWord" label="旧密码" :label-width="formLabelWidth">
          <el-input v-model="form.passWord" show-password autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="newPassWord" label="新密码" :label-width="formLabelWidth">
          <el-input v-model="form.newPassWord" show-password autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="repeatPassword" label="确认密码" :label-width="formLabelWidth">
          <el-input v-model="form.repeatPassword" show-password autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div style="text-align:center;">
        <el-button type="primary" size="small" :loading="isSaving" @click="save">保存</el-button>
        <el-button type="primary" size="small" @click="show=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {updatePassword} from '../../api/api'
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.form.repeatPassword !== "") {
          this.$refs.form.validateField("repeatPassword");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.form.newPassWord) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      formLabelWidth: "100px",
      show: true,
      isSaving: false,
      form: {
          userName:sessionStorage.getItem('isLogin'),
        passWord: "",
        newPassWord: "",
        repeatPassword: ""
      },
      rules: {
        passWord: [
          { required: true, trigger: "blur", message: "旧密码不能为空" }
        ],
        newPassWord: [
          {
            validator: validatePass,
            required: true,
            trigger: "blur",
            message: "新密码不能为空"
          }
        ],
        repeatPassword: [
          {
            validator: validatePass2,
            required: true,
            trigger: "blur",
            message: "确认密码需一致"
          }
        ]
      }
    };
  },
  methods: {
    save() {
           this.$refs["form"].validate(valid => {
        if (valid) {
        
          this.isSaving=true;
          updatePassword(this.form).then(res=>{
             this.isSaving=false;
             if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.$refs.form.resetFields();
            } else {
              this.$message.error(res.msg);
            }
          })
        } else {
          return false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.form-box{
    padding: 0 30px;
    
    /deep/.el-form-item__content{
        margin-right: 100px;
    }
}
</style>