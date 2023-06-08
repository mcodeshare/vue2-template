### 一、sdk 使用说明

- 此 sdk 支持 h5 及 reactNative 环境下双向通信，并抹平了 h5 及 reactNative 环境差异。
- 因为 reactNative 的 webview 只支持传递字符串，所以 sdk 内 postMessage 和 onMessage 传递和接收的参数需要保证能够被 JSON.stringify 和 JSON.parse 正常处理。
- 调用 sdk 的 postMessage 方法时,方法内部会自动将传递的参数通过 JSON.stringify 转化为字符串进行发送，sdk 的 onMessage 回调被触发时会自动使用 JSON.parse 进行解析。
- sdk 通过浏览器 userAgent 判断所处环境，所以在 ReactNative 环境下需要通过 webview 自定义 userAgent='cwy-app-webview'
- sdk 在此项目中使用可参照 sdk-use-example.js

#### 1、引入 sdk

```
import CwyAppSdk from 'sdk所在路径'

// 如需h5下直接调试需引入developApi
import './developApi'
```

#### 2、初始化 sdk,实例将自动挂载到 window 上

```
new CwyAppSdk({
  // 是否开启调试，开启调试会在控制台打印日志
  debug: true,

  // sdk挂载完成会触发
  ready: () => {
    console.log('sdk初始化完成')
  },
})
```

#### 3、使用 sdk 的 postMessage 方法发送消息

```
// 通过sdk发送消息，发送的消息可以根据实际情况修改，只要能被JSON.stringify 和 JSON.parse 正常处理即可
const data = {
  data: "",
  action: 'USER_INFO',
}

window.cwyAppSdk.postMessage(data, {
  success: (res) => {
    console.log('api调用成功信息 =>', res)
  },
  fail: (res) => {
    console.log('api调用失败信息 =>', res)
  },
})

```

#### 4、发送及接收消息参数约定

- sdk 发送消息参数

```
{
  // 【自动生成不需要传】这个参数是通信sdk自动添加的，用于确定接收消息时调用哪个函数
  cwyCallId:'cwy-app-sdk-461F9EA6-790E-y8B8-B25C-7976C4DCB89B',

  // 【必传】调用api标识
  action: 'USER_INFO'

  // 【必传】data可以是任何可被JSON.stringify 和 JSON.parse正常处理的数据,具体数据根据调用不同api约定编写
  data: "",
}
```

- 底座发回的消息

```
{
  // 【必传】从接收到的数据复制
  cwyCallId:'cwy-app-sdk-461F9EA6-790E-y8B8-B25C-7976C4DCB89B',

  // 【必传】从接收到的数据复制，或文档另有约定
  action: 'USER_INFO'

  // 【必传】data可以是任何可被JSON.stringify 和 JSON.parse正常处理的数据,具体数据根据回调的约定编写
  data: "",
}
```

### 二、使用示例

#### 1、H5 父页面发送消息接收消息示例

- 父页面

```
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='UTF-8' />
    <meta http-equiv='X-UA-Compatible' content='IE=edge' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />
    <title>h5测试通信</title>
  </head>
  <body>
    <button id='btn'>发送消息给iframe</button>
    <iframe src='http://localhost:9106/' frameborder='0' id='iframe'></iframe>
    <script>
      // 父级接收消息示例
      let message = null
      window.addEventListener('message', (e) => {
        message = JSON.parse(e.data)
        console.log('[父级接收到消息]', e.data)
      })

      // 父级发送消息示例
      const iframeEl = document.querySelector('#iframe')
      const btnEl = document.querySelector('#btn')
      btnEl.onclick = () => {
        const data = JSON.stringify({
          cwyCallId: message.cwyCallId,
          data: {
            msg: '回调携带的信息',
          },
          action: 'SAVE',
        })

        iframeEl.contentWindow.postMessage(data, '*')
      }
    </script>
  </body>
</html>


```

#### 2、ReactNative 示例

- 父页面(注意 ReactNative WebView 需要自定义 userAgent='cwy-app-webview')

```
import React, { useRef } from 'react'
import { View } from '@tarojs/components'
import { WebView } from 'react-native-webview'
import './index.scss'
export default function Index (props: any) {
  const webRef = useRef(null)

  // 注入userLoginInfo
  const userLoginInfo = "{ svFiscalPeriod: 'Ng==', svMenuId: '', svRgCode: 'ODc=', svRgName: '5YWoICDlm70=', svRoleCode: 'NjY2MDAx', svRoleId: 'OTA5MQ==', svRoleName: '6LSi5Yqh57O757uf566h55CG5ZGY', svSetYear: 'MjAyMw==', svTransDate: 'MjAyMy0wNi0wNw==', svUserCode: 'Y20wMQ==', svUserId: 'OTUxNg==', svUserName: '', svAgencyName: '6YeH6LSt5Y2V5L2N', svDistCode: '110101', svDistName: '东城区', svIsPower: '0', svSnum: '0', svAgencyCode: 'MTAw', svAcctCode: '', svAcctName: '', svSysDate: 'MjAyMy0wNi0wNyAxMzo0Nzo0MA==', token: 'NzNmZjUyMTgwNDVkNjViM2UzNDdhYzVkMmE3NDUwM2U=' }"
  const injectedJavaScript = `
  localStorage.setItem('commonData', JSON.stringify(${userLoginInfo}))
  `

  function mockApi (params) {
    const { cwyCallId, action } = params
    // 三秒后api返回消息
    setTimeout(() => {
      const data = JSON.stringify({
        cwyCallId,
        action,
        data: '需要返回的数据'
      })
      webRef.current.injectJavaScript(`
        window.cwyAppSdk.onMessage(JSON.stringify(${data}))
      `)
    }, 3000)
  }

  return <View className='main-page'>
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      userAgent='cwy-app-webview'
      source={{ uri: 'http://10.6.246.79:9106/index.html' }}
      injectedJavaScript={injectedJavaScript}
      onMessage={(event) => {
        console.log('网页发来的消息', event.nativeEvent.data)
        // 调用api
        mockApi(JSON.parse(event.nativeEvent.data))
      }}
    />
  </View>
}

```

- iframe 或 webview 内 sdk 使用示例

```
/* 引入sdk */
import CwyAppSdk from './cwyAppSdk'
/* 引入开发依赖api,非真机调试会调用此api，打包会自动排除此部分代码 */
import './developApi'

new CwyAppSdk({
  // 是否开启调试，开启调试会在控制台打印日志，错误日志不受影响始终打印
  debug: true,

  // sdk挂载完成会触发
  ready: () => {
    console.log('sdk初始化完成')
  },

})

/* 通过sdk获取用户信息 */
console.log('通过sdk获取userLoginInfo', window.cwyAppSdk.getUserInfo())

// 通过sdk发送消息，发送的消息可以根据实际情况修改，只要能被JSON.stringify 和 JSON.parse 正常处理即可
const data = {
  data: "",
  action: 'USER_INFO',
}

window.cwyAppSdk.postMessage(data, {
  success: (res) => {
    console.log('api调用成功信息 =>', res)
  },
  fail: (res) => {
    console.log('api调用失败信息 =>', res)
  },
})

```
