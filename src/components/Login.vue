<!--  -->
<template>
  <div class="wrapper">
    <div class="bg">
      <div class="login-box">
        <h4 class="title">可视化决策指挥系统</h4>

        <el-form :model="loginForm" size="mini" ref="loginForm" label-suffix="：" :rules="rules" label-width="150px">
          <el-row>
            <el-col :span="16" style="padding:0 20px;">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="loginForm.username" style="width:90%"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="loginForm.password" show-password style="width:90%">></el-input>
              </el-form-item>
              <el-form-item label="所属机构" >
                <el-select v-model="unit" style="width:90%;color:black;">
                  <el-option label="区域一" value="1"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" style="padding:0 20px;height:140px">
              <el-button class="btn"   size="small"  @click="login('loginForm')" :loading="loading">登 录</el-button>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import {login} from '../api/api';
export default {
  data() {
    return {
      unit:'1',
      loginForm: {
        username: "",
        password: ""
      },
      rules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ],
        
        },
        loading:false,
    };
  },
  methods: {
    login(formName) {
      this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading=true;
            login({userName:this.loginForm.username,passWord:this.loginForm.password}).then(res=>{
              this.loading=false;
               if (res.ret == 'ok') {
                        sessionStorage.setItem("isLogin", this.loginForm.username);
                        localStorage.setItem('smcHcUri',res.content.smcHcUri);
                        localStorage.setItem('smcHcPwd',res.content.smcHcPwd);       
                        this.$router.push({ path: "/Home" });
                    } else {
                        this.$message.error(res.msg);
                    }
            }).catch(()=>{
                     this.loading=false;
            this.$message.error("检查网络");
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.wrapper {
  height: 100%;
  background: rgb(11, 42, 87);
  position: relative;
}
.bg {
  height: 840px;
  background: url("../assets/img/登录/denglu.png") no-repeat center;
}
.login-box {
  width: 540px;
  position: absolute;
  top: 250px;
  left: 50%;
  transform: translate(-50%);
}
.title {
  text-align: center;
  font-size: 36px;
  color: rgb(255, 179, 0);
  margin-bottom: 100px;
}
.btn{
background-color:#D63C34;
color:#FFFAAA;
 font-size: 16px;
 position:absolute;
 bottom: 20px;
}
/deep/.el-form-item__label{
    color:#15437F;
    font-size: 18px;
}
/deep/.el-input__inner{
   background-color: #ffffff;
   color:black;
}
</style>