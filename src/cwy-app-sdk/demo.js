/* 引入sdk */
import CwyAppSdk from '.'

new CwyAppSdk({
  // 是否开启调试，开启调试会在控制台打印日志
  debug: true,

  // sdk挂载完成会触发
  ready: () => {
    // console.log('sdk初始化完成')
  }
})

// 通过sdk发送消息，发送的消息可以根据实际情况修改，只要能被JSON.stringify 和 JSON.parse 正常处理即可
const data = {
  data: {
    path: '网络请求url',
  },
  action: 'REQUEST',
}

window.cwyAppSdk.postMessage(data, (res) => {
  console.log('回调函数获取到的数据 =>', res)
})
