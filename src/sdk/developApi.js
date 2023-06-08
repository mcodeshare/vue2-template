// 开发环境用户登录信息
import userLoginInfo from './userLoginInfo.json'

// h5开发环境模拟api配置
const DEV_API_CONFIG = {
  // 底座webView自定义的userAgent
  CWY_RN_UA: 'cwy-app-webview',
  // api回调函数成功状态码
  CALL_SUCCESS: 'success',
  // api回调函数失败状态码
  CALL_FAIL: 'fail'
}

/* 获取环境变量判断网页所处环境 */
function isCWYApp() {
  const ua = navigator.userAgent.toLowerCase()
  if (ua === DEV_API_CONFIG.CWY_RN_UA) {
    // app内嵌webview
    return true
  }
  // 未知环境按h5处理
  return false
}

if (process.env.NODE_ENV === 'development' && !isCWYApp()) {
  /* 开发环境h5模拟真实环境Api */
  class H5DevelopApi {
    constructor() {
      window.addEventListener('message', this.run.bind(this), false)
    }
    // 用于存储api
    apiMap = {
      'REQUEST': ({ params, send }) => {
        console.log(params.action, '=>', params)
        send(77777)
      },
      'USER_INFO': ({ send }) => {
        send(userLoginInfo, DEV_API_CONFIG.CALL_SUCCESS)
      }
    }
    // 发回消息
    sendMsg(data) {
      window.cwyAppSdk.onMessage({ data: JSON.stringify(data) })
    }
    // 组织发送的消息
    buildMsg(flag, params, data) {
      return {
        sdkId: params.sdkId,
        cwyCallId: params.cwyCallId,
        action: params.action,
        data: {
          flag, //回调成功失败状态码
          data
        }
      }
    }
    // 根据报文调用api
    run(e) {
      if (e.data && typeof e.data === 'string') {
        try {
          const jsonData = JSON.parse(e.data)
          const { action } = jsonData
          if (Object.hasOwnProperty.call(this.apiMap, action)) {
            // 根据action调用不同api
            this.apiMap[action]({
              params: jsonData,
              send: (v, flag) => {
                const sendData = this.buildMsg(flag, jsonData, v)
                this.sendMsg(sendData)
              }
            })
          } else {
            console.log('请在真机调试此api')
          }
        } catch (error) {
          console.error('调用参数异常', error)
          console.log('异常数据 => ', e.data)
        }
      }
    }
  }
  new H5DevelopApi()
}