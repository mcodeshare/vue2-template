import Vue from 'vue'
import App from './App.vue'

/* *******************************sdk使用示例开始（可抽离单独js在入口文件引用）************************************************ */
/* 引入sdk */
import AmarSdk from './amar-sdk'

/* 将sdk挂载到window上 */
new AmarSdk({
  // 是否开启调试，开启调试会在控制台打印日志
  debug: true,
  // 父页面发送的所有消息都会触发此回调函数
  onMessage: (data) => {
    // 此处推荐使用策略模式，可防止判断条件过多不宜维护,也可自行通过事件总线通知到项目其他使用部分
    // alert(JSON.stringify(data))
    console.log('初始化sdk的onMessage回调', data)
  },
  // sdk挂载完成会触发
  ready: () => {
    console.log('sdk初始化完成')
  }
})

// 通过sdk发送消息，发送的消息可以根据实际情况修改，只要能被JSON.stringify 和 JSON.parse 正常处理即可
const data = {
  type: 'amar',
  data: {
    path: 'http://xxxx.com/xxx.png',
  },
  action: 'SAVE_IMAGE_TO_PHOTOS_ALBUM'
}
window.amarSdk.postMessage(data);
/* *******************************sdk使用示例结束************************************************ */

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
