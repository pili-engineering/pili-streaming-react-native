# Pili SDK for react-native

### 安装

##### 1. 通过 npm 安装依赖包

```shell
npm i --save pili-react-native
```

##### 2. 添加 android 支持

##### 3. 添加 ios 支持

### 使用

```jsx
import { consts, Streaming } from './pili-react-native'

function Foo() {
  return (
    <Streaming
      rtmpURL="..."
      profile={{
        video: {
          fps: 30,
          bps: 800 * 1024,
          maxFrameInterval: 60
        },
        audio: {
          rate: 44100,
          bitrate: 96 * 1024,
        },
        encodingSize: consts.videoEncoding480
      }}
    />
  )
}
```
