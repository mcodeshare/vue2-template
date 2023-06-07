/* *****************************************配置数据*********************************************** */
const SDK_CONFIG = {
  // sdk挂载到window上的名称
  NAME: 'cwyAppSdk',
  // sdk版本信息
  VERSION: '0.1.0',
  // sdk用去区分onMessage回调函数的key
  CALL_KEY: 'cwyCallId',
  // 回调函数唯一标识前缀，格式为 CALL_ID_PREFIX + uuid
  CALL_ID_PREFIX: 'cwy-app-sdk-',
  // 用于区分sdk运行环境
  ENV: {
    WX_APP: 'wx-app',
    // 所有未识别的环境都会被识别为H5
    H5: 'h5',
    // 底座自定义的userAgent需要与此相同
    CWY_RN: 'cwy-app-webview',
  },
  // 开发环境虚拟api的action
  MOCK_API_ACTION: {
    REQUEST: 'REQUEST'
  }
}

/* *****************************************公共方法*********************************************** */
/* 生成uuid */
function uuid(len, radix) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  radix = radix || chars.length
  if (len) {
    for (let i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
  } else {
    let r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = 'y'
    for (let n = 0; n < 36; n++) {
      if (!uuid[n]) {
        r = 0 | (Math.random() * 16)
        uuid[n] = chars[n === 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}

/* 判断对象是否存在某属性 */
function has(obj, key) {
  return Object.hasOwnProperty.call(obj, key)
}

/* 获取环境变量判断网页所处环境 */
function getEnv() {
  const ua = navigator.userAgent.toLowerCase()
  const isWx = ua.indexOf('micromessenger') !== -1
  if (ua === SDK_CONFIG.ENV.CWY_RN) {
    // app内嵌webview
    return SDK_CONFIG.ENV.CWY_RN
  }
  if (isWx) {
    if (window.__wxjs_environment === 'miniprogram') {
      // 微信小程序
      return SDK_CONFIG.ENV.WX_APP
    } else {
      // 微信内置浏览器
      return SDK_CONFIG.ENV.H5
    }
  }
  return SDK_CONFIG.ENV.H5
}

const _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
/* 解码用户信息方法 */
function decode(input) {
  if (typeof (input) === 'undefined') {
    return ''
  }
  var output = ''
  var chr1, chr2, chr3
  var enc1, enc2, enc3, enc4
  var i = 0
  input = input.replace(/[^A-Za-z0-9+/=]/g, '')
  while (i < input.length) {
    enc1 = _keyStr.indexOf(input.charAt(i++))
    enc2 = _keyStr.indexOf(input.charAt(i++))
    enc3 = _keyStr.indexOf(input.charAt(i++))
    enc4 = _keyStr.indexOf(input.charAt(i++))
    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4
    output = output + String.fromCharCode(chr1)
    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2)
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3)
    }
  }
  output = utf8Decode(output)
  return output
}
function utf8Decode(utftext) {
  var string = ''
  var i = 0
  var c = 0
  var c3 = 0
  var c2 = 0
  // var c = c1 = c2 = 0
  while (i < utftext.length) {
    c = utftext.charCodeAt(i)
    if (c < 128) {
      string += String.fromCharCode(c)
      i++
    } else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1)
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
      i += 2
    } else {
      c2 = utftext.charCodeAt(i + 1)
      c3 = utftext.charCodeAt(i + 2)
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
      i += 3
    }
  }
  return string
}

/* 设置开发环境数据 */
function setDevelopData(developData) {
  const { userLoginInfo } = developData
  try {
    localStorage.setItem('commonData', JSON.stringify(userLoginInfo))
    document.cookie = `tokenid=${decode(userLoginInfo.token)}`
  } catch (error) {
    console.error('设置开发数据失败', error)
    console.log('异常数据是', developData)
  }
}

/* ***************************************开发环境虚拟api（只有H5开发环境会判断走此方法，其他都走真实方法）********************************************* */
/* 构建本地虚拟api返回的数据 */
function buildCallData(params, data) {
  return {
    [SDK_CONFIG.CALL_KEY]: params[SDK_CONFIG.CALL_KEY],
    action: params.action,
    data
  }
}

function mockRequest(data) {
  const { params, sendMsg } = data
  // TODO：请求待封装
  const sendData = buildCallData(params, {})
  sendMsg(sendData)
}

/* *****************************************sdk具体封装*********************************************** */
/* 打印日志信息 */
class Logger {
  // 打印日志
  log = () => { }
  // 打印异常
  error = () => { }
  // 打印sdk版本信息
  logBlok = (msg, detail = '') => {
    console.info(
      `%c [ CWY-APP-SDK ] %c ${msg}`,
      'background: #ff4d4f;color: #ffffff;border-top-left-radius: 3px;border-bottom-left-radius: 3px;padding: 0;',
      'background: #35495E;color: #ffffff;border-top-right-radius: 3px;border-bottom-right-radius: 3px;padding-right: 10px;', detail
    )
  }
  constructor(config) {
    const { debug } = config
    // 错误信息一直打印
    this.error = (...arg) => {
      console.error(...arg)
    }
    if (debug) {
      // 只有开启debug时才会打印log信息
      this.log = (...arg) => {
        console.log(...arg)
      }
    }
  }
}

/* H5开发环境本地模拟api */
class MockApi {
  /* 环境变量 */
  env = SDK_CONFIG.ENV.H5
  /* 日志打印 */
  logger
  /* 用于存储本地虚拟的api */
  apiMap = {}
  /* 本地虚拟api发回数据 */
  sendMsg(data) {
    window[SDK_CONFIG.NAME].onMessage({ data: JSON.stringify(data) })
  }
  /**
  * 判断是否执行虚拟api，如果是H5开发环境下存在相关api则调用
  * @returns true 终止执行直接走虚拟的api false继续执行不走虚拟的api
  */
  runMock(data) {
    const { action } = data
    if (this.env === SDK_CONFIG.ENV.H5) {
      if (has(this.apiMap, action)) {
        // 若存在本地虚拟api则调用
        this.apiMap[action]({ params: data, sendMsg: this.sendMsg })
        // 终止调用
        return true
      } else {
        this.logger.logBlok('请通过扫码调试此api', data)
        window[SDK_CONFIG.NAME].removeCallFn(data[SDK_CONFIG.CALL_KEY])
        return true
      }
    }
    return false
  }
  constructor(config) {
    const { env, debug } = config
    // 设置环境变量
    this.env = env
    // 初始化日志打印
    this.logger = new Logger({ debug: debug || false })
    // 挂载方法到apiMap
    this.apiMap[SDK_CONFIG.MOCK_API_ACTION.REQUEST] = mockRequest
  }
}
/* 对外提供的sdk */
class CwyAppSdk {
  /* 版本信息 */
  version = SDK_CONFIG.VERSION
  /* 环境变量 */
  env = SDK_CONFIG.ENV.H5
  /* 日志打印 */
  logger
  /* 发送消息 */
  postMessage
  /* 接收消息 */
  onMessage
  /* 回调函数存储 */
  callMap = {}
  /* 开环境虚拟的api */
  mockApi
  /* 从callMap移除回调函数 */
  removeCallFn(key) {
    Reflect.deleteProperty(this.callMap, key)
  }
  /* 回调函数调用 */
  handleCall(data) {
    if (data && typeof data === 'string') {
      try {
        const jsonData = JSON.parse(data)
        // 只有callKey存在时sdk才应处理数据（为了屏蔽开发环境下webpack postmessage影响）
        if (jsonData[SDK_CONFIG.CALL_KEY] && has(this.callMap, jsonData[SDK_CONFIG.CALL_KEY])) {
          this.logger.log(`[${SDK_CONFIG.NAME}-ONMESSAGE]`, jsonData)
          this.callMap[jsonData[SDK_CONFIG.CALL_KEY]](jsonData)
          // 移除已经执行回调函数
          this.removeCallFn(jsonData[SDK_CONFIG.CALL_KEY])
        }
      } catch (error) {
        this.logger.error(`${SDK_CONFIG.NAME}回调参数异常`, error)
        this.logger.log('异常数据 => ', data)
      }
    }
  }
  /* 获取用户信息 */
  getUserInfo() {
    const commonData = localStorage.getItem('commonData')
    try {
      const commonDataLocal = JSON.parse(commonData)
      let decodeFn = decode
      if (this.env === SDK_CONFIG.ENV.CWY_RN) {
        // 如果是rn环境取到的是明文不需要解码
        decodeFn = v => v
      }
      return {
        svAgencyCode: decodeFn(commonDataLocal.svAgencyCode),
        svFiscalPeriod: decodeFn(commonDataLocal.svFiscalPeriod),
        svSetYear: decodeFn(commonDataLocal.svSetYear),
        svRgCode: decodeFn(commonDataLocal.svRgCode),
        svTransDate: decodeFn(commonDataLocal.svTransDate),
        svUserId: decodeFn(commonDataLocal.svUserId),
        svRoleName: decodeFn(commonDataLocal.svRoleName),
        svSysDate: decodeFn(commonDataLocal.svSysDate),
        svRoleCode: decodeFn(commonDataLocal.svRoleCode),
        svAcctCode: decodeFn(commonDataLocal.svAcctCode),
        svAcctName: decodeFn(commonDataLocal.svAcctName),
        svUserCode: decodeFn(commonDataLocal.svUserCode),
        svMenuId: decodeFn(commonDataLocal.svMenuId),
        svUserName: decodeFn(commonDataLocal.svUserName),
        svAgencyName: decodeFn(commonDataLocal.svAgencyName),
        svRgName: decodeFn(commonDataLocal.svRgName),
        svRoleId: decodeFn(commonDataLocal.svRoleId),
        token: decodeFn(commonDataLocal.token)
      }
    } catch (error) {
      console.error('获取userLoginInfo失败', commonData)
    }
  }
  /* 通信核心，用于抹平差异 */
  core = {
    [SDK_CONFIG.ENV.H5]: {
      // 发布消息
      postMessage: (data) => {
        window.parent.postMessage(data, '*')
      },
      // 处理接收消息屏蔽差异
      onMessage: (e) => {
        this.handleCall(e.data)
      },
      // 订阅消息
      subscript: (fn) => {
        window.addEventListener('message', fn, false)
      },
    },
    [SDK_CONFIG.ENV.CWY_RN]: {
      postMessage: (data) => {
        window.ReactNativeWebView.postMessage(data)
      },
      onMessage: (data) => {
        this.handleCall(data)
      },
      // react-native是通过注入js代码直接调用window上sdk的方法,所以不需要监听事件和取消监听
      subscript: null,
    },
  }
  /* 初始化通信JSBridge */
  initJsBridge() {
    const env = this.env
    if (has(this.core, env)) {
      const postMessage = this.core[env].postMessage
      const onMessage = this.core[env].onMessage
      const subscript = this.core[env].subscript
      const newPostMessage = (params, func) => {
        // 生成回调函数唯一标识并注册
        params[SDK_CONFIG.CALL_KEY] = SDK_CONFIG.CALL_ID_PREFIX + uuid()
        this.callMap[params[SDK_CONFIG.CALL_KEY]] = func
        this.logger.log(`[${SDK_CONFIG.NAME}-POSTMESSAGE]`, params)
        // 若是H5开发环境则通过本地虚拟的api进行调试
        if (process.env.NODE_ENV === 'development' && this.env === SDK_CONFIG.ENV.H5) {
          this.mockApi.runMock(params)
          return
        }
        // 若是RN环境直接调用真实api
        try {
          const jsonStr = JSON.stringify(params)
          postMessage(jsonStr)
        } catch (error) {
          this.logger.error(`${SDK_CONFIG.NAME} postMessage参数异常`, error)
          this.logger.log('异常数据 => ', params)
        }
      }
      // 初始化postMessage
      this.postMessage = newPostMessage
      // 初始化onmessage
      if (onMessage) {
        this.onMessage = onMessage
      }
      // 通过不同方式订阅onmessage
      if (subscript) {
        subscript(this.onMessage)
      }
    } else {
      this.logger.error(`${SDK_CONFIG.NAME}初始化失败，原因判断所处环境异常，未支持的环境。`)
    }
  }
  constructor(config) {
    const { debug, ready, developData } = config
    // 设置环境变量
    this.env = getEnv()
    // 初始化日志打印
    this.logger = new Logger({ debug: debug || false })
    // 开发环境下初始化虚拟api
    if (process.env.NODE_ENV === 'development') {
      this.mockApi = new MockApi({ env: this.env, debug: debug || false })

      // 设置开发环境数据缓存等,RN环境会注入真实数据不需要设置
      if (this.env !== SDK_CONFIG.ENV.CWY_RN) {
        setDevelopData(developData)
      }
    }
    // 初始化通信JSBridge
    this.initJsBridge()

    // 将实例挂载到window上，用于父级页面调用
    window[SDK_CONFIG.NAME] = this
    // 打印sdk版本信息
    this.logger.logBlok(`version is ${this.version}`)
    // sdk初始化完成执行回调，若不存在ready则不执行
    if (ready && typeof ready === 'function') {
      ready()
    }
  }
}

export default CwyAppSdk