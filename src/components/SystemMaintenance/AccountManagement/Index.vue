<!--  -->
<template>
  <div>
        <div class="search-bar">
      <el-row :gutter="30">
        <el-col :span="6">
          <label for="name" class>账号：</label>
          <el-input size="small" id="name" v-model="searchInfo.xm"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="code">类型：</label>
          <el-input size="small" id="code" v-model="searchInfo.lx"></el-input>
        </el-col>
        <el-col :span="6">
          <label for="parentBody">状态：</label>
          <el-select
            size="small"          
            v-model="searchInfo.zt"
            filterable
            clearable
            :loading="isSearchingAgency"
          >
            <el-option
              :label="1"
              value="离线"
            ></el-option>
          </el-select>
        </el-col>
     
      </el-row>
    </div>
      <div class="function">
      <el-checkbox v-model="isChecked">只显示有账号的用户账号名</el-checkbox>
      <div class="btns">
        <el-button v-if="$store.state.hasCompetence" type="primary" size="small" >新增</el-button>
        <el-button type="primary" size="small" >查询</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
        searchInfo:{
            xm:'',
            lx:'',
            zt:''

        },
        isChecked:false

    };
  },

  components: {},

}

</script>
<style lang="scss" scoped>


</style>