/* 不同平台标识 */
const PLATFORM = {
  WX_APP: 'wx-app',
  H5: 'h5',
  AMAR_RN: 'amar-rn',
}
/* sdk通信携带标识,用于判断接收哪些message */
const MESSAGE_TAG = 'amar-sdk'
/* sdk版本信息 */
const VERSION = '0.1.0'


/* 打印日志信息 */
class Logger {
  // 打印日志
  log = () => { }

  // 打印异常
  error = () => { }

  // 打印sdk版本信息
  logBlok = (msg) => {
    console.info(
      `%c [ AMAR-SDK ] %c ${msg}`,
      'background: #ff4d4f;color: #ffffff;border-top-left-radius: 3px;border-bottom-left-radius: 3px;padding: 0;',
      'background: #35495E;color: #ffffff;border-top-right-radius: 3px;border-bottom-right-radius: 3px;padding-right: 10px;'
    )
  }

  constructor(config) {
    const { debug } = config
    if (debug) {
      // 只有开启debug时才会打印信息
      this.log = (...arg) => {
        console.log(...arg)
      }
      this.error = (...arg) => {
        console.error(...arg)
      }
    }
  }
}

/**
 * 用于抹平差异，与底座进行通信
 */
class AmarSdk {
  /* 版本信息 */
  version = VERSION

  /* 环境变量 */
  env = PLATFORM.H5

  /* 是否开启debug */
  debug = false

  /* 日志打印 */
  logger

  /* 发送消息 */
  postMessage

  /* 接收消息 */
  onMessage

  /* 获取环境变量判断网页所处环境 */
  getEnv() {
    const ua = navigator.userAgent.toLowerCase()
    const isWx = ua.indexOf('micromessenger') !== -1
    if (ua === PLATFORM.AMAR_RN) {
      // app内嵌webview
      return PLATFORM.AMAR_RN
    }
    if (isWx) {
      if (window.__wxjs_environment === 'miniprogram') {
        // 微信小程序
        return PLATFORM.WX_APP
      } else {
        // 微信内置浏览器
        return PLATFORM.H5
      }
    }
    return PLATFORM.H5
  }

  /* 通信核心，用于抹平差异 */
  messageCore = {
    [PLATFORM.H5]: {
      // 发布消息
      postMessage: (data) => {
        window.parent.postMessage(data, '*')
      },
      // 处理接收消息屏蔽差异
      handleOnMessage: (e, callBack) => {
        if (e.data && typeof e.data === 'string') {
          const newData = JSON.parse(e.data)
          // 判断只有携带MESSAGE_TAG标识的消息才触发onMessage(因为webpack开发下也有message此处做一个区分)
          if (newData.type === MESSAGE_TAG) {
            this.logger.log('[Amar-onMessage]', newData)
            callBack(newData)
          }
        }
      },
      // 订阅消息
      subscript: (fn) => {
        window.addEventListener('message', fn, false)
      },
    },
    [PLATFORM.AMAR_RN]: {
      postMessage: (data) => {
        window.ReactNativeWebView.postMessage(data)
      },
      handleOnMessage: (data, callBack) => {
        if (data && typeof data === 'string') {
          const newData = JSON.parse(data)
          // 判断只有携带MESSAGE_TAG标识的消息才触发onMessage(因为webpack开发下也有message此处做一个区分)
          if (newData.type === MESSAGE_TAG) {
            this.logger.log('[Amar-onMessage]', newData)
            callBack(newData)
          }
        }
      },
      // react-native是通过注入js代码直接调用window上sdk的方法,所以不需要监听事件和取消监听
      subscript: null,
    },
  }

  /* 初始化sdk */
  init(config) {
    const { debug, ready } = config
    // 设置环境变量
    this.env = this.getEnv()

    // 是否开启debug
    if (debug) {
      this.debug = true
    }

    // 初始化日志打印
    this.logger = new Logger({ debug: this.debug })

    // 校验传入sdk参数
    if (!this.verifyConfig(config)) {
      return
    }

    // 初始化发送消息接收消息方法
    this.initPostMessage()
    this.initOnMessage(config)

    // 打印sdk版本信息
    this.logger.logBlok(`version is ${this.version}`)

    // 将实例挂载到window上，用于父级页面调用
    window.amarSdk = this

    // sdk初始化完成执行回调，若不存在ready则不执行
    if (ready && typeof ready === 'function') {
      ready()
    }
  }

  /* 初始化postMessage */
  initPostMessage() {
    let handle

    if (Object.hasOwnProperty.call(this.messageCore, this.env)) {
      handle = (data) => {
        // 打印每一条发送的消息
        const postMessage = this.messageCore[this.env].postMessage
        if (postMessage) {
          this.logger.log('[Amar-postMessage]', data)
          postMessage(JSON.stringify(data))
        }
      }
    } else {
      this.logger.error('amar-sdk未支持平台')
    }
    this.postMessage = handle
  }

  /* 初始化onMessage */
  initOnMessage(config) {
    const { onMessage } = config

    if (Object.hasOwnProperty.call(this.messageCore, this.env)) {
      const handleOnMessage = this.messageCore[this.env].handleOnMessage
      const subscript = this.messageCore[this.env].subscript

      // 挂载不同处理函数
      if (handleOnMessage) {
        this.onMessage = (data) => {
          handleOnMessage(data, onMessage)
        }
      }
      // 通过不同方式订阅
      if (subscript) {
        subscript(this.onMessage)
      }
    } else {
      this.logger.error('amar-sdk未支持平台')
    }
  }

  /* 校验参数 */
  verifyConfig(config) {
    const { onMessage } = config
    // 校验参数
    if (!onMessage || typeof onMessage !== 'function') {
      this.logger.error('必须传入一个onMessage函数')
      return false
    }

    // 校验通过
    return true
  }

  constructor(config) {
    this.init(config)
  }
}

export default AmarSdk
