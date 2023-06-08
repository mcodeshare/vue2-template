import Vue from 'vue'
import App from './App.vue'
// 引入sdk使用示例
import './sdk/sdk-use-example'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
