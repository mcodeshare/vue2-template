### 一、sdk 使用说明

- 此 sdk 支持 h5 及 reactNative 环境下双向通信，并抹平了 h5 及 reactNative 环境差异。
- 因为 reactNative 的 webview 只支持传递字符串，所以 sdk 内 postMessage 和 onMessage 传递和接收的参数需要保证能够被 JSON.stringify 和 JSON.parse 正常处理。
- 调用 sdk 的 postMessage 方法时,方法内部会自动将传递的参数通过 JSON.stringify 转化为字符串进行发送，sdk 的 onMessage 回调被触发时会自动使用 JSON.parse 进行解析。
- sdk 通过浏览器 userAgent 判断所处环境，所以在 ReactNative 环境下需要通过 webview 自定义 userAgent="amar-rn"

#### 1、引入 sdk

```
import AmarSdk from 'sdk所在路径'
```

#### 2、初始化 sdk,实例将自动挂载到 window 上

```
new AmarSdk({
  // debug为true时将自动打印postMessage和onMessage的消息到控制台,默认为false
  debug: true,

  // 【onMessage必传】可在此函数内接受父级页面发来的消息
  onMessage: (data) => {
    console.log('onMessage', data)
  },

  // sdk初始化完成会调用此函数
  ready: () => {
    console.log('sdk初始化完成')
  }
})
```

#### 3、使用 sdk 的 postMessage 方法发送消息

```
const data = {
  type: 'amar-sdk',
  data: {
    path: 'http://xxxx.com/xxx.png',
  },
  action: 'SAVE_IMAGE_TO_PHOTOS_ALBUM'
}
window.amarSdk.postMessage(data)
```

#### 4、发送及接收消息参数约定

```
{
  // sdk只会处理携带amar-sdk标识的数据
  type: 'amar-sdk',

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
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <button id="btn">发送消息给iframe</button>
    <iframe src="http://localhost:9106/" frameborder="0" id="iframe"></iframe>
    <script>
      // 父级接收消息示例
      window.addEventListener('message', (e) => {
        console.log('[父级接收到消息]', e.data)
      })

      const iframeEl = document.querySelector('#iframe')
      const btnEl = document.querySelector('#btn')

      const data = JSON.stringify({
        type: 'amar-sdk',
        data: {
          msg: '保存图片到相册成功回调' + Math.random(),
        },
        action: 'SAVE_IMAGE_SUCCESS',
      })

      btnEl.onclick = () => {
        // 发送消息给子页面
        iframeEl.contentWindow.postMessage(data, '*')
      }
    </script>
  </body>
</html>

```

- iframe 内

```
/* 引入sdk */
import AmarSdk from 'sdk所在路径'

new AmarSdk({
  // 开启调试模式
  debug: true,

  onMessage: (data) => {
    // 可在此函数内接受父级页面发来的消息
    console.log('onMessage', data)
  },

  ready: () => {
    console.log('sdk初始化完成')
  }
})

const data = {
  type: 'amar-sdk',
  data: {
    path: 'http://xxxx.com/xxx.png',
  },
  action: 'SAVE_IMAGE_TO_PHOTOS_ALBUM'
}
// 发送消息给父页面
window.amarSdk.postMessage(data)
```

#### 2、ReactNative 使用示例

- 父页面(注意 ReactNative WebView 需要自定义 userAgent="amar-rn")

```
import React, { useEffect, useRef } from 'react'
import { View } from '@tarojs/components'
import { WebView } from 'react-native-webview'
export default function Index (props: any) {
  const webref = useRef(null)
  useEffect(() => {
    const timer = setTimeout(() => {
      // 页面加载完成三秒后向网页发送消息
      const data = JSON.stringify({
        type: 'amar-sdk',
        data: {
          msg: '保存图片到相册成功回调' + Math.random()
        },
        action: 'SAVE_IMAGE_SUCCESS'
      })

      webref.current.injectJavaScript(`
        window.amarSdk.onMessage(JSON.stringify(${data}))
      `)
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [])
  return <View className='main-page'>
    <WebView
      ref={webref}
      originWhitelist={['*']}
      userAgent="amar-rn"
      source={{ uri: 'http://10.6.240.104:9106/index.html' }}
      onMessage={(event) => {
        // 接收网页发来的消息
        console.log(event.nativeEvent.data)
      }}
    />
  </View>
}

```

- webview 内

```
/* 引入sdk */
import AmarSdk from 'sdk所在路径'

window.amarSdk = new AmarSdk({
  // 开启调试模式
  debug: true,

  onMessage: (data) => {
    // 可在此函数内接受父级页面发来的消息
    console.log('onMessage', data)
  },

  ready: () => {
    console.log('sdk初始化完成')
  }
})

const data = {
  type: 'amar-sdk',
  data: {
    path: 'http://xxxx.com/xxx.png',
  },
  action: 'SAVE_IMAGE_TO_PHOTOS_ALBUM'
}
// 发送消息给父页面
window.amarSdk.postMessage(data)
```
