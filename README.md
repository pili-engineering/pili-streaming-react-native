# Pili 推流 SDK for react-native

### 安装

##### 1. 通过 npm 安装依赖包

```shell
npm i --save pili-react-native
```

##### 2. 添加 android 支持

##### 3. 添加 ios 支持   

环境配置：[Cocoapod 安装教程](https://cocoapods.org)

######1. 打开 ios 文件夹，在 Podfile 文件中添加   

```Object-C
pod 'pili-react-native', :path => '../node_modules/pili-streaming-react-native/ios/pili-react-native'
```   
######2. 终端运行 

```Object-C
cd ../ios
pod install
``` 

######3. 打开 YourPorjectName.xcworkspace (这里请注意是打开 .xcworkspace!请确认)   

######4.运行 your project (Cmd+R)   

###### 注意: 如果是 iOS 10 以上需要在 iOS 项目中的 info.plist 文件里额外添加如下权限:
```
    <key>NSCameraUsageDescription</key>    
    <string>cameraDesciption</string>

    <key>NSContactsUsageDescription</key>    
    <string>contactsDesciption</string>

    <key>NSMicrophoneUsageDescription</key>    
    <string>microphoneDesciption</string>
```    

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
