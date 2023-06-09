/* 引入sdk */
import CwyAppSdk from './cwyAppSdk'

if (process.env.NODE_ENV === 'development') {
  /* 引入开发依赖api,非真机调试会调用此api，打包会自动排除此部分代码 */
  require('./developApi')
  /* 远程加载js */
  const loadScript = (url, callback) => {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState == "complete" || script.readyState == "loaded") {
          callback()
        }
      }
    } else {
      script.onload = function () {
        callback()
      }
    }
    script.src = url
    document.head.appendChild(script)
  }
  /* 远程加载调试控制台 */
  loadScript('https://cdn.bootcss.com/eruda/1.4.3/eruda.min.js', () => {
    // eslint-disable-next-line no-undef
    eruda.init()
  })
}


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
window.cwyAppSdk.postMessage({
  data: {},
  action: 'USER_INFO',
  success: (res) => {
    console.log('成功', res)
  },
  fail: (res) => {
    console.log('失败', res)
  },
  complete: (res => {
    console.log('成功、失败都返回', res)
  })
})