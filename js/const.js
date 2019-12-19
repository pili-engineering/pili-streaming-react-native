/**
 * @file const defines for Pili SDK
 * @author nighca <nighca@live.cn>
 */

// streaming states
export const streamingStates = {
  ready: 0,
  connecting: 1,
  streaming: 2,
  shutdown: 3,
  error: 4,
  disconnected: 5,
}

// avCodecType
export const avCodecTypes_iOS = {
  PLH264EncoderType_AVFoundation: 0,
  PLH264EncoderType_VideoToolbox: 1,
}
export const avCodecTypes_android = {
  SW_VIDEO_WITH_HW_AUDIO_CODEC: 2,
  SW_VIDEO_WITH_SW_AUDIO_CODEC: 3,
  HW_VIDEO_SURFACE_AS_INPUT_WITH_HW_AUDIO_CODEC: 4,
  HW_VIDEO_SURFACE_AS_INPUT_WITH_SW_AUDIO_CODEC: 5,
  HW_VIDEO_YUV_AS_INPUT_WITH_HW_AUDIO_CODEC: 6,
  HW_VIDEO_CODEC: 7, // 纯视频推流
  SW_VIDEO_CODEC: 8, // 纯视频推流
  HW_AUDIO_CODEC: 9, // 纯音频推流
  SW_AUDIO_CODEC: 10, // 纯音频推流
}
export const avCodecTypes = {
  ...avCodecTypes_iOS,
  ...avCodecTypes_android
}

// camera resolution 相机分辨率
export const cameraResolutions_android = {
  SMALL_RATIO_4_3: 0,
  SMALL_RATIO_16_9: 1,
  MEDIUM_RATIO_4_3: 2,
  MEDIUM_RATIO_16_9: 3,
  LARGE_RATIO_4_3: 4,
  LARGE_RATIO_16_9: 5,
}
export const cameraResolutions_iOS = {
  AVCaptureSessionPresetPhoto: 0,
  AVCaptureSessionPresetHigh: 1,
  AVCaptureSessionPresetMedium: 2,
  AVCaptureSessionPresetLow: 3,
  AVCaptureSessionPreset352x288: 4,
  AVCaptureSessionPreset640x480: 5,
  AVCaptureSessionPreset1280x720: 6,
  AVCaptureSessionPreset1920x1080: 7,
  AVCaptureSessionPreset3840x2160: 8,
  AVCaptureSessionPresetiFrame960x540: 9,
  AVCaptureSessionPresetiFrame1280x720: 10,
}
export const cameraResolutions = {
  ...cameraResolutions_iOS,
  ...cameraResolutions_android
}

// camera focusMode (仅 Android)
export const cameraFocusModes = {
  auto: 0,
  continuousPicture: 1,
  continuousVideo: 2,
}

// camera videoOrientation (仅 iOS)
export const cameraVideoOrientations = {
  portrait: 1,
  portraitUpsideDown: 2,
  landscapeRight: 3,
  landscapeLeft: 4,
}

// microphone sampleRate 麦克风采样率 (仅 Android)
export const microphoneSampleRates = {
  r44100: 44100,
  r16000: 16000,
}

// microphone channel
export const microphoneChannels = {
  mono: 0,
  stereo: 1,
}

// video encodings
export const videoEncodings = {
  e240: 0,
  e480: 1,
  e544: 2,
  e720: 3,
  e1088: 4,
}

// video encode orientation (仅 Android)
export const videoEncodeOrientations = {
  portrait: 0,
  landscape: 1,
}

// video H264 profile
export const videoH264Profiles_android = {
  baseline: 0,
  main: 1,
  high: 2,
}
export const videoH264Profiles_iOS = {
  baseline30: 0,
  main30: 1,
  baseline31: 2,
  main31: 3,
  main32: 4,
  high40: 5,
  baseline41: 6,
  main41: 7,
  high41: 8,
  baselineAutoLevel: 9,
  mainAutoLevel: 10,
  highAutoLevel: 11,
}
export const videoH264Profiles = {
  ...videoH264Profiles_iOS,
  ...videoH264Profiles_android,
}

// bitrate adjust mode
export const bitrateAdjustModes = {
  auto: 0,
  manual: 1, // 仅 Android
  disable: 2,
}

// encoder rc mode
export const encoderRCModes = {
  qualityPriority: 0,
  bitratePriority: 1,
}
