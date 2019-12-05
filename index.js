'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var PropTypes = _interopDefault(require('prop-types'));
var reactNative = require('react-native');

/**
 * @file const defines for Pili SDK
 * @author nighca <nighca@live.cn>
 */
// video encodings
var videoEncoding240 = 0;
var videoEncoding480 = 1;
var videoEncoding544 = 2;
var videoEncoding720 = 3;
var videoEncoding1088 = 4; // streaming states

var streamingStateReady = 0;
var streamingStateConnecting = 1;
var streamingStateStreaming = 2;
var streamingStateShutdown = 3;
var streamingStateError = 4;
var streamingStateDisconnected = 5;

var _const = /*#__PURE__*/Object.freeze({
  __proto__: null,
  videoEncoding240: videoEncoding240,
  videoEncoding480: videoEncoding480,
  videoEncoding544: videoEncoding544,
  videoEncoding720: videoEncoding720,
  videoEncoding1088: videoEncoding1088,
  streamingStateReady: streamingStateReady,
  streamingStateConnecting: streamingStateConnecting,
  streamingStateStreaming: streamingStateStreaming,
  streamingStateShutdown: streamingStateShutdown,
  streamingStateError: streamingStateError,
  streamingStateDisconnected: streamingStateDisconnected
});

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

var PLRNMediaStreaming = reactNative.requireNativeComponent('PLRNMediaStreaming'); // const PLRNMediaStreaming = View

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

    return _this;
  }

  _createClass(Streaming, [{
    key: "render",
    value: function render() {
      return React__default.createElement(PLRNMediaStreaming, _extends({}, this.props, {
        onStateChange: this.handleStateChange,
        onStreamInfoChange: this.handleStreamInfoChange
      }));
    }
  }]);

  return Streaming;
}(React.Component);
Streaming.propTypes = _objectSpread2({
  rtmpURL: PropTypes.string.isRequired,
  camera: PropTypes.oneOf(['front', 'back']),
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
      bitrate: PropTypes.number.isRequired
    }).isRequired,
    encodingSize: PropTypes.oneOf([videoEncoding240, videoEncoding480, videoEncoding544, videoEncoding720, videoEncoding1088]).isRequired
  }).isRequired,
  started: PropTypes.bool,
  onStateChange: PropTypes.func,
  onStreamInfoChange: PropTypes.func
}, reactNative.View.propTypes);

exports.Streaming = Streaming;
exports.consts = _const;
