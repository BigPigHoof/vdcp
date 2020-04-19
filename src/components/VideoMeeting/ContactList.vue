<!--  -->
<template>
  <ul class="contact-list">
    <li v-for="item in allData" :key="item.id">
      <div class="left">
        <span class="dot"></span>
        <span>{{item.xm}}</span>
      </div>
      <div class="right">

          <input
          :style="{visibility: item.yddh?'visible':'hidden'}"
  
            class="check"
            type="checkbox"
            v-model="selectedContacts"
            :value="{name:item.xm,uri:item.yddh}"
          />
   

        <i  :style="{visibility: item.yddh?'visible':'hidden'}" class="iconfont iconjiahao" @click="bus.$emit('openList', [{name:item.xm,uri:item.yddh}, $event])"></i>
      </div>
    </li>
  </ul>
</template>

<script>
import bus from "../../assets/js/bus";
export default {
  props: ["allData"],
  data() {
    return {
      bus,
      selectedContacts: [],
      emptyContacts: []
    };
  },
  methods: {
    checkUri(contact) {
      if (!contact.yddh) {
        this.$message.warning("此联系人没有手机号");

        this.$nextTick(() => {
          let index = this.selectedContacts.findIndex(
            item => item.id == contact.id
          );
          if (index > -1) {
            this.selectedContacts.splice(index, 1);
          }
          console.log(this.selectedContacts);
        });

        //   console.log(this.selectedContacts)
        // }
      }
    },
    stop(contact) {
      if (!contact.yddh) {
        this.$message.warning("此联系人没有手机号");
        let index = this.selectedContacts.findIndex(
          item => item.id == contact.id
        );
        if (index > -1) {
          this.selectedContacts.splice(index, 1);
          console.log(this.selectedContacts);
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.contact-list {
  & > li {
    display: flex;
    align-items: center;
    padding: 10px 0;
  }
}
.left {
  display: flex;
  align-items: center;
  width: calc(100% - 130px);
  .dot {
 
    display: inline-block;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-right: 10px;
    border-radius: 50%;
    background: rgb(21, 148, 245);
  }
}
.right {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  width: 130px;
}
</style>