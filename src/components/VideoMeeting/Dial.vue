<!--  -->
<template>
  <div class="dial-box">
    <div class="dial" v-show="showDial">
      <input
        class="phone"
        type="text"
        ref="phone"
        readonly
        @input="inputPhone"
        v-model="callNumber"
        name="phone"
        id="phone"
        maxlength="11"
      />
      <p class="tip">
        <span>{{phoneTip}}</span>
        <span></span>
        
        </p>
      <div class="numbers">
        <span v-for="num in 9" :key="num" @click="inputNumber(num)">{{num}}</span>
        <span @click="inputNumber('*')">*</span>
        <span @click="inputNumber('0')">0</span>
        <span @click="inputNumber('#')">#</span>
      </div>
    </div>

    <div class="call-record" v-show="!showDial">
      <div class="module-head">
        <h5 class="module-title">通话记录</h5>
      </div>
      <div class="title">
        <span class="person" style="width:60px;">联系人</span>
        <span class="number">电话号码</span>
        <span class="time">通话时间</span>
      </div>
      <ul class="record-content scroll-content">
        <li v-for="item in records" :key="item.id">
          <span class="person">{{item.name}}</span>
          <span class="number">{{item.phone}}</span>
          <span class="time">{{item.callDate}}</span>
        </li>
      </ul>
    </div>

    <div class="btns">
      <svg class="icon svg-icon" aria-hidden="true" @click="showDial=true">
        <use xlink:href="#icondianhuajianpan" />
      </svg>
      <svg class="icon svg-icon" aria-hidden="true" @click="showDial=false">
        <use xlink:href="#iconthjl" />
      </svg>
      <!-- <span class="record" @click="showDial=false"></span> -->
      <svg class="icon svg-icon" aria-hidden="true" @click="callPhone">
        <use xlink:href="#iconjieting" />
      </svg>
      <svg class="icon svg-icon" aria-hidden="true" @click="deletePhone">
        <use xlink:href="#iconbohaoquxiao" />
      </svg>
    </div>
  </div>
</template>

<script>
import { queryCallRecord,voiceCall } from "../../api/api";

export default {
  props:['meetingId',"meetings"],
  data() {
    return {
      callNumber: "",
      phoneTip: "",
      showDial: true,
      records: [],

    };
  },
  created() {
    this.getCallRecord();
  },
  components: {},
  methods: {
    getCallRecord() {
      queryCallRecord().then(res => {
        if (res.ret == "ok") {
          this.records = res.content;
        }
      });
    },
    inputNumber(num) {
      if (this.callNumber.length >= 11) {
        return;
      }
      this.callNumber += num.toString();
    },
    inputPhone(e) {
      console.log(e);
      // let filtered = e.target.value.replace(/^0|[^\d]/g, "");
      // if (this.callNumber != filtered) {
      //   this.callNumber = filtered;
      // }
    },

    callPhone() {
      if(this.callNumber){
        if(this.meetingId){
          let params={
            siteName:this.callNumber,
            siteUri:this.callNumber,
            meetId:this.meetingId
          }
           this.phoneTip='拨打中...';
        voiceCall(params).then(res=>{
           this.phoneTip='';
          if(res.ret=='ok'){
            this.callNumber='';
            this.$message.success('拨打成功');
            this.$emit('refresh');
           
          }else{
            this.$message.error(res.msg);
          }
        }).catch(err=>{  this.phoneTip='';this.$message.error(err);});
        }else{
          this.$message.warning('没有在召开的会议');
        }
        
      }else{
        this.$message.warning('不能为空号');
      }
 
    },
    deletePhone() {
      this.callNumber = this.callNumber.substr(0, this.callNumber.length - 1);
    }
  }
};
</script>
<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
.dial-box {
  display: flex;
  flex-direction: column;
  .call-record {
    height: 370px;
    .title {
      text-align: center;
      height: 44px;
      line-height: 44px;
      margin-top: 18px;
      margin-bottom: 8px;
      color: #a3d6ff;
      font-size: 18px;
      border-top: 1px solid #32c5ff;
      border-bottom: 1px solid #32c5ff;
    }
    .person {
      display: inline-block;
      width: 50px;
    }
    .number {
      display: inline-block;
      width: 96px;
    }
    .time {
      display: inline-block;
      width: 160px;
    }
    .record-content {
      font-size: 15px;
      height: 260px;
      text-align: right;
      & > li {
        line-height: 36px;
        display: flex;
        justify-content: space-between;
        & > span {
          // text-overflow: ellipsis;
          // overflow: hidden;
          // white-space: nowrap;
        }
      }
    }
  }
  .phone {
    font-size: 22px;
    letter-spacing: 6px;
    text-align: center;
    color: #ffffff;
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
  }
  .tip {
    height: 22px;
    text-align: center;
  }
  .numbers {
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    & > span {
      line-height: 60px;
      margin: 0 10px 20px;
      box-sizing: border-box;
      text-align: center;
      border-radius: 50%;
      background: #385975;

      width: 60px;
      height: 60px;
      cursor: pointer;
      font-size: 22px;

      &:hover {
        background-image: linear-gradient(
          rgba(255, 255, 255, 0.2),
          rgba(255, 255, 255, 0.2)
        );
      }
    }
  }
  .btns {
    text-align: center;
    .record {
      width: 60px;
      height: 60px;
      margin: 0 5px;
      display: inline-block;
      border-radius: 50%;
      background: url(../../assets/img/视频会商/通话记录.svg);
      background-size: contain;
      cursor: pointer;
    }
    & > svg {
      width: 60px;
      height: 60px;
      margin: 0 5px;
      cursor: pointer;

      &:hover {
        border-radius: 50%;
        background-image: linear-gradient(
          rgba(255, 255, 255, 0.2),
          rgba(255, 255, 255, 0.2)
        );
      }
    }
  }
}
</style>