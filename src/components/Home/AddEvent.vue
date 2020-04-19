<!--  -->
<template>
  <el-dialog
    width="1800px"
    :append-to-body="true"
    title="新建事件"
    @close="change"
    @open="check"
    :visible="dialogFormVisible"
  >
    <el-row>
      <el-col :span="12" style="height:700px">
        <el-form class="form" :model="form" ref="form" label-width="140px" label-suffix="：">
          <el-form-item label="事件标题">
            <el-input v-model="form.title" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="关键字">
            <el-input v-model="form.keyword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="事发详情">
            <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="form.content"></el-input>
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="form.address" autocomplete="off">
              <i slot="suffix" class="el-input__icon el-icon-search" @click="searchAddress"></i>
            </el-input>
          </el-form-item>
          <el-form-item class="half" label="经度">
            <el-input v-model="form.longitude" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item class="half" label="纬度">
            <el-input v-model="form.latitude" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item class="half" label="事发时间">
            <el-date-picker
              style="width:100%"
              v-model="form.occurrTime"
              type="datetime"
              placeholder="选择日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item class="half" label="事件来源">
            <el-select style="width:100%" v-model="form.source" placeholder="请选择">
              <el-option value="辅助立案">辅助立案</el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="half" label="报警人">
            <el-input v-model="form.alarmPersonName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item class="half" label="报警人电话">
            <el-input v-model="form.alarmPersonContact" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item class="half" label="事件类型">
            <el-select style="width:100%" v-model="form.type" placeholder="请选择">
              <el-option value="交通事故">交通事故</el-option>
              <el-option value="严重暴力事件">严重暴力事件</el-option>
              <el-option value="群体性事件">群体性事件</el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="half" label="事件等级">
            <el-radio-group class="level-group" v-model="form.level">
              <el-radio label="1"></el-radio>
              <el-radio label="2"></el-radio>
              <el-radio label="3"></el-radio>
              <el-radio label="4"></el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="btn-box">
            <el-button type="primary" @click="onSubmit" :loading="saving">保存</el-button>
            <el-button type="primary" @click="change">取消</el-button>
          </div>
        </el-form>
      </el-col>
      <el-col :span="12">
        <div class="map">
          <div id="miniMap"></div>
          <div id="pickerBox" v-show="showAMapUI">
            <input v-model="searchName" id="pickerInput" />
            <div id="poiInfo"></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import AMap from "AMap";
import AMapUI from "AMapUI";
import { addIncidentInfo } from "../../api/api";
import { get } from "../../api/http";
export default {
  props: ["dialogFormVisible"],
  data() {
    return {
      form: {
        title: "",
        keyword: "",
        content: "",
        address: "",
        longitude: "",
        latitude: "",
        occurrTime: "",
        source: "",
        alarmPersonName: "",
        alarmPersonContact: "",
        type: "",
        level: ""
      },
      miniMap: null,
      AMapUI: null,
      showAMapUI: false,
      poiPicker: null,
      searchName: "",
      saving: false
    };
  },

  methods: {
    change() {
      this.reset();
      this.$emit("update:dialogFormVisible", false);
    },
    check() {
      if (!this.miniMap) {
        this.$nextTick(this.initMiniMap);
      }
    },
    reset() {
       for (const key in  this.form) {
            this.form[key]=''
         }
    },
    onSubmit() {
      for (const key in this.form) {
         if(!this.form[key]){
           this.$message.warning('请填写完整');
           return;
         }
      }
      this.saving = true;
      addIncidentInfo(this.form).then(res => {
        this.saving = false;
        if (res.ret == "ok") {
          this.$message.success("保存成功");
          this.$emit('refresh');
          this.dialogFormVisible=false;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    initMiniMap() {
      const that=this;
      this.miniMap = new AMap.Map("miniMap", {
        mapStyle: "amap://styles/darkblue", //设置地图的显示样式
        resizeEnable: true,
        zoom: 10
      });
       this.miniMap.on('click', e=>{
        let parameters={
          key:'1ebd4abbc27a1411331a30ae13570a11',
          location:e.lnglat.lng+','+e.lnglat.lat
        }
        get('https://restapi.amap.com/v3/geocode/regeo',parameters).then(res=>{
          that.form.address=res.regeocode.formatted_address;
          that.form.longitude = e.lnglat.lng;
          that.form.latitude = e.lnglat.lat;
        })
       });
      this.initAMapUI();
      console.log(this.miniMap);
    },
    initAMapUI() {
      const map = this.miniMap;
      const that = this;
      AMapUI.loadUI(["misc/PoiPicker"], function(PoiPicker) {
        that.poiPicker = new PoiPicker({
          input: "pickerInput"
        });
        var marker = new AMap.Marker();
        that.poiPicker.on("poiPicked", function(poiResult) {
          console.log(poiResult)
          var poi = poiResult.item;
          marker.setMap(map);
          marker.setPosition(poi.location);
          map.setCenter(poi.location);
           that.form.address=poiResult.item.name;
          that.form.longitude = poi.location.lng;
          that.form.latitude = poi.location.lat;
        });
      });
    },
    searchAddress() {
      if (this.form.address) {
        const address = this.form.address;
        this.searchName = address;
        this.poiPicker.suggest(address);
        this.showAMapUI = true;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.form {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
.half {
  display: inline-block;
  width: 50%;
}
.level-group {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /deep/.el-radio {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: red;
    &:nth-child(1) {
      background-color: rgba(197, 45, 45, 0.2);
      &.is-checked {
        background-color: rgba(197, 45, 45, 1);
      }
    }
    &:nth-child(2) {
      background-color: rgba(244, 164, 96, 0.2);
      &.is-checked {
        background-color: rgba(244, 164, 96, 1);
      }
    }
    &:nth-child(3) {
      background-color: rgba(255, 215, 0, 0.2);
      &.is-checked {
        background-color: rgba(255, 215, 0, 1);
      }
    }
    &:nth-child(4) {
      background-color: rgba(0, 255, 0, 0.2);
      &.is-checked {
        background-color: rgba(0, 255, 0, 1);
      }
    }
    .el-radio__label {
      color: transparent;
    }
  }
  /deep/ .el-radio__input {
    display: none;
  }
}
.btn-box {
  text-align: center;
  /deep/.el-button {
    margin: 0 50px;
    padding: 10px 32px;
    border-radius: 6px;
  }
}
.el-icon-search {
  color: #adccdd;
  font-size: 22px;
  cursor: pointer;
}
.map {
  width: 100%;
  height: 700px;
  position: relative;
  background: rgba(6, 15, 21, 0.62);
  border: 1px solid #adccdd;
  #miniMap {
    width: 100%;
    height: 100%;
  }
  #pickerBox {
    position: absolute;
    z-index: 9999;
    top: 50px;
    left: 20px;
    width: 300px;
  }

  #pickerInput {
    width: 200px;
    padding: 5px 5px;
  }
}
/deep/.el-col-12 {
  padding: 0 30px;
}
</style>