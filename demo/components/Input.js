import React, { useState, useEffect } from 'react'
import { Platform, Picker, Text, TextInput, Button, View, Switch } from 'react-native'
import { consts } from 'pili-streaming-react-native'
import { DocumentDirectoryPath, downloadFile } from 'react-native-fs'

function SelectWithKVs({ label, kvs, value, onChange }) {
  const items = Object.entries(kvs).map(([name, value]) => (
    <Picker.Item key={name} label={name} value={value} />
  ))
  return (
    <View style={{ marginTop: 10 }}>
      <Text>{label}</Text>
      <Picker selectedValue={value} onValueChange={onChange}>
        {items}
      </Picker>
    </View>
  )
}

export function CameraInput(props) {
  return <SelectWithKVs label="摄像头" kvs={{
    '前置摄像头': 'front',
    '后置摄像头': 'back',
  }} {...props} />
}

export function AvCodecTypeInput(props) {
  return <SelectWithKVs label="编码方式（AvCodecType）" kvs={consts.avCodecTypes} {...props} />
}

function CameraResolutionInputAndroid(props) {
  return <SelectWithKVs kvs={consts.cameraResolutions_android} {...props} />
}

function CameraResolutionInputIOS(props) {
  return <SelectWithKVs kvs={consts.cameraResolutions_iOS} {...props} />
}

export function CameraResolutionInput(props) {
  props = {
    label: "相机预览分辨率（CameraResolution）",
    ...props
  }
  if (Platform.OS === 'android') {
    return <CameraResolutionInputAndroid {...props} />
  }
  if (Platform.OS === 'ios') {
    return <CameraResolutionInputIOS {...props} />
  }
  return null
}

export function CameraFocusModeInput(props) {
  return <SelectWithKVs label="相机对焦模式（CameraFocusMode）" kvs={consts.cameraFocusModes} {...props} />
}

export function CameraVideoOrientationInput(props) {
  return <SelectWithKVs label="摄像头旋转方向（CameraVideoOrientation）" kvs={consts.cameraVideoOrientations} {...props} />
}

export function MicrophoneSampleRateInput(props) {
  return <SelectWithKVs label="麦克风采样率（MicrophoneSampleRate）" kvs={consts.microphoneSampleRates} {...props} />
}

export function MicrophoneChannelInput(props) {
  return <SelectWithKVs label="麦克风声道数（MicrophoneChannel）" kvs={consts.microphoneChannels} {...props} />
}

export function VideoEncodeOrientationInput(props) {
  return <SelectWithKVs label="推流编码画面旋转方向（VideoEncodeOrientation）" kvs={consts.videoEncodeOrientations} {...props} />
}

export function VideoH264ProfileInputAndroid(props) {
  return <SelectWithKVs kvs={consts.videoH264Profiles_android} {...props} />
}

export function VideoH264ProfileInputIOS(props) {
  return <SelectWithKVs kvs={consts.videoH264Profiles_iOS} {...props} />
}

export function VideoH264ProfileInput(props) {
  props = {
    label: 'H.264 编码行为（VideoH264Profile）',
    ...props
  }
  if (Platform.OS === 'android') {
    return <VideoH264ProfileInputAndroid {...props} />
  }
  if (Platform.OS === 'ios') {
    return <VideoH264ProfileInputIOS {...props} />
  }
  return null
}

export function BitrateAdjustModeInput(props) {
  return <SelectWithKVs label="码率自适应（BitrateAdjustMode）" kvs={consts.bitrateAdjustModes} {...props} />
}

export function EncoderRCModeInput(props) {
  return <SelectWithKVs label="码率控制（EncoderRCMode）" kvs={consts.encoderRCModes} {...props} />
}

export function FileInput({ label, initialFromUrl, onChange }) {
  const [fromUrl, setFromUrl] = useState(initialFromUrl || '')
  const [result, setResult] = useState('')

  const handleDownload = () => {
    setResult('')
    if (!fromUrl) {
      onChange(null)
      return
    }
    const fileName = fromUrl.split('/').pop()
    const toFile = DocumentDirectoryPath + '/' + fileName
    downloadFile({ fromUrl, toFile }).promise.then(
      () => {
        setResult('已保存到：' + toFile)
        onChange(toFile)
      },
      e => setResult('下载失败：' + (e && e.message))
    )
  }

  useEffect(() => {
    if (fromUrl) {
      handleDownload()
    }
  }, [])

  return (
    <View style={{ marginTop: 10 }}>
      <TextInput
        placeholder={'请输入' + label + '的 URL'}
        value={fromUrl}
        onChangeText={setFromUrl}
        style={{ backgroundColor: '#f0f0f0', height: 40 }}
      />
      {result ? <Text style={{ marginTop: 5, marginBottom: 5, fontSize: 12, color: '#666' }}>{result}</Text> : null}
      <Button title={'加载' + label} onPress={handleDownload} />
    </View>
  )
}

export function SwitchInput({ label, value, onChange }) {
  return (
    <View style={{ marginTop: 10, flexDirection: 'row' }}>
      <Text style={{ flex: 1, lineHeight: 30 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  )
}

export function NumberInput({ label, value, onChange }) {
  const [valueText, setValueText] = useState(value + '')
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ lineHeight: 40 }}>{label}</Text>
      <TextInput style={{ flex: 1, backgroundColor: '#f0f0f0', height: 40 }} value={valueText} onChangeText={setValueText} />
      <Button title="提交" onPress={() => onChange(parseFloat(valueText))} />
    </View>
  )
}
