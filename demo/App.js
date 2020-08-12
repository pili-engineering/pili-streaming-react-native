/**
 * Sample for Pili react-native SDK
 */

import merge from 'merge'
import React, { Component } from 'react'
import { SafeAreaView, Text, StatusBar, ScrollView, View, Button, Platform, PermissionsAndroid, TextInput } from 'react-native'
import { consts, Streaming } from 'pili-streaming-react-native'
import { FileInput, AvCodecTypeInput, CameraResolutionInput, CameraFocusModeInput, CameraVideoOrientationInput, MicrophoneSampleRateInput, MicrophoneChannelInput, SwitchInput, VideoEncodeOrientationInput, VideoH264ProfileInput, BitrateAdjustModeInput, EncoderRCModeInput, CameraInput, NumberInput } from './components/Input'

const isAndroid = Platform.OS === 'android'

export default class App extends Component {

  state = {
    androidPermissionGranted: false,
    state: null,
    streamInfo: null,
    audioMixProgress: null,
    streamingConfigInput: '',
    streamingConfigError: null,
    streamingConfig: {
      rtmpURL: 'rtmp://pili-publish.qnsdk.com/sdk-live/111',
      camera: 'back',
      muted: false,
      zoom: 0,
      focus: false,
      started: true,

      faceBeautyEnable: false,
      faceBeautySetting: {
        beautyLevel: 1,
        whiten: 1,
        redden: 0.8,
      },
      watermarkSetting: {
        src: null, // or `''`？
        alpha: 122,
        position: {
          x: 0,
          y: 0
        },
        size: {
          width: 50,
          height: 20
        },
      },
      pictureStreamingFile: null,
      pictureStreamingEnable: false,
      torchEnable: false,
      previewMirrorEnable: false,
      encodingMirrorEnable: false,
      audioMixFile: {
        filePath: null, // or `''`？
        loop: true,
      },
      playMixAudio: false,
      audioMixVolume: {
        micVolume: 0.5,
        musicVolume: 0.5,
      },
      playbackEnable: false,

      profile: {
        videoStreamingSetting: {
          fps: 30,
          bps: 1000 * 1024,
          maxFrameInterval: 60,
          encodeOrientation: consts.videoEncodeOrientations.portrait,
          h264Profile: (
            isAndroid
            ? consts.videoH264Profiles_android.baseline
            : consts.videoH264Profiles_iOS.baseline31
          ),
          customVideoEncodeSize: {
            width: 1024,
            height: 720
          }
        },
        audioStreamingSetting: {
          rate: 44100,
          bitrate: 96 * 1024,
        },
        encodingSize: consts.videoEncodings.e480,
        avCodecType: (
          isAndroid
          ? consts.avCodecTypes_android.SW_VIDEO_WITH_SW_AUDIO_CODEC
          : consts.avCodecTypes_iOS.PLH264EncoderType_AVFoundation
        ),
        cameraStreamingSetting: {
          resolution: (
            isAndroid
            ? consts.cameraResolutions_android.MEDIUM_RATIO_16_9
            : consts.cameraResolutions_iOS.AVCaptureSessionPresetMedium
          ),
          focusMode: consts.cameraFocusModes.continuousVideo,
          videoOrientation: consts.cameraVideoOrientations.portrait
        },
        microphoneSteamingSetting: {
          sampleRate: consts.microphoneSampleRates.r44100,
          channel: consts.microphoneChannels.mono,
          isAecEnable: false
        },
        quicEnable: false,
        bitrateAdjustMode: consts.bitrateAdjustModes.auto,
        adaptiveBitrateRange: {
          minBitrate: 1024,
          maxBitrate: 1024*1024,
        },
        encoderRCMode: consts.encoderRCModes.bitratePriority,
        streamInfoUpdateInterval: 5,
      },
    },
  }

  handleStateChange = state => this.setState({ state })
  handleStreamInfoChange = streamInfo => this.setState({ streamInfo })
  handleAudioMixProgress = audioMixProgress => this.setState({ audioMixProgress })

  handleStreamingConfigInputChange = text => this.setState({ streamingConfigInput: text })
  handleStreamingConfigInputSubmit = () => {
    this.setState({ streamingConfigError: null })
    try {
      const toMerge = JSON.parse(this.state.streamingConfigInput)
      const streamingConfig = merge.recursive(true, this.state.streamingConfig, toMerge)
      this.setState({ streamingConfig })
    } catch (e) {
      this.setState({ streamingConfigError: e && e.message })
    }
  }

  useStateOfPath = keyPath => {
    const toMerge = {}
    const keys = keyPath.split('.')
    const lastKey = keys[keys.length - 1]
    const lastObj = keys.slice(0, -1).reduce((obj, key) => {
      return obj[key] = {}
    }, toMerge)

    const value = keys.reduce((obj, key) => obj[key], this.state)
    const onChange = value => {
      lastObj[lastKey] = value
      const newState = merge.recursive(true, this.state, toMerge)
      this.setState(newState)
    }
    return [value, onChange]
  }

  bindStateOfPath = keyPath => {
    const [value, onChange] = this.useStateOfPath(keyPath)
    return { value, onChange }
  }

  componentDidMount() {
    if (isAndroid) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      ]).then(() => {
        this.setState({ androidPermissionGranted: true })
      })
    }
  }

  render() {
    const {
      androidPermissionGranted,
      state,
      streamInfo,
      audioMixProgress,
      streamingConfigInput,
      streamingConfigError,
      streamingConfig
    } = this.state

    if (isAndroid && !androidPermissionGranted) {
      return (
        <>
          <StatusBar barStyle="dark-content" />
          <SafeAreaView style={{ display: 'flex', flex: 1, backgroundColor: '#fff' }}>
            <Text>Permission not granted</Text>
          </SafeAreaView>
        </>
      )
    }

    const streamingConfigErrorText = (
      streamingConfigError != null
      ? <Text style={{ color: 'red' }}>{streamingConfigError}</Text>
      : null
    )
    const stateText = state != null ? state : 'none'
    const streamInfoText = streamInfo != null ? JSON.stringify(streamInfo) : 'none'
    const audioMixProgressText = audioMixProgress != null ? JSON.stringify(audioMixProgress) : 'none'
    const props = {
      ...streamingConfig,

      // TODO: 后续不再需要
      profile: {
        ...streamingConfig.profile,
        video: streamingConfig.profile.videoStreamingSetting,
        audio: streamingConfig.profile.audioStreamingSetting,
      },

      onStateChange: this.handleStateChange,
      onStreamInfoChange: this.handleStreamInfoChange,
      onAudioMixProgress: this.handleAudioMixProgress,
      style: {
        width: '100%',
        height: 200,
        backgroundColor: 'transparent',
        borderBottomColor: '#333',
        borderBottomWidth: 1,
      },
    }

    const streamingConfigText = JSON.stringify(streamingConfig, null, 2)

    this.state.streamingConfig.audioMixFile.filePath

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ display: 'flex', flex: 1 }}>
          <Streaming {...props} />
          <ScrollView style={{ flex: 1, backgroundColor : 'white', padding: 10 }}>

            <View style={{ display: 'none' }}>
              <TextInput
                multiline
                numberOfLines={4}
                value={streamingConfigInput}
                onChangeText={this.handleStreamingConfigInputChange}
                placeholder={'请输入 JSON 格式的配置，如 { "camera": "front" }'}
                style={{ backgroundColor: '#f0f0f0', lineHeight: 30, height: 120 }}
              />
              {streamingConfigErrorText}
              <Button title="提交" onPress={this.handleStreamingConfigInputSubmit} />
            </View>

            <SwitchInput label="开始推流" {...this.bindStateOfPath('streamingConfig.started')} />
            <SwitchInput label="静音" {...this.bindStateOfPath('streamingConfig.muted')} />
            <SwitchInput label="手动对焦" {...this.bindStateOfPath('streamingConfig.focus')} />
            <CameraInput {...this.bindStateOfPath('streamingConfig.camera')} />

            <AvCodecTypeInput {...this.bindStateOfPath('streamingConfig.profile.avCodecType')} />

            <CameraResolutionInput {...this.bindStateOfPath('streamingConfig.profile.cameraStreamingSetting.resolution')} />
            <CameraFocusModeInput {...this.bindStateOfPath('streamingConfig.profile.cameraStreamingSetting.focusMode')} />
            <CameraVideoOrientationInput {...this.bindStateOfPath('streamingConfig.profile.cameraStreamingSetting.videoOrientation')} />

            <MicrophoneSampleRateInput {...this.bindStateOfPath('streamingConfig.profile.microphoneSteamingSetting.sampleRate')} />
            <MicrophoneChannelInput {...this.bindStateOfPath('streamingConfig.profile.microphoneSteamingSetting.channel')} />
            <SwitchInput label="回音消除" {...this.bindStateOfPath('streamingConfig.profile.microphoneSteamingSetting.isAecEnable')} />

            <VideoEncodeOrientationInput {...this.bindStateOfPath('streamingConfig.profile.videoStreamingSetting.encodeOrientation')} />
            <VideoH264ProfileInput {...this.bindStateOfPath('streamingConfig.profile.videoStreamingSetting.h264Profile')} />

            <NumberInput label="自定义视频编码分辨率宽度" {...this.bindStateOfPath('streamingConfig.profile.videoStreamingSetting.customVideoEncodeSize.width')} />
            <NumberInput label="自定义视频编码分辨率高度" {...this.bindStateOfPath('streamingConfig.profile.videoStreamingSetting.customVideoEncodeSize.height')} />

            <NumberInput label="音频采样率" {...this.bindStateOfPath('streamingConfig.profile.audioStreamingSetting.rate')} />
            <NumberInput label="音频码率" {...this.bindStateOfPath('streamingConfig.profile.audioStreamingSetting.bitrate')} />

            <SwitchInput label="使用 QUIC 协议" {...this.bindStateOfPath('streamingConfig.profile.quicEnable')} />
            <BitrateAdjustModeInput {...this.bindStateOfPath('streamingConfig.profile.bitrateAdjustMode')} />
            <NumberInput label="自适应码率调节范围下限" {...this.bindStateOfPath('streamingConfig.profile.adaptiveBitrateRange.minBitrate')} />
            <NumberInput label="自适应码率调节范围上限" {...this.bindStateOfPath('streamingConfig.profile.adaptiveBitrateRange.maxBitrate')} />

            <EncoderRCModeInput {...this.bindStateOfPath('streamingConfig.profile.encoderRCMode')} />

            <NumberInput label="streamInfo 更新间隔" {...this.bindStateOfPath('streamingConfig.profile.streamInfoUpdateInterval')} />

            <SwitchInput label="内置美颜" {...this.bindStateOfPath('streamingConfig.faceBeautyEnable')} />
            <NumberInput label="内置美颜磨皮程度" {...this.bindStateOfPath('streamingConfig.faceBeautySetting.beautyLevel')} />
            <NumberInput label="内置美颜美白程度" {...this.bindStateOfPath('streamingConfig.faceBeautySetting.whiten')} />
            <NumberInput label="内置美颜红润程度" {...this.bindStateOfPath('streamingConfig.faceBeautySetting.redden')} />

            <FileInput label="水印文件" {...this.bindStateOfPath('streamingConfig.watermarkSetting.src')} initialFromUrl="http://oyojsr1f8.bkt.clouddn.com/qiniu_logo.png" />
            <NumberInput label="水印文件透明度" {...this.bindStateOfPath('streamingConfig.watermarkSetting.alpha')} />
            <NumberInput label="水印水平位置" {...this.bindStateOfPath('streamingConfig.watermarkSetting.position.x')} />
            <NumberInput label="水印垂直位置" {...this.bindStateOfPath('streamingConfig.watermarkSetting.position.y')} />
            <NumberInput label="水印宽度" {...this.bindStateOfPath('streamingConfig.watermarkSetting.size.width')} />
            <NumberInput label="水印高度" {...this.bindStateOfPath('streamingConfig.watermarkSetting.size.height')} />

            <SwitchInput label="图片推流" {...this.bindStateOfPath('streamingConfig.pictureStreamingEnable')} />
            <FileInput label="图片推流文件" {...this.bindStateOfPath('streamingConfig.pictureStreamingFile')} initialFromUrl="http://oyojsr1f8.bkt.clouddn.com/pause_publish.png" />

            <SwitchInput label="开启闪光灯" {...this.bindStateOfPath('streamingConfig.torchEnable')} />
            <SwitchInput label="预览镜像设置" {...this.bindStateOfPath('streamingConfig.previewMirrorEnable')} />
            <SwitchInput label="编码镜像设置" {...this.bindStateOfPath('streamingConfig.encodingMirrorEnable')} />

            <SwitchInput label="播放混音文件" {...this.bindStateOfPath('streamingConfig.playMixAudio')} />
            <FileInput label="混音文件" {...this.bindStateOfPath('streamingConfig.audioMixFile.filePath')} initialFromUrl="http://oyojsr1f8.bkt.clouddn.com/Lovestoned-Thursdays.mp3" />
            <SwitchInput label="混音文件循环播放" {...this.bindStateOfPath('streamingConfig.audioMixFile.loop')} />
            <NumberInput label="混音音量 micVolume" {...this.bindStateOfPath('streamingConfig.audioMixVolume.micVolume')} />
            <NumberInput label="混音音量 musicVolume" {...this.bindStateOfPath('streamingConfig.audioMixVolume.musicVolume')} />

            <SwitchInput label="返听功能" {...this.bindStateOfPath('streamingConfig.playbackEnable')} />

            <Text>Pili@ReactNative</Text>
            <Text>State: {stateText}</Text>
            <Text>StreamInfo: {streamInfoText}</Text>
            <Text>AudioMixProgress: {audioMixProgressText}</Text>
            <Text>streamingConfig: </Text>
            <Text>{streamingConfigText}</Text>
          </ScrollView>
        </SafeAreaView>
      </>
    )
  }
}

