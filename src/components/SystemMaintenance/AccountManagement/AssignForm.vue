<!--  -->
<template>
  <el-dialog :title="type=='add'?'新增账号':'修改账号'" :visible="show" width="40%" @close="closeForm">
    <el-form
      v-if="show"
      :model="form"
      size="small"
      label-suffix="："
      :rules="rules"
      ref="form"
      class="form-box"
    >
      <el-form-item v-show="type=='add'" prop="dsUserName" label="用户名" :label-width="formLabelWidth">
        <el-input v-model="form.dsUserName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="dsPassWord" :label="type=='add'?'密码':'旧密码'" :label-width="formLabelWidth">
        <el-input v-model="form.dsPassWord" show-password autocomplete="new-password" ></el-input>
      </el-form-item>
       <el-form-item v-if="type=='edit'" prop="newPassWord" label="新密码" :label-width="formLabelWidth">
        <el-input v-model="form.newPassWord" show-password autocomplete="new-password" ></el-input>
      </el-form-item>
      <el-form-item prop="repeatPassword" label="确认密码" :label-width="formLabelWidth">
        <el-input v-model="form.repeatPassword" show-password autocomplete="new-password" ></el-input>
      </el-form-item>
      <el-form-item prop="smcUserName" label="SMC用户名" :label-width="formLabelWidth">
        <el-input v-model="form.smcUserName" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcPassWord" label="SMC密码" :label-width="formLabelWidth">
        <el-input v-model="form.smcPassWord" show-password autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcIP" label="SMC IP" :label-width="formLabelWidth">
        <el-input v-model="form.smcIP" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcHcUr" label="SMC URI" :label-width="formLabelWidth">
        <el-input v-model="form.smcHcUri" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item prop="smcHcPwd" label="SMC URI密码" :label-width="formLabelWidth">
        <el-input v-model="form.smcHcPwd" show-password autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="用户类型" prop="roleId" :label-width="formLabelWidth">
        <el-select autocomplete="off" v-model="form.roleId">
          <el-option :value="1" label="系统管理员"></el-option>
          <el-option :value="2" label="指挥员"></el-option>
          <el-option :value="3" label="高级用户"></el-option>
          <el-option :value="4" label="一般用户"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="账户说明" prop="remark" :label-width="formLabelWidth">
        <el-input type="textarea" :rows="4" v-model="form.remark"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status" :label-width="formLabelWidth">
        <el-radio v-model="form.status" :label="1">生效</el-radio>
          <el-radio v-model="form.status" :label="0">失效</el-radio>   
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
import {addAccountInfo,updateAccountInfo} from '../../../api/api'
export default {
  props: ["show", "type","form"],
  data() {
    console.log(this.type);
    var validatePass = (rule, value, callback) => {

      if (value === ""||value===null) {
        callback(new Error("请输入密码"));
      } else {
        var reg = new RegExp(/^(?![^a-zA-Z]+$)(?!\D+$)/);
        if(!reg.test(value)){
          callback(new Error("密码需包含数字和字母"));
        }
        if (this.type=='add' && this.form.repeatPassword !== "") {
          this.$refs.form.validateField("repeatPassword");
        }
        callback();
      }
    };
      var validateNewPass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
         var reg = new RegExp(/^(?![^a-zA-Z]+$)(?!\D+$)/);
        if(!reg.test(value)){
          callback(new Error("密码需包含数字和字母"));
        }
        if (this.form.repeatPassword !== "") {
          this.$refs.form.validateField("repeatPassword");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("确认密码不能为空"));
      } else if (value !== (this.type=='add'?this.form.dsPassWord:this.form.newPassWord)) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      formLabelWidth: "120px",
      rules: {
        dsUserName: [{ required: true, message: "用户名不能为空" }],
        dsPassWord: [
          { validator: validatePass, trigger: "blur",  },
          {
            required: true,
            trigger: "blur",
           message: this.type=='add'?"密码不能为空":"旧密码不能为空"
          }
        ],
         newPassWord: [
          { validator: validateNewPass, trigger: "blur", },{
            required: true,
            trigger: "blur",
           message:"新密码不能为空"
          }
        ],
        repeatPassword: [
          {
            validator: validatePass2,
            trigger: "blur",
       
          },{
              required: true,
            trigger: "blur",
            message: "确认密码不能为空"
          }
        ],
        smcUserName: [{ required: true, message: "SMC用户名不能为空" }],
        smcPassWord: [{ required: true, message: "SMC密码不能为空" }],
        roleId: [{ required: true, message: "用户类型不能为空" }]
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
          const doRes=res=>{
               this.isSaving=false;
             if (res.ret == "ok") {
              this.$message.success("保存成功");
              this.$emit('refresh',{});
              this.closeForm();
            } else {
              this.$message.error(res.msg);
            }
          }
          this.isSaving=true;
          if(this.type=='add'){
            addAccountInfo(this.form).then(doRes);
          }else{
            updateAccountInfo(this.form).then(doRes);
          }
      
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