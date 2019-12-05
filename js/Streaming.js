/**
 * @file Pili 推流组件
 * @author nighca <nighca@live.cn>
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { View, requireNativeComponent } from 'react-native'
import * as consts from './const'

const PLRNMediaStreaming = requireNativeComponent('PLRNMediaStreaming')
// const PLRNMediaStreaming = View

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

  render() {
    return (
      <PLRNMediaStreaming
        {...this.props}
        onStateChange={this.handleStateChange}
        onStreamInfoChange={this.handleStreamInfoChange}
      />
    )
  }
}

Streaming.propTypes = {
  rtmpURL: PropTypes.string.isRequired,
  camera: PropTypes.oneOf(['front','back']),
  muted: PropTypes.bool,
  zoom: PropTypes.number,
  focus: PropTypes.bool,
  profile: PropTypes.shape({
    video: PropTypes.shape({
      fps: PropTypes.number.isRequired,
      bps: PropTypes.number.isRequired,
      maxFrameInterval: PropTypes.number.isRequired
    }).isRequired,
    audio: PropTypes.shape({
      rate: PropTypes.number.isRequired,
      bitrate: PropTypes.number.isRequired,
    }).isRequired,
    encodingSize: PropTypes.oneOf([consts.videoEncoding240, consts.videoEncoding480, consts.videoEncoding544, consts.videoEncoding720, consts.videoEncoding1088]).isRequired
  }).isRequired,
  started: PropTypes.bool,

  onStateChange: PropTypes.func,
  onStreamInfoChange: PropTypes.func,

  ...View.propTypes
}