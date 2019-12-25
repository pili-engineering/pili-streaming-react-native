'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var P = _interopDefault(require('prop-types'));
var reactNative = require('react-native');

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

/**
 * @file const defines for Pili SDK
 * @author nighca <nighca@live.cn>
 */
// streaming states
var streamingStates = {
  ready: 0,
  connecting: 1,
  streaming: 2,
  shutdown: 3,
  error: 4,
  disconnected: 5
}; // avCodecType

var avCodecTypes_iOS = {
  PLH264EncoderType_AVFoundation: 0,
  PLH264EncoderType_VideoToolbox: 1
};
var avCodecTypes_android = {
  SW_VIDEO_WITH_HW_AUDIO_CODEC: 2,
  SW_VIDEO_WITH_SW_AUDIO_CODEC: 3,
  HW_VIDEO_SURFACE_AS_INPUT_WITH_HW_AUDIO_CODEC: 4,
  HW_VIDEO_SURFACE_AS_INPUT_WITH_SW_AUDIO_CODEC: 5,
  HW_VIDEO_YUV_AS_INPUT_WITH_HW_AUDIO_CODEC: 6,
  HW_VIDEO_CODEC: 7,
  // 纯视频推流
  SW_VIDEO_CODEC: 8,
  // 纯视频推流
  HW_AUDIO_CODEC: 9,
  // 纯音频推流
  SW_AUDIO_CODEC: 10 // 纯音频推流

};
var avCodecTypes = _objectSpread2({}, avCodecTypes_iOS, {}, avCodecTypes_android); // camera resolution 相机分辨率

var cameraResolutions_android = {
  SMALL_RATIO_4_3: 0,
  SMALL_RATIO_16_9: 1,
  MEDIUM_RATIO_4_3: 2,
  MEDIUM_RATIO_16_9: 3,
  LARGE_RATIO_4_3: 4,
  LARGE_RATIO_16_9: 5
};
var cameraResolutions_iOS = {
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
  AVCaptureSessionPresetiFrame1280x720: 10
};
var cameraResolutions = _objectSpread2({}, cameraResolutions_iOS, {}, cameraResolutions_android); // camera focusMode (仅 Android)

var cameraFocusModes = {
  auto: 0,
  continuousPicture: 1,
  continuousVideo: 2
}; // camera videoOrientation (仅 iOS)

var cameraVideoOrientations = {
  portrait: 1,
  portraitUpsideDown: 2,
  landscapeRight: 3,
  landscapeLeft: 4
}; // microphone sampleRate 麦克风采样率 (仅 Android)

var microphoneSampleRates = {
  r44100: 44100,
  r16000: 16000
}; // microphone channel

var microphoneChannels = {
  mono: 0,
  stereo: 1
}; // video encodings

var videoEncodings = {
  e240: 0,
  e480: 1,
  e544: 2,
  e720: 3,
  e1088: 4
}; // video encode orientation (仅 Android)

var videoEncodeOrientations = {
  portrait: 0,
  landscape: 1
}; // video H264 profile

var videoH264Profiles_android = {
  baseline: 0,
  main: 1,
  high: 2
};
var videoH264Profiles_iOS = {
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
  highAutoLevel: 11
};
var videoH264Profiles = _objectSpread2({}, videoH264Profiles_iOS, {}, videoH264Profiles_android); // bitrate adjust mode

var bitrateAdjustModes = {
  auto: 0,
  manual: 1,
  // 仅 Android
  disable: 2
}; // encoder rc mode

var encoderRCModes = {
  qualityPriority: 0,
  bitratePriority: 1
};

var _const = /*#__PURE__*/Object.freeze({
  __proto__: null,
  streamingStates: streamingStates,
  avCodecTypes_iOS: avCodecTypes_iOS,
  avCodecTypes_android: avCodecTypes_android,
  avCodecTypes: avCodecTypes,
  cameraResolutions_android: cameraResolutions_android,
  cameraResolutions_iOS: cameraResolutions_iOS,
  cameraResolutions: cameraResolutions,
  cameraFocusModes: cameraFocusModes,
  cameraVideoOrientations: cameraVideoOrientations,
  microphoneSampleRates: microphoneSampleRates,
  microphoneChannels: microphoneChannels,
  videoEncodings: videoEncodings,
  videoEncodeOrientations: videoEncodeOrientations,
  videoH264Profiles_android: videoH264Profiles_android,
  videoH264Profiles_iOS: videoH264Profiles_iOS,
  videoH264Profiles: videoH264Profiles,
  bitrateAdjustModes: bitrateAdjustModes,
  encoderRCModes: encoderRCModes
});

var PLRNMediaStreaming = reactNative.requireNativeComponent('PLRNMediaStreaming');

var Streaming =
/*#__PURE__*/
function (_Component) {
  _inherits(Streaming, _Component);

  function Streaming() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Streaming);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Streaming)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "handleStateChange", function (event) {
      if (_this.props.onStateChange) {
        _this.props.onStateChange(event.nativeEvent.state);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "handleStreamInfoChange", function (event) {
      if (_this.props.onStreamInfoChange) {
        _this.props.onStreamInfoChange(event.nativeEvent);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "handleAudioMixProgress", function (event) {
      if (_this.props.onAudioMixProgress) {
        _this.props.onAudioMixProgress(event.nativeEvent);
      }
    });

    return _this;
  }

  _createClass(Streaming, [{
    key: "render",
    value: function render() {
      return React__default.createElement(PLRNMediaStreaming, _extends({}, this.props, {
        onStateChange: this.handleStateChange,
        onStreamInfoChange: this.handleStreamInfoChange,
        onAudioMixProgress: this.handleAudioMixProgress
      }));
    }
  }]);

  return Streaming;
}(React.Component);
Streaming.propTypes = _objectSpread2({
  rtmpURL: P.string.isRequired,
  camera: P.oneOf(['front', 'back']),
  muted: P.bool,
  zoom: P.number,
  focus: P.bool,
  started: P.bool,
  faceBeautyEnable: P.bool,
  faceBeautySetting: P.shape({
    beautyLevel: P.number,
    // 0-1.0
    whiten: P.number,
    // 0-1.0
    redden: P.number // 0-1.0

  }),
  watermarkSetting: P.shape({
    // 水印设置
    src: P.string,
    // 文件路径
    alpha: P.number,
    // 0-255, iOS 不支持
    position: P.shape({
      x: P.number,
      y: P.number
    }),
    size: P.shape({
      // iOS 不支持
      width: P.number,
      height: P.number
    })
  }),
  pictureStreamingFile: P.string,
  // 图片推流文件，值为文件路径
  pictureStreamingEnable: P.bool,
  // 开始/关闭图片推流
  torchEnable: P.bool,
  // 开启、关闭闪光灯
  // captureFrame: P.bool, // TODO: 截图
  previewMirrorEnable: P.bool,
  // 预览镜像设置
  encodingMirrorEnable: P.bool,
  // 编码镜像设置
  audioMixFile: P.shape({
    // 混音
    filePath: P.string,
    // 混音文件路径
    loop: P.bool
  }),
  playMixAudio: P.bool,
  // true 开始混音，false 暂停混音
  audioMixVolume: P.shape({
    micVolume: P.number,
    // 0-1.0
    musicVolume: P.number // 0-1.0

  }),
  playbackEnable: P.bool,
  profile: P.shape({
    videoStreamingSetting: P.shape({
      fps: P.number.isRequired,
      bps: P.number.isRequired,
      maxFrameInterval: P.number.isRequired,
      encodeOrientation: oneOf(videoEncodeOrientations),
      // iOS 不支持
      h264Profile: oneOf(videoH264Profiles),
      customVideoEncodeSize: P.shape({
        width: P.number,
        // 单位：像素
        height: P.number // 单位：像素

      })
    }).isRequired,
    audioStreamingSetting: P.shape({
      rate: P.number.isRequired,
      bitrate: P.number.isRequired
    }).isRequired,
    encodingSize: oneOf(videoEncodings).isRequired,
    avCodecType: oneOf(avCodecTypes),
    cameraStreamingSetting: P.shape({
      resolution: oneOf(cameraResolutions),
      focusMode: oneOf(cameraFocusModes),
      // iOS 不支持
      videoOrientation: oneOf(cameraVideoOrientations) // Android 不支持

    }),
    microphoneSteamingSetting: P.shape({
      sampleRate: oneOf(microphoneSampleRates),
      // iOS 不支持
      channel: oneOf(microphoneChannels),
      isAecEnable: P.bool
    }),
    // screenSetting: P.shape({
    //   width: P.number, // 单位：像素，全屏传 `0`，iOS 不支持
    //   height: P.number, // 单位：像素，全屏传 `0`，iOS 不支持
    //   dpi: P.number // 要求大于 0，iOS 不支持
    // }),
    quicEnable: P.bool,
    bitrateAdjustMode: oneOf(bitrateAdjustModes),
    adaptiveBitrateRange: P.shape({
      minBitrate: P.number,
      // 单位：bps
      maxBitrate: P.number // 单位：bps，iOS 不支持

    }),
    encoderRCMode: oneOf(encoderRCModes),
    // iOS 不支持
    streamInfoUpdateInterval: P.number // 单位：秒

  }).isRequired,
  onStateChange: P.func,
  onStreamInfoChange: P.func,
  onAudioMixProgress: P.func
}, reactNative.View.propTypes);

function oneOf(kvs) {
  return P.oneOf(Object.keys(kvs).map(function (k) {
    return kvs[k];
  }));
}

exports.Streaming = Streaming;
exports.consts = _const;
