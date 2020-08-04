# Pili 推流 react-native Demo

### 安装依赖

```shell
yarn
```

如果要使用本地（`../`）的 SDK 实现代替从 npm 安装的 `pili-streaming-react-native` 包，则额外执行

```shell
npm run installSDK
```

即可

### 启动调试

对于不同的平台，执行对应的命令即可；命令本身会

1. 启动独立的 JavaScript Bundle server
2. 启动模拟器或找到已连接的手机
3. 尝试向模拟器或已连接的手机上安装并启动当前 APP

预期命令执行完成后模拟器或已连接的手机中已打开当前 APP，可以开始调试

#### Android

```shell
npm run android
```

#### iOS

```shell
npm run ios
```
