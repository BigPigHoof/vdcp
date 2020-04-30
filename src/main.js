import Vue from 'vue'
import App from './App.vue'
import './plugins/element.js'
import store from './assets/js/store'
import { router } from './router';
import './assets/iconfont/iconfont.css'
import './assets/if2/iconfont.css'

import Moment from 'moment'
import echarts from 'echarts'
Vue.prototype.$echarts = echarts

Vue.filter('dateformat', function(dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return Moment(dataStr).format(pattern)
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
