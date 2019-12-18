/**
 * Sample for Pili react-native SDK
 */

import merge from 'merge'
import React, { Component } from 'react'
import { SafeAreaView, Text, StatusBar, ScrollView, View, Button, Platform, PermissionsAndroid, TextInput } from 'react-native'
import { consts, Streaming } from 'pili-streaming-react-native'

const isAndroid = Platform.OS === 'android'

export default class App extends Component {

  state = {
    androidPermissionGranted: false,
    state: null,
    streamInfo: null,
    streamingConfigInput: '',
    streamingConfigError: null,
    streamingConfig: {
      rtmpURL: 'rtmp://pili-publish.qnsdk.com/sdk-live/111',
      camera: 'back',
      muted: false,
      zoom: 1,
      focus: false,
      started: true,

      faceBeautyEnable: false,
      faceBeautySetting: {
        beautyLevel: 0,
        whiten: 0,
        redden: 0,
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
          height: 50
        },
      },
      pictureStreamingFile: null,
      pictureStreamingEnable: false,
      torchEnable: false,
      captureFrame: false,
      previewMirrorEnable: false,
      encodingMirrorEnable: false,
      audioMixFile: {
        filePath: null, // or `''`？
        loop: false,
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
          bps: 800 * 1024,
          maxFrameInterval: 60,
          encodeOrientation: consts.videoEncodeOrientations.portrait,
          h264Profile: (
            isAndroid
            ? consts.videoH264Profiles_android.baseline
            : consts.videoH264Profiles_iOS.baselineAutoLevel
          ),
          customVideoEncodeSize: { // TODO: 确认下取值是不是合理
            width: 1024,
            height: 800
          }
        },
        audioStreamingSetting: {
          rate: 44100,
          bitrate: 96 * 1024,
        },
        encodingSize: consts.videoEncodings.e480,
        avCodecType: (
          isAndroid
          ? consts.avCodecTypes_android.SW_VIDEO_CODEC
          : consts.avCodecTypes_iOS.PLH264EncoderType_AVFoundation
        ),
        cameraStreamingSetting: {
          resolution: (
            isAndroid
            ? consts.cameraResolutions_android.MEDIUM_RATIO_4_3
            : consts.cameraResolutions_iOS.AVCaptureSessionPresetMedium
          ),
          focusMode: consts.cameraFocusModes.auto,
          videoOrientation: consts.cameraVideoOrientations.landscapeLeft
        },
        microphoneSteamingSetting: {
          sampleRate: consts.microphoneSampleRates.r16000,
          channel: consts.microphoneChannels.mono,
          isAecEnable: true
        },
        quicEnable: false,
        bitrateAdjustMode: consts.bitrateAdjustModes.auto,
        adaptiveBitrateRange: { // TODO: 确认下取值是否合理
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
      style: {
        width: '100%',
        height: 200,
        backgroundColor: 'transparent',
        borderBottomColor: '#333',
        borderBottomWidth: 1,
      },
    }
    const streamingConfigText = JSON.stringify(streamingConfig, null, 2)
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ display: 'flex', flex: 1 }}>
          <Streaming {...props} />
          <View style={{ flex: 1, backgroundColor : 'white'}}>
            <TextInput
              multiline
              numberOfLines={5}
              value={streamingConfigInput}
              onChangeText={this.handleStreamingConfigInputChange}
            />
            {streamingConfigErrorText}
            <Button title="提交" onPress={this.handleStreamingConfigInputSubmit} />
            <ScrollView style={{ flex: 1 }}>
              <Text>Pili@ReactNative</Text>
              <Text>State: {stateText}</Text>
              <Text>StreamInfo: {streamInfoText}</Text>
              <Text>streamingConfig: </Text>
              <Text>{streamingConfigText}</Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </>
    )
  }
}