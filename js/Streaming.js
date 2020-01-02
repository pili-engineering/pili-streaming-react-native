/**
 * @file Pili 推流组件
 * @author nighca <nighca@live.cn>
 */

import React, { Component } from 'react'
import P from 'prop-types'
import { View, requireNativeComponent } from 'react-native'
import * as consts from './const'

const PLRNMediaStreaming = requireNativeComponent('PLRNMediaStreaming')

export default class Streaming extends Component {

  handleStateChange = (event) => {
    if (this.props.onStateChange) {
      this.props.onStateChange(event.nativeEvent.state)
    }
  }

  handleStreamInfoChange = (event) => {
    if (this.props.onStreamInfoChange) {
      this.props.onStreamInfoChange(event.nativeEvent)
    }
  }

  handleAudioMixProgress = (event) => {
    if (this.props.onAudioMixProgress) {
      this.props.onAudioMixProgress(event.nativeEvent)
    }
  }

  render() {
    return (
      <PLRNMediaStreaming
        {...this.props}
        onStateChange={this.handleStateChange}
        onStreamInfoChange={this.handleStreamInfoChange}
        onAudioMixProgress={this.handleAudioMixProgress}
      />
    )
  }
}

Streaming.propTypes = {

  rtmpURL: P.string.isRequired,
  camera: P.oneOf(['front','back']),
  muted: P.bool,
  zoom: P.number,
  focus: P.bool,
  started: P.bool,
  faceBeautyEnable: P.bool,
  faceBeautySetting: P.shape({
    beautyLevel: P.number, // 0-1.0
    whiten: P.number, // 0-1.0
    redden: P.number, // 0-1.0
  }),
  watermarkSetting: P.shape({ // 水印设置
    src: P.string, // 文件路径
    alpha: P.number, // 0-255, iOS 不支持
    position: P.shape({
      x: P.number,
      y: P.number,
    }),
    size: P.shape({ // iOS 不支持
      width: P.number,
      height: P.number,
    }),
  }),
  pictureStreamingFile: P.string, // 图片推流文件，值为文件路径
  pictureStreamingEnable: P.bool, // 开始/关闭图片推流
  torchEnable: P.bool, // 开启、关闭闪光灯
  // captureFrame: P.bool, // TODO: 截图
  previewMirrorEnable: P.bool, // 预览镜像设置
  encodingMirrorEnable: P.bool, // 编码镜像设置
  audioMixFile: P.shape({ // 混音
    filePath: P.string, // 混音文件路径
    loop: P.bool,
  }),
  playMixAudio: P.bool, // true 开始混音，false 暂停混音
  audioMixVolume: P.shape({
    micVolume: P.number, // 0-1.0
    musicVolume: P.number, // 0-1.0
  }),
  playbackEnable: P.bool,

  profile: P.shape({

    videoStreamingSetting: P.shape({
      fps: P.number.isRequired,
      bps: P.number.isRequired,
      maxFrameInterval: P.number.isRequired,
      encodeOrientation: oneOf(consts.videoEncodeOrientations), // iOS 不支持
      h264Profile: oneOf(consts.videoH264Profiles),
      customVideoEncodeSize: P.shape({
        width: P.number, // 单位：像素
        height: P.number // 单位：像素
      })
    }).isRequired,

    audioStreamingSetting: P.shape({
      rate: P.number.isRequired,
      bitrate: P.number.isRequired,
    }).isRequired,

    encodingSize: oneOf(consts.videoEncodings).isRequired,
    avCodecType: oneOf(consts.avCodecTypes),

    cameraStreamingSetting: P.shape({
      resolution: oneOf(consts.cameraResolutions),
      focusMode: oneOf(consts.cameraFocusModes), // iOS 不支持
      videoOrientation: oneOf(consts.cameraVideoOrientations) // Android 不支持
    }),

    microphoneSteamingSetting: P.shape({
      sampleRate: oneOf(consts.microphoneSampleRates), // iOS 不支持
      channel: oneOf(consts.microphoneChannels),
      isAecEnable: P.bool
    }),

    quicEnable: P.bool,
    bitrateAdjustMode: oneOf(consts.bitrateAdjustModes),

    adaptiveBitrateRange: P.shape({
      minBitrate: P.number, // 单位：bps
      maxBitrate: P.number // 单位：bps，iOS 不支持
    }),

    encoderRCMode: oneOf(consts.encoderRCModes), // iOS 不支持
    streamInfoUpdateInterval: P.number, // 单位：秒

  }).isRequired,

  onStateChange: P.func,
  onStreamInfoChange: P.func,
  onAudioMixProgress: P.func,

  ...View.propTypes
}

function oneOf(kvs) {
  return P.oneOf(Object.keys(kvs).map(
    k => kvs[k]
  ))
}
