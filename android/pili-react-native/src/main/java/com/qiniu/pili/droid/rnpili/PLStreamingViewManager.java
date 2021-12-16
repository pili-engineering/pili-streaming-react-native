package com.qiniu.pili.droid.rnpili;

import android.graphics.Point;
import android.hardware.Camera;
import android.media.AudioFormat;
import android.util.Log;
import android.view.MotionEvent;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.qiniu.pili.droid.rnpili.utils.Utils;
import com.qiniu.pili.droid.streaming.AVCodecType;
import com.qiniu.pili.droid.streaming.CameraStreamingSetting;
import com.qiniu.pili.droid.streaming.MediaStreamingManager;
import com.qiniu.pili.droid.streaming.MicrophoneStreamingSetting;
import com.qiniu.pili.droid.streaming.StreamStatusCallback;
import com.qiniu.pili.droid.streaming.StreamingEnv;
import com.qiniu.pili.droid.streaming.StreamingProfile;
import com.qiniu.pili.droid.streaming.StreamingSessionListener;
import com.qiniu.pili.droid.streaming.StreamingState;
import com.qiniu.pili.droid.streaming.StreamingStateChangedListener;
import com.qiniu.pili.droid.streaming.WatermarkSetting;
import com.qiniu.pili.droid.streaming.microphone.AudioMixer;
import com.qiniu.pili.droid.streaming.microphone.OnAudioMixListener;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class PLStreamingViewManager extends SimpleViewManager<CameraPreviewFrameView>
        implements CameraPreviewFrameView.Listener, StreamingSessionListener, StreamingStateChangedListener,
        StreamStatusCallback, LifecycleEventListener {
    private static final String TAG = "PLStreamingViewManager";
    private static final String EXPORT_COMPONENT_NAME = "PLRNMediaStreaming";

    private static final String STATE = "state";

    private ThemedReactContext mReactContext;
    private RCTEventEmitter mEventEmitter;

    private MediaStreamingManager mMediaStreamingManager;
    private CameraPreviewFrameView mCameraPreviewFrameView;
    private StreamingProfile mProfile;
    private AudioMixer mAudioMixer;
    private CameraStreamingSetting mCameraStreamingSetting = null;
    private WatermarkSetting mWatermarkSetting;
    private CameraStreamingSetting.FaceBeautySetting mFaceBeautySetting;

    private boolean mIsFocus = false;
    private boolean mIsStarted = true;// default start attach on parent view
    private boolean mIsReady;

    private int mCurrentZoom = 0;
    private int mMaxZoom = 0;
    private CameraStreamingSetting.CAMERA_FACING_ID mCameraId = CameraStreamingSetting.CAMERA_FACING_ID.CAMERA_FACING_FRONT;

    private String mPublishUrl;
    private String mPictureStreamingFile = null;
    private boolean mIsPictureStreamingEnabled;

    private String mAudioMixFile = null;
    private boolean mIsAudioMixLooping;
    private boolean mIsMixAudioPlaying;
    private volatile boolean mIsAudioMixFinished;
    private float mMicVolume;
    private float mMusicVolume;

    private boolean mIsPlaybackEnable;
    private boolean mIsPreviewMirror;
    private boolean mIsEncodeMirror;
    private boolean mIsTorchEnable;
    private boolean mIsMuted;

    private CameraStreamingSetting.VIDEO_FILTER_TYPE mCurrentVideoFilterType = CameraStreamingSetting.VIDEO_FILTER_TYPE.VIDEO_FILTER_BEAUTY;

    public enum Events {
        READY, CONNECTING, STREAMING, SHUTDOWN, IOERROR, DISCONNECTED, STREAM_INFO_CHANGE, AUDIO_MIX_INFO
    }

    @NonNull
    @Override
    public String getName() {
        return EXPORT_COMPONENT_NAME;
    }

    @NonNull
    @Override
    protected CameraPreviewFrameView createViewInstance(@NonNull ThemedReactContext reactContext) {
        Log.i(TAG, "createViewInstance");
        StreamingEnv.init(reactContext);

        mReactContext = reactContext;
        mEventEmitter = mReactContext.getJSModule(RCTEventEmitter.class);

         Log.i(TAG, "mCameraPreviewFrameView："+(mCameraPreviewFrameView==null));
if(mCameraPreviewFrameView==null){
    mCameraPreviewFrameView = new CameraPreviewFrameView(mReactContext);
    mCameraPreviewFrameView.setListener(this);
    mCameraPreviewFrameView.setLayoutParams(
            new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

}
        mReactContext.addLifecycleEventListener(this);
        return mCameraPreviewFrameView;
    }

    @Override
    public void onDropViewInstance(CameraPreviewFrameView view) {
        Log.i(TAG, "onDropViewInstance");
        super.onDropViewInstance(view);
        mReactContext.removeLifecycleEventListener(this);
    }

    @Nullable
    @Override
    public Map getExportedCustomBubblingEventTypeConstants() {
        return MapBuilder.builder()
                .put(Events.READY.toString(),
                        MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.CONNECTING.toString(),
                        MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.STREAMING.toString(),
                        MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.SHUTDOWN.toString(),
                        MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.IOERROR.toString(),
                        MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.DISCONNECTED.toString(),
                        MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.STREAM_INFO_CHANGE.toString(),
                        MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onStreamInfoChange")))
                .put(Events.AUDIO_MIX_INFO.toString(),
                        MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", "onAudioMixProgress")))
                .build();
    }

    @ReactProp(name = "profile")
    public void setStreamingProfile(CameraPreviewFrameView view, @Nullable ReadableMap profile) {
        Log.i(TAG, "setStreamingProfile");
        if (mProfile != null) {
            return;
        }
        ReadableMap cameraSetting = profile.getMap("cameraStreamingSetting");
        int previewSize = cameraSetting.getInt("resolution");
        int focusMode = cameraSetting.getInt("focusMode");

        ReadableMap microphoneSetting = profile.getMap("microphoneSteamingSetting");
        int sampleRate = microphoneSetting.getInt("sampleRate");
        int channel = microphoneSetting.getInt("channel");
        boolean isAecEnable = microphoneSetting.getBoolean("isAecEnable");

        ReadableMap video = profile.getMap("videoStreamingSetting");
        ReadableMap audio = profile.getMap("audioStreamingSetting");
        int encodingSize = profile.getInt("encodingSize");
        int encoderRCMode = profile.getInt("encoderRCMode");
        int streamStatusConfig = profile.getInt("streamInfoUpdateInterval");
        int encodeOrientation = video.getInt("encodeOrientation");
        int h264Profile = video.getInt("h264Profile");

        boolean isQuicEnable = profile.getBoolean("quicEnable");
        AVCodecType avCodecType = getAvCodecType(profile.getInt("avCodecType"));
        Point customVideoEncodeSize = null;
        if (video.hasKey("customVideoEncodeSize")) {
            customVideoEncodeSize = new Point(video.getMap("customVideoEncodeSize").getInt("width")
                    , video.getMap("customVideoEncodeSize").getInt("height"));
        }

        StreamingProfile.AudioProfile aProfile = new StreamingProfile.AudioProfile(audio.getInt("rate"),
                audio.getInt("bitrate")); // audio sample rate, audio bitrate
        StreamingProfile.VideoProfile vProfile = new StreamingProfile.VideoProfile(video.getInt("fps"),
                video.getInt("bps"), video.getInt("maxFrameInterval"), getH264Profile(h264Profile));// fps bps
        // maxFrameInterval
        StreamingProfile.AVProfile avProfile = new StreamingProfile.AVProfile(vProfile, aProfile);

        mProfile = new StreamingProfile();
        mProfile.setEncodingSizeLevel(encodingSize).setAVProfile(avProfile)
                .setQuicEnable(isQuicEnable)
                .setEncoderRCMode(encoderRCMode == 0 ? StreamingProfile.EncoderRCModes.QUALITY_PRIORITY
                        : StreamingProfile.EncoderRCModes.BITRATE_PRIORITY)
                .setDnsManager(Utils.getMyDnsManager(mReactContext))
                .setStreamStatusConfig(new StreamingProfile.StreamStatusConfig(streamStatusConfig))
                .setEncodingOrientation(encodeOrientation == 0 ? StreamingProfile.ENCODING_ORIENTATION.PORT
                        : StreamingProfile.ENCODING_ORIENTATION.LAND)
                .setSendingBufferProfile(new StreamingProfile.SendingBufferProfile(0.2f, 0.8f, 3.0f, 20 * 1000))
                .setPictureStreamingFps(10);
        if (mPublishUrl != null) {
            try {
                mProfile.setPublishUrl(mPublishUrl);
            } catch (URISyntaxException e) {
                e.printStackTrace();
            }
        }
        if (mPictureStreamingFile != null) {
            mProfile.setPictureStreamingFilePath(mPictureStreamingFile);
        }
        if (customVideoEncodeSize != null && customVideoEncodeSize.x != 0 && customVideoEncodeSize.y != 0) {
            mProfile.setPreferredVideoEncodingSize(customVideoEncodeSize.x, customVideoEncodeSize.y);
        }

        if (!isAudioStreamingOnly(avCodecType)) {
            mCameraStreamingSetting = new CameraStreamingSetting();
            mCameraStreamingSetting.setCameraId(mCameraId.ordinal())
                    .setContinuousFocusModeEnabled(true)
                    .setRecordingHint(false)
                    .setResetTouchFocusDelayInMs(3000)
                    .setBuiltInFaceBeautyEnabled(true)
                    .setVideoFilter(mCurrentVideoFilterType)
                    .setFocusMode(focusMode == 0 ? CameraStreamingSetting.FOCUS_MODE_AUTO
                            : (focusMode == 1 ? CameraStreamingSetting.FOCUS_MODE_CONTINUOUS_PICTURE
                            : CameraStreamingSetting.FOCUS_MODE_CONTINUOUS_VIDEO))
                    .setCameraPrvSizeLevel(previewSize <= 1 ? CameraStreamingSetting.PREVIEW_SIZE_LEVEL.SMALL
                            : (previewSize <= 3 ? CameraStreamingSetting.PREVIEW_SIZE_LEVEL.MEDIUM
                            : CameraStreamingSetting.PREVIEW_SIZE_LEVEL.LARGE))
                    .setCameraPrvSizeRatio((previewSize == 0 || previewSize == 2 || previewSize == 4)
                            ? CameraStreamingSetting.PREVIEW_SIZE_RATIO.RATIO_4_3
                            : CameraStreamingSetting.PREVIEW_SIZE_RATIO.RATIO_16_9);
            if (mFaceBeautySetting != null) {
                mCameraStreamingSetting.setFaceBeautySetting(mFaceBeautySetting);
            }
        }

        MicrophoneStreamingSetting microphoneStreamingSetting = new MicrophoneStreamingSetting();
        microphoneStreamingSetting.setSampleRate(sampleRate)
                .setAECEnabled(isAecEnable);
        if (channel == 1) {
            microphoneStreamingSetting.setChannelConfig(AudioFormat.CHANNEL_IN_STEREO);
        }

        mMediaStreamingManager = new MediaStreamingManager(mReactContext, mCameraPreviewFrameView, avCodecType);
        mMediaStreamingManager.prepare(mCameraStreamingSetting, microphoneStreamingSetting, mWatermarkSetting,
                mProfile);
        mMediaStreamingManager.setAutoRefreshOverlay(true);

        mMediaStreamingManager.setStreamingSessionListener(this);
        mMediaStreamingManager.setStreamingStateListener(this);
        mMediaStreamingManager.setStreamStatusCallback(this);
    }

    @ReactProp(name = "rtmpURL")
    public void setPublishUrl(CameraPreviewFrameView view, String url) {
        Log.i(TAG, "setPublishUrl : " + url);
        if (mProfile == null || mMediaStreamingManager == null) {
            mPublishUrl = url;
            return;
        }
        try {
            mProfile.setPublishUrl(url);
            mMediaStreamingManager.setStreamingProfile(mProfile);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    @ReactProp(name = "camera")
    public void setCameraId(CameraPreviewFrameView view, String cameraId) {
        Log.i(TAG, "setCameraId : " + cameraId);
        if ("front".equals(cameraId)) {
            mCameraId = CameraStreamingSetting.CAMERA_FACING_ID.CAMERA_FACING_FRONT;
        } else if ("back".equals(cameraId)) {
            mCameraId = CameraStreamingSetting.CAMERA_FACING_ID.CAMERA_FACING_BACK;
        } else {
            mCameraId = CameraStreamingSetting.CAMERA_FACING_ID.CAMERA_FACING_3RD;
        }
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.switchCamera(mCameraId);
        }
    }

    @ReactProp(name = "muted", defaultBoolean = false)
    public void setMuted(CameraPreviewFrameView view, boolean muted) {
        Log.i(TAG, "setMuted : " + muted);
        mIsMuted = muted;
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.mute(muted);
        }

    }

    @ReactProp(name = "zoom")
    public void setZoom(CameraPreviewFrameView view, int zoom) {
        Log.i(TAG, "setZoom : " + zoom);
        mCurrentZoom = Math.min(zoom, mMaxZoom);
        mCurrentZoom = Math.max(0, mCurrentZoom);
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.setZoomValue(mCurrentZoom);
        }
    }

    @ReactProp(name = "focus")
    public void setFocus(CameraPreviewFrameView view, boolean focus) {
        Log.i(TAG, "setFocus : " + focus);
        mIsFocus = focus;
    }

    @ReactProp(name = "started", defaultBoolean = false)
    public void setStarted(CameraPreviewFrameView view, boolean started) {
        Log.i(TAG, "setStarted : " + started);
        mIsStarted = started;
        if (mMediaStreamingManager == null) {
            return;
        }
        if (mIsStarted) {
            startStreaming();
        } else {
            mMediaStreamingManager.stopStreaming();
        }
    }

    @ReactProp(name = "faceBeautyEnable", defaultBoolean = false)
    public void setFaceBeautyOn(CameraPreviewFrameView view, boolean faceBeautyEnable) {
        Log.i(TAG, "setFaceBeautyOn : " + faceBeautyEnable);
        mCurrentVideoFilterType = faceBeautyEnable ? CameraStreamingSetting.VIDEO_FILTER_TYPE.VIDEO_FILTER_BEAUTY
                : CameraStreamingSetting.VIDEO_FILTER_TYPE.VIDEO_FILTER_NONE;
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.setVideoFilterType(mCurrentVideoFilterType);
        }
    }

    @ReactProp(name = "faceBeautySetting")
    public void updateFaceBeautySetting(CameraPreviewFrameView view, ReadableMap faceBeautySetting) {
        Log.i(TAG, "updateFaceBeautySetting");
        if (mFaceBeautySetting == null) {
            mFaceBeautySetting = new CameraStreamingSetting.FaceBeautySetting(1.0f, 1.0f, 0.8f);
        }
        mFaceBeautySetting.beautyLevel = (float) faceBeautySetting.getDouble("beautyLevel");
        mFaceBeautySetting.whiten = (float) faceBeautySetting.getDouble("whiten");
        mFaceBeautySetting.redden = (float) faceBeautySetting.getDouble("redden");
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.updateFaceBeautySetting(mFaceBeautySetting);
        }
    }

    /**
     * 添加水印
     *
     * @param view             视图实例
     * @param watermarkSetting 水印配置
     */
    @ReactProp(name = "watermarkSetting")
    public void updateWatermarkSetting(CameraPreviewFrameView view, ReadableMap watermarkSetting) {
        Log.i(TAG, "updateWatermarkSetting");
        String filePath = watermarkSetting.getString("src");
        int alpha = watermarkSetting.getInt("alpha");
        ReadableMap customPos = watermarkSetting.getMap("position");
        ReadableMap customSize = watermarkSetting.getMap("size");

        if (alpha < 0) {
            alpha = 0;
        } else if (alpha > 255) {
            alpha = 255;
        }
        float customX = (float) customPos.getDouble("x");
        if (customX < 0) {
            customX = 0;
        } else if (customX > 1.0f) {
            customX = 1.0f;
        }
        float customY = (float) customPos.getDouble("y");
        if (customY < 0) {
            customY = 0;
        } else if (customY > 1.0f) {
            customY = 1.0f;
        }

        if (filePath == null) {
            mWatermarkSetting = null;
        } else {
            if (mWatermarkSetting == null) {
                mWatermarkSetting = new WatermarkSetting(mReactContext);
            }
            mWatermarkSetting.setResourcePath(filePath).setAlpha(alpha)
                    .setCustomPosition(customX, customY);

            int customWidth = customSize.getInt("width");
            int customHeight = customSize.getInt("height");
            if (customWidth > 0 && customHeight > 0) {
                mWatermarkSetting.setCustomSize(customWidth, customHeight);
            }
        }
        // TODO : Android 支持配置 bitmap、res drawable、file path
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.updateWatermarkSetting(mWatermarkSetting);
        }
    }

    @ReactProp(name = "pictureStreamingFile")
    public void setPictureStreamingFile(CameraPreviewFrameView view, String pictureStreamingFile) {
        Log.i(TAG, "setPictureStreamingFile : " + pictureStreamingFile);
        mPictureStreamingFile = pictureStreamingFile;
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.setPictureStreamingFilePath(pictureStreamingFile);
        }
    }

    @ReactProp(name = "pictureStreamingEnable")
    public void togglePictureStreaming(CameraPreviewFrameView view, boolean pictureStreamingEnable) {
        Log.i(TAG, "togglePictureStreaming : " + pictureStreamingEnable);
        // TODO : StreamingProfile 中设置图片路径
        mIsPictureStreamingEnabled = pictureStreamingEnable;
        if (mMediaStreamingManager == null) {
            return;
        }
        if ((mIsPictureStreamingEnabled && !mMediaStreamingManager.isPictureStreaming())
                || (!mIsPictureStreamingEnabled && mMediaStreamingManager.isPictureStreaming())) {
            mMediaStreamingManager.togglePictureStreaming();
        }
    }

    @ReactProp(name = "torchEnable")
    public void enableTorch(CameraPreviewFrameView view, boolean torchEnable) {
        Log.i(TAG, "enableTorch : " + torchEnable);
        mIsTorchEnable = torchEnable;
        if (mMediaStreamingManager == null) {
            return;
        }
        if (torchEnable) {
            mMediaStreamingManager.turnLightOn();
        } else {
            mMediaStreamingManager.turnLightOff();
        }
    }

    @ReactProp(name = "previewMirrorEnable")
    public void setPreviewMirror(CameraPreviewFrameView view, boolean previewMirrorEnable) {
        Log.i(TAG, "setPreviewMirror : " + previewMirrorEnable);
        mIsPreviewMirror = previewMirrorEnable;
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.setPreviewMirror(previewMirrorEnable);
        }
    }

    @ReactProp(name = "encodingMirrorEnable")
    public void setEncodingMirror(CameraPreviewFrameView view, boolean encodingMirrorEnable) {
        Log.i(TAG, "setEncodingMirror : " + encodingMirrorEnable);
        mIsEncodeMirror = encodingMirrorEnable;
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.setEncodingMirror(encodingMirrorEnable);
        }
    }

    @ReactProp(name = "playbackEnable")
    public void togglePlayback(CameraPreviewFrameView view, boolean playbackEnable) {
        Log.i(TAG, "togglePlayback : " + playbackEnable);
        mIsPlaybackEnable = playbackEnable;
        if (mMediaStreamingManager == null) {
            return;
        }
        if (mIsPlaybackEnable) {
            mMediaStreamingManager.startPlayback();
        } else {
            mMediaStreamingManager.stopPlayback();
        }
    }

    @ReactProp(name = "audioMixFile")
    public void setAudioMixFile(CameraPreviewFrameView view, ReadableMap audioMixFile) {
        Log.i(TAG, "file = " + audioMixFile.getString("filePath") + " loop = " + audioMixFile.getBoolean("loop"));
        mAudioMixFile = audioMixFile.getString("filePath");
        mIsAudioMixLooping = audioMixFile.getBoolean("loop");
        if (mMediaStreamingManager == null || (mAudioMixFile == null && mAudioMixer == null)) {
            return;
        }
        try {
            if (mAudioMixer == null) {
                initAudioMixer();
            }
            if (mAudioMixFile == null) {
                mAudioMixer.stop();
            } else {
                mAudioMixer.setFile(mAudioMixFile, mIsAudioMixLooping);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @ReactProp(name = "audioMixVolume")
    public void setAudioMixVolume(CameraPreviewFrameView view, ReadableMap audioMixVolume) {
        mMicVolume = (float) audioMixVolume.getDouble("micVolume");
        mMusicVolume = (float) audioMixVolume.getDouble("musicVolume");
        Log.i(TAG, "setAudioMixVolume : " + mMicVolume + " " + mMusicVolume);
        if (mAudioMixer != null) {
            mAudioMixer.setVolume(mMicVolume, mMusicVolume);
        }
    }

    @ReactProp(name = "playMixAudio")
    public void playMixAudio(CameraPreviewFrameView view, boolean playMixAudio) {
        Log.i(TAG, "playMixAudio : " + playMixAudio);
        mIsMixAudioPlaying = playMixAudio;
        if (mAudioMixer != null) {
            if (playMixAudio && !mAudioMixer.isRunning()) {
                mAudioMixer.play();
            } else if (!playMixAudio && mAudioMixer.isRunning()) {
                mAudioMixer.pause();
            }
        }
    }

    @Override
    public void onHostResume() {
        Log.i(TAG, "onHostResume");
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.resume();
        }
    }

    @Override
    public void onHostPause() {
        Log.i(TAG, "onHostPause");
        mMediaStreamingManager.pause();
    }

    @Override
    public void onHostDestroy() {
        Log.i(TAG, "onHostDestroy");
        mMediaStreamingManager.destroy();
        mMediaStreamingManager = null;
        mProfile = null;
    }

    @Override
    public boolean onSingleTapUp(MotionEvent e) {
        if (mIsReady && mIsFocus) {
            try {
                mMediaStreamingManager.doSingleTapUp((int) e.getX(), (int) e.getY());
            } catch (Exception ex) {
                Log.e(TAG, ex.getMessage());
            }
            return true;
        }
        return false;
    }

    @Override
    public boolean onZoomValueChanged(float factor) {
        return false;
    }

    @Override
    public boolean onRecordAudioFailedHandled(int i) {
        return false;
    }

    @Override
    public boolean onRestartStreamingHandled(int code) {
        startStreaming();
        return true;
    }

    @Override
    public Camera.Size onPreviewSizeSelected(List<Camera.Size> list) {
        return null;
    }

    @Override
    public int onPreviewFpsSelected(List<int[]> list) {
        return 0;
    }

    @Override
    public void notifyStreamStatusChanged(StreamingProfile.StreamStatus streamStatus) {
        WritableMap event = Arguments.createMap();
        event.putInt("videoFPS", streamStatus.videoFps);
        event.putInt("audioFPS", streamStatus.audioFps);
        event.putInt("totalBitrate", streamStatus.totalAVBitrate);
        mEventEmitter.receiveEvent(getTargetId(), Events.STREAM_INFO_CHANGE.toString(), event);
    }

    @Override
    public void onStateChanged(StreamingState streamingState, Object extra) {
        Log.i(TAG, "onStateChanged : " + streamingState.name());
        WritableMap event = Arguments.createMap();
        switch (streamingState) {
            case PREPARING:
                break;
            case READY:
                mIsReady = true;
                event.putInt(STATE, Events.READY.ordinal());
                mEventEmitter.receiveEvent(getTargetId(), Events.READY.toString(), event);
                mMaxZoom = mMediaStreamingManager.getMaxZoom();
                if (mMediaStreamingManager.getZoom() != mCurrentZoom) {
                    mMediaStreamingManager.setZoomValue(mCurrentZoom);
                }
                if (mAudioMixFile != null && mAudioMixer == null) {
                    initAudioMixer();
                    try {
                        mAudioMixer.setFile(mAudioMixFile, mIsAudioMixLooping);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                if (mIsMixAudioPlaying && mAudioMixer != null) {
                    mAudioMixer.setVolume(mMicVolume, mMusicVolume);
                    mAudioMixer.play();
                }
                if (mIsPlaybackEnable) {
                    mMediaStreamingManager.startPlayback();
                }
                if (mIsStarted) {
                    startStreaming();
                }
                if (mIsPictureStreamingEnabled && !mMediaStreamingManager.isPictureStreaming()) {
                    mMediaStreamingManager.togglePictureStreaming();
                }
                mMediaStreamingManager.setPreviewMirror(mIsPreviewMirror);
                mMediaStreamingManager.setEncodingMirror(mIsEncodeMirror);
                mMediaStreamingManager.mute(mIsMuted);
                if (mIsTorchEnable) {
                    mMediaStreamingManager.turnLightOn();
                }
                break;
            case CONNECTING:
                event.putInt(STATE, Events.CONNECTING.ordinal());
                mEventEmitter.receiveEvent(getTargetId(), Events.CONNECTING.toString(), event);
                break;
            case STREAMING:
                event.putInt(STATE, Events.STREAMING.ordinal());
                mEventEmitter.receiveEvent(getTargetId(), Events.STREAMING.toString(), event);
                break;
            case SHUTDOWN:
                event.putInt(STATE, Events.SHUTDOWN.ordinal());
                mEventEmitter.receiveEvent(getTargetId(), Events.SHUTDOWN.toString(), event);
                break;
            case IOERROR:
                event.putInt(STATE, Events.IOERROR.ordinal());
                mEventEmitter.receiveEvent(getTargetId(), Events.IOERROR.toString(), event);
                break;
            case DISCONNECTED:
                event.putInt(STATE, Events.DISCONNECTED.ordinal());
                mEventEmitter.receiveEvent(getTargetId(), Events.DISCONNECTED.toString(), event);
                break;
        }
    }

    private int getTargetId() {
        return mCameraPreviewFrameView.getId();
    }

    private void startStreaming() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                mMediaStreamingManager.startStreaming();
            }
        }).start();
    }

    private AVCodecType getAvCodecType(int codecType) {
        AVCodecType avCodecType;
        switch (codecType) {
            case 2:
                avCodecType = AVCodecType.SW_VIDEO_WITH_HW_AUDIO_CODEC;
                break;
            case 3:
                avCodecType = AVCodecType.SW_VIDEO_WITH_HW_AUDIO_CODEC;
                break;
            case 4:
                avCodecType = AVCodecType.HW_VIDEO_SURFACE_AS_INPUT_WITH_HW_AUDIO_CODEC;
                break;
            case 5:
                avCodecType = AVCodecType.HW_VIDEO_SURFACE_AS_INPUT_WITH_SW_AUDIO_CODEC;
                break;
            case 6:
                avCodecType = AVCodecType.HW_VIDEO_YUV_AS_INPUT_WITH_HW_AUDIO_CODEC;
                break;
            case 7:
                avCodecType = AVCodecType.HW_VIDEO_CODEC;
                break;
            case 8:
                avCodecType = AVCodecType.SW_VIDEO_CODEC;
                break;
            case 9:
                avCodecType = AVCodecType.HW_AUDIO_CODEC;
                break;
            case 10:
                avCodecType = AVCodecType.SW_AUDIO_CODEC;
                break;
            default:
                avCodecType = AVCodecType.HW_VIDEO_SURFACE_AS_INPUT_WITH_HW_AUDIO_CODEC;
                break;
        }
        return avCodecType;
    }

    private StreamingProfile.H264Profile getH264Profile(int h264Profile) {
        if (h264Profile == 0) {
            return StreamingProfile.H264Profile.BASELINE;
        }
        return h264Profile == 1 ? StreamingProfile.H264Profile.MAIN : StreamingProfile.H264Profile.HIGH;
    }

    private boolean isAudioStreamingOnly(AVCodecType codecType) {
        return codecType == AVCodecType.HW_AUDIO_CODEC || codecType == AVCodecType.SW_AUDIO_CODEC;
    }

    private void initAudioMixer() {
        mAudioMixer = mMediaStreamingManager.getAudioMixer();
        mAudioMixer.setOnAudioMixListener(new OnAudioMixListener() {
            @Override
            public void onStatusChanged(MixStatus mixStatus) {
                if (mixStatus == MixStatus.Finish) {
                    mIsAudioMixFinished = true;
                }
            }

            @Override
            public void onProgress(long progress, long duration) {
                WritableMap event = Arguments.createMap();
                event.putInt("progress", (int) progress);
                event.putInt("duration", (int) duration);
                event.putBoolean("finished", mIsAudioMixFinished);
                mEventEmitter.receiveEvent(getTargetId(), Events.AUDIO_MIX_INFO.toString(), event);
            }
        });
    }
}
