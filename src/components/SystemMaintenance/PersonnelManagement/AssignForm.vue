<!--  -->
<template>
  <el-dialog title="分配用户" :visible="show" width="40%" @close="closeForm">
    <el-form
      v-if="show"
      :model="form"
      size="small"
      label-suffix="："
      :rules="rules"
      ref="form"
      class="form-box"
    >
      <el-form-item label="人员" :label-width="formLabelWidth">
        <el-input disabled v-model="person.xm"></el-input>
      </el-form-item>
      <el-form-item prop="userName" label="用户名" :label-width="formLabelWidth">
        <el-input v-model="form.userName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="passWord" label="密码" :label-width="formLabelWidth">
        <el-input v-model="form.passWord" show-password autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="repeatPassword" label="确认密码" :label-width="formLabelWidth">
        <el-input v-model="form.repeatPassword" show-password autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcUserName" label="SMC用户名" :label-width="formLabelWidth">
        <el-input v-model="form.smcUserName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcPassWord" label="SMC密码" :label-width="formLabelWidth">
        <el-input v-model="form.smcPassWord" show-password autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcIp" label="SMC IP" :label-width="formLabelWidth">
        <el-input v-model="form.smcIp" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcHcUr" label="SMC URI" :label-width="formLabelWidth">
        <el-input v-model="form.smcHcUr" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcHcPwd" label="SMC URI密码" :label-width="formLabelWidth">
        <el-input v-model="form.smcHcPwd" show-password autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="用户类型" prop="roleId" :label-width="formLabelWidth">
        <el-select autocomplete="off" v-model="form.roleId">
          <el-option value="1" label="系统管理员"></el-option>
          <el-option value="2" label="指挥员"></el-option>
          <el-option value="3" label="高级用户"></el-option>
          <el-option value="4" label="一般用户"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="账户说明" prop="remark" :label-width="formLabelWidth">
        <el-input type="textarea" :rows="4" v-model="form.remark"></el-input>
      </el-form-item>
      <div style="text-align:center;">
        <el-button type="primary" size="small" @click="$refs.form.resetFields()">重置</el-button>
        <el-button type="primary" size="small" :loading="isSaving" @click="save">保存</el-button>
        <el-button type="primary" size="small" @click="closeForm">关闭</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script>
import {distributionAccount} from '../../../api/api'
export default {
  props: ["show", "person"],
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
      } else if (value !== this.form.passWord) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      formLabelWidth: "120px",
      form: {
        userName: "",
        passWord: "",
        repeatPassword: "",
        smcUserName: "",
        smcPassWord: "",
        smcIp: "",
        smcHcUr: "",
        smcHcPwd: "",
        roleId: "",
        remark: "",
        personId: ""
      },
      rules: {
        userName: [{ required: true, message: "用户名不能为空" }],
        passWord: [
          { validator: validatePass,required: true, trigger: "blur", message: "密码不能为空" }
        ],
        repeatPassword: [
          {
            validator: validatePass2,
            required: true,
            trigger: "blur",
            message: "确认密码需一致"
          }
        ],
        smcUserName: [{ required: true, message: "SMC用户名不能为空" }],
        smcPassWord: [{ required: true, message: "SMC密码不能为空" }],
        roleId: [{ required: true, message: "用户名不能为空" }]
      },
      isSaving: false
    };
  },
  methods: {
    closeForm() {
      this.$emit("update:show", false);
    },
    save() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.personId=this.person.id;
          this.isSaving=true;
          distributionAccount(this.form).then(res=>{
             this.isSaving=false;
             if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.closeForm();
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
<style scoped>
</style>