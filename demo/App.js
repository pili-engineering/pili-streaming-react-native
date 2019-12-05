/**
 * Sample for Pili react-native SDK
 */

import React, { Component } from 'react'
import { SafeAreaView, Text, StatusBar, ScrollView, Button, Platform, PermissionsAndroid } from 'react-native'
import { consts, Streaming } from 'pili-streaming-react-native'

const isAndroid = Platform.OS === 'android'

export default class App extends Component {

  state = {
    androidPermissionGranted: false,
    state: null,
    streamInfo: null,
    rtmpURL: 'rtmp://pili-publish.qnsdk.com/sdk-live/111',
    camera: 'back',
    muted: false,
    zoom: 1,
    focus: false,
    profile: {
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
    },
    started: false
  }

  switchCamera = () => this.setState({
    camera: this.state.camera === 'front' ? 'back' : 'front'
  })

  toggleMuted = () => this.setState({
    muted: !this.state.muted
  })

  zoomIn = () => this.setState({
    zoom: this.state.zoom + 1
  })

  zoomOut = () => this.setState({
    zoom: this.state.zoom > 1 ? (this.state.zoom - 1) : 1
  })

  toggleFocus = () => this.setState({
    focus: !this.state.focus
  })

  toggleStarted = () => this.setState({
    started: !this.state.started
  })

  handleStateChange = state => this.setState({ state })
  handleStreamInfoChange = streamInfo => this.setState({ streamInfo })

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
    const { androidPermissionGranted, state, streamInfo, ...streamingConfig } = this.state
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

    const stateText = state != null ? state : 'none'
    const streamInfoText = streamInfo != null ? JSON.stringify(streamInfo) : 'none'
    const props = {
      ...streamingConfig,
      onStateChange: this.handleStateChange,
      onStreamInfoChange: this.handleStreamInfoChange,
      style: {
        width: '100%',
        height: 200,
        backgroundColor: 'transparent'
      },
    }
    const toggleStartBtnText = this.state.started ? 'Stop' : 'Start'
    const propsText = JSON.stringify(props, null, 2)
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={{ display: 'flex', flex: 1 }}>
          <Streaming {...props} />
          <Button onPress={this.switchCamera} title="Switch camera" />
          <Button onPress={this.toggleMuted} title="Toggle muted" />
          <Button onPress={this.zoomIn} title="Zoom in" />
          <Button onPress={this.zoomOut} title="Zoom out" />
          <Button onPress={this.toggleFocus} title="Toggle focus" />
          <Button onPress={this.toggleStarted} title={toggleStartBtnText} />
          <ScrollView style={{ flex: 1, backgroundColor : 'white'}}>
            <Text>Pili@ReactNative</Text>
            <Text>State: {stateText}</Text>
            <Text>StreamInfo: {streamInfoText}</Text>
            <Text>Props: </Text>
            <Text>{propsText}</Text>
          </ScrollView>
        </SafeAreaView>
      </>
    )
  }
}