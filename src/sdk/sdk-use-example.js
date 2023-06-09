/* 引入sdk */
import CwyAppSdk from './cwy-app-sdk'
/* 引入开发依赖api,非真机调试会调用此api，打包会自动排除此部分代码 */
import './developApi'

/* 初始化sdk */
new CwyAppSdk({
  // 是否开启调试，开启调试会在控制台打印日志，错误日志不受影响始终打印
  debug: true,
  // sdk挂载完成会触发
  ready: () => {
    console.log('sdk初始化完成')
  }
})

/* 通过sdk发送消息，发送的消息可以根据实际情况修改，只要能被JSON.stringify 和 JSON.parse 正常处理即可 */
window.cwyAppSdk.postMessage({ data: "", action: 'USER_INFO', }, {
  success: (res) => {
    console.log('api调用成功信息 =>', res)
  },
  fail: (res) => {
    console.log('api调用失败信息 =>', res)
  },
})