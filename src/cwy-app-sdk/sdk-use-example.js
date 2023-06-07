/* 引入sdk */
import CwyAppSdk from '.'
import userLoginInfo from './userLoginInfo'
/* 初始化sdk */
new CwyAppSdk({
  // 是否开启调试，开启调试会在控制台打印日志，错误日志不受影响始终打印
  debug: true,
  // 设置开发环境数据
  developData: {
    userLoginInfo: userLoginInfo
  },
  // sdk挂载完成会触发
  ready: () => {
    console.log('sdk初始化完成')
  }
})

/* 通过sdk获取用户信息 */
console.log('通过sdk获取userLoginInfo', window.cwyAppSdk.getUserInfo())

/* 通过sdk发送消息，发送的消息可以根据实际情况修改，只要能被JSON.stringify 和 JSON.parse 正常处理即可 */
const mockAPiParams = {
  data: {
    path: '网络请求url',
  },
  action: 'REQUEST',
}

window.cwyAppSdk.postMessage(mockAPiParams, (res) => {
  console.log('api调用返回信息 =>', res)
})
