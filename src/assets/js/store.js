import Vue from 'vue'
import vuex from 'vuex'
Vue.use(vuex);

export default new vuex.Store({
    state:{
        mainSite:{
            name: "",
            mainSiteUri: ""
        },
        selectedSites:[]
    },
    mutations:{
        update(state,newVal){//这里的state对应着上面这个state
            state.mainSite = newVal;
            //你还可以在这里执行其他的操作改变state
        }
    }
})