### 一、sdk 使用说明

- 此 sdk 支持 h5 及 reactNative 环境下双向通信，并抹平了 h5 及 reactNative 环境差异。
- 因为 reactNative 的 webview 只支持传递字符串，所以 sdk 内 postMessage 和 onMessage 传递和接收的参数需要保证能够被 JSON.stringify 和 JSON.parse 正常处理。
- 调用 sdk 的 postMessage 方法时,方法内部会自动将传递的参数通过 JSON.stringify 转化为字符串进行发送，sdk 的 onMessage 回调被触发时会自动使用 JSON.parse 进行解析。
- sdk 通过浏览器 userAgent 判断所处环境，所以在 ReactNative 环境下需要通过 webview 自定义 userAgent='cwy-app-webview'

#### 1、引入 sdk

```
import CwyAppSdk from 'sdk所在路径'
```

#### 2、初始化 sdk,实例将自动挂载到 window 上

```
new CwyAppSdk({
  // 是否开启调试，开启调试会在控制台打印日志
  debug: true,

  // sdk挂载完成会触发
  ready: () => {
    console.log('sdk初始化完成')
  }
})
```

#### 3、使用 sdk 的 postMessage 方法发送消息

```
// 通过sdk发送消息，发送的消息可以根据实际情况修改，只要能被JSON.stringify 和 JSON.parse 正常处理即可
const data = {
  data: {
    url: '',
  },
  action: 'REQUEST',
}

window.cwyAppSdk.postMessage(data, (res) => {
  console.log('回调函数获取到的数据 =>', res)
})
```

#### 4、发送及接收消息参数约定

```
{
  // 这个参数是通信sdk自动添加的，用于确定接收消息时调用哪个函数,底座传参时必须将此参数带回
  cwyCallId:'cwy-app-sdk-461F9EA6-790E-y8B8-B25C-7976C4DCB89B',

  // 用于标识调用什么api或回调函数
  action: 'SAVE_IMAGE_TO_PHOTOS_ALBUM'

  // data可以是任何可被JSON.stringify 和 JSON.parse正常处理的数据,具体数据根据调用不同api及回调的约定编写
  data: {
    path: 'http://xxxx.com/xxx.png',
  },
}
```

### 二、使用示例

#### 1、H5 使用示例

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

- iframe 内

```
/* 引入sdk */
import CwyAppSdk from './cwyAppSdk'

new CwyAppSdk({
  // 是否开启调试，开启调试会在控制台打印日志
  debug: true,

  // sdk挂载完成会触发
  ready: () => {
    console.log('sdk初始化完成')
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

```

#### 2、ReactNative 使用示例

- 父页面(注意 ReactNative WebView 需要自定义 userAgent='cwy-app-webview')

```
import React, { useEffect, useRef } from 'react'
import { View } from '@tarojs/components'
import { WebView } from 'react-native-webview'
export default function Index (props: any) {
  const webRef = useRef(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      // 页面加载完成三秒后向网页发送消息
      const data = JSON.stringify({
        cwyCallId: '从onMessage接收数据event.nativeEvent.data.cwyCallId取',
        data: '需要传递的数据',
        action: '约定的action'
      })

      webRef.current.injectJavaScript(`
        window.amarSdk.onMessage(JSON.stringify(${data}))
      `)
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [])
  return <View className='main-page'>
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      userAgent='cwy-app-webview'
      source={{ uri: 'http://10.6.240.104:9106/index.html' }}
      onMessage={(event) => {
        // 接收网页发来的消息
        console.log(event.nativeEvent.data)
      }}
    />
  </View>
}

```

- webview 内 sdk 使用方式同上文 iframe 内使用方式
