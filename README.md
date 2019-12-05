# Pili 推流 SDK for react-native

### 概述
pili-streaming-react-native 底层基于 [PLDroidMediaStreaming](https://github.com/pili-engineering/PLDroidMediaStreaming) (Android)  和 [PLMediaStreamingKit](https://github.com/pili-engineering/PLMediaStreamingKit)（iOS) ，在 React Native 上实现了基本的直播功能的 SDK。后续还会陆续会增加录屏推流，图片推流等高级用法。


### 安装

##### 1. 通过 npm 安装依赖包

```shell
npm i --save pili-streaming-react-native
```

##### 2. 添加 android 支持

1. 在 android 项目根目录下的 `settings.gradle` 中添加如下代码：

    ```java
    include ':pili-streaming-react-native'
    project(':pili-streaming-react-native').projectDir = new File(settingsDir, '../node_modules/pili-streaming-react-native/android/pili-react-native')
    ```

2. 在 android 项目的 app 目录下 `build.gradle` 文件中添加如下依赖：

    ```java
    implementation "com.facebook.react:react-native:+" // From node_modules.
    implementation project(':pili-streaming-react-native')
    ```

3. 在 `ReactApplication` 的子类中定义 `ReactNativeHost` 对象，并重写其 `getPackages` 方法，将 `PiliPackage` 对象添加进去，示例代码如下：

    ```java
    private final ReactNativeHost mReactNativeHost =
          new ReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
              return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
              @SuppressWarnings("UnnecessaryLocalVariable")
              List<ReactPackage> packages = new PackageList(this).getPackages();
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // packages.add(new MyReactNativePackage());
              packages.add(new PiliPackage());
              return packages;
            }

            @Override
            protected String getJSMainModuleName() {
              return "index";
            }
          };
    ```

##### 3. 添加 ios 支持

环境配置：[Cocoapod 安装教程](https://cocoapods.org)

1. 打开 ios 文件夹，在 Podfile 文件中添加

    ```Object-C
    pod 'pili-react-native', :path => '../node_modules/pili-streaming-react-native/ios/pili-react-native'
    ```

2. 终端运行

    ```shell
    cd ../ios
    pod install
    ``` 

3. 打开 YourPorjectName.xcworkspace (这里请注意是打开 .xcworkspace!请确认)

4. 运行 project (Cmd+R)

**注意: 如果是 iOS 10 以上需要在 iOS 项目中的 info.plist 文件里额外添加如下权限:**

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
