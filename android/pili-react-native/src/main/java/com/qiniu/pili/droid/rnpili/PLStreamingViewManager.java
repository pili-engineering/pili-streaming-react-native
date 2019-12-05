package com.qiniu.pili.droid.rnpili;

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
import com.qiniu.android.dns.DnsManager;
import com.qiniu.android.dns.IResolver;
import com.qiniu.android.dns.NetworkInfo;
import com.qiniu.android.dns.http.DnspodFree;
import com.qiniu.android.dns.local.AndroidDnsServer;
import com.qiniu.android.dns.local.Resolver;
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

import java.io.IOException;
import java.net.InetAddress;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class PLStreamingViewManager extends SimpleViewManager<CameraPreviewFrameView>  implements
        CameraPreviewFrameView.Listener,
        StreamingSessionListener,
        StreamingStateChangedListener,
        StreamStatusCallback,
        LifecycleEventListener {
    private static final String TAG = "PLStreamingViewManager";
    private static final String EXPORT_COMPONENT_NAME = "PLRNMediaStreaming";

    private static final String STATE = "state";

    private ThemedReactContext mReactContext;
    private RCTEventEmitter mEventEmitter;

    private MediaStreamingManager mMediaStreamingManager;
    private CameraPreviewFrameView mCameraPreviewFrameView;
    private StreamingProfile mProfile;
    private CameraStreamingSetting mCameraStreamingSetting;

    private boolean mIsFocus = false;
    private boolean mIsStarted = true;//default start attach on parent view
    private boolean mIsReady;

    private int mCurrentZoom = 0;
    private int mMaxZoom = 0;

    public enum Events {
        READY,
        CONNECTING,
        STREAMING,
        SHUTDOWN,
        IOERROR,
        DISCONNECTED,
        STREAM_INFO_CHANGE;
    }

    @NonNull
    @Override
    public String getName() {
        return EXPORT_COMPONENT_NAME;
    }

    @NonNull
    @Override
    protected CameraPreviewFrameView createViewInstance(@NonNull ThemedReactContext reactContext) {
        StreamingEnv.init(reactContext);

        mReactContext = reactContext;
        mEventEmitter = mReactContext.getJSModule(RCTEventEmitter.class);

        mCameraPreviewFrameView = new CameraPreviewFrameView(mReactContext);
        mCameraPreviewFrameView.setListener(this);
        mCameraPreviewFrameView.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        initStreamingManager(mCameraPreviewFrameView);
        mReactContext.addLifecycleEventListener(this);
        return mCameraPreviewFrameView;
    }

    @Nullable
    @Override
    public Map getExportedCustomBubblingEventTypeConstants() {
        return MapBuilder.builder()
                .put(Events.READY.toString(),
                        MapBuilder.of(
                                "phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.CONNECTING.toString(),
                        MapBuilder.of(
                                "phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.STREAMING.toString(),
                        MapBuilder.of(
                                "phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.SHUTDOWN.toString(),
                        MapBuilder.of(
                                "phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.IOERROR.toString(),
                        MapBuilder.of(
                                "phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.DISCONNECTED.toString(),
                        MapBuilder.of(
                                "phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onStateChange")))
                .put(Events.STREAM_INFO_CHANGE.toString(),
                        MapBuilder.of(
                                "phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onStreamInfoChange")))
                .build();
    }

    @ReactProp(name = "profile")
    public void setStreamingProfile(CameraPreviewFrameView view, @Nullable ReadableMap profile) {
        ReadableMap video = profile.getMap("video");
        ReadableMap audio = profile.getMap("audio");
        int encodingSize = profile.getInt("encodingSize");

        StreamingProfile.AudioProfile aProfile =
                new StreamingProfile.AudioProfile(audio.getInt("rate"), audio.getInt("bitrate")); //audio sample rate, audio bitrate
        StreamingProfile.VideoProfile vProfile =
                new StreamingProfile.VideoProfile(video.getInt("fps"), video.getInt("bps"), video.getInt("maxFrameInterval"));//fps bps maxFrameInterval
        StreamingProfile.AVProfile avProfile = new StreamingProfile.AVProfile(vProfile, aProfile);
        mProfile.setAVProfile(avProfile);
        mProfile.setEncodingSizeLevel(encodingSize);
        mMediaStreamingManager.setStreamingProfile(mProfile);
    }

    @ReactProp(name = "rtmpURL")
    public void setPublishUrl(CameraPreviewFrameView view, String url) {
        try {
            mProfile.setPublishUrl(url);
            mMediaStreamingManager.setStreamingProfile(mProfile);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    @ReactProp(name = "camera")
    public void setCameraId(CameraPreviewFrameView view, String cameraId) {
        CameraStreamingSetting.CAMERA_FACING_ID facingId;
        if ("front".equals(cameraId)) {
            facingId = CameraStreamingSetting.CAMERA_FACING_ID.CAMERA_FACING_FRONT;
        } else if ("back".equals(cameraId)) {
            facingId = CameraStreamingSetting.CAMERA_FACING_ID.CAMERA_FACING_BACK;
        } else {
            facingId = CameraStreamingSetting.CAMERA_FACING_ID.CAMERA_FACING_3RD;
        }
        mMediaStreamingManager.switchCamera(facingId);
    }

    @ReactProp(name = "muted", defaultBoolean = false)
    public void setMuted(CameraPreviewFrameView view, boolean muted) {
        mMediaStreamingManager.mute(muted);
    }

    @ReactProp(name = "zoom")
    public void setZoom(CameraPreviewFrameView view, int zoom) {
        mCurrentZoom = Math.min(zoom, mMaxZoom);
        mCurrentZoom = Math.max(0, mCurrentZoom);
        mMediaStreamingManager.setZoomValue(mCurrentZoom);
    }

    @ReactProp(name = "focus")
    public void setFocus(CameraPreviewFrameView view, boolean focus) {
        mIsFocus = focus;
    }

    @ReactProp(name = "started", defaultBoolean = false)
    public void setStarted(CameraPreviewFrameView view, boolean started) {
        if (mIsStarted == started) {
            return;
        }
        mIsStarted = started;
        if (mIsReady) {
            if (mIsStarted) {
                startStreaming();
            } else {
                mMediaStreamingManager.stopStreaming();
            }
        }
    }

    @Override
    public void onHostResume() {
        if (mMediaStreamingManager != null) {
            mMediaStreamingManager.resume();
        }
    }

    @Override
    public void onHostPause() {
        mMediaStreamingManager.pause();
    }

    @Override
    public void onHostDestroy() {
        mMediaStreamingManager.destroy();
        mMediaStreamingManager = null;
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
        WritableMap event = Arguments.createMap();
        switch (streamingState) {
            case PREPARING:
                break;
            case READY:
                mIsReady = true;
                mMaxZoom = mMediaStreamingManager.getMaxZoom();
                if (mIsStarted) {
                    startStreaming();
                }
                event.putInt(STATE, Events.READY.ordinal());
                mEventEmitter.receiveEvent(getTargetId(), Events.READY.toString(), event);
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

    private void initStreamingManager(CameraPreviewFrameView cameraPreviewFrameView) {
        if (mMediaStreamingManager == null) {
            mMediaStreamingManager = new MediaStreamingManager(mReactContext, cameraPreviewFrameView, AVCodecType.SW_VIDEO_WITH_SW_AUDIO_CODEC);

            mProfile = new StreamingProfile();
            StreamingProfile.AudioProfile aProfile = new StreamingProfile.AudioProfile(44100, 96 * 1024); //audio sample rate, audio bitrate
            StreamingProfile.VideoProfile vProfile = new StreamingProfile.VideoProfile(30, 1000 * 1024, 48);//fps bps maxFrameInterval
            StreamingProfile.AVProfile avProfile = new StreamingProfile.AVProfile(vProfile, aProfile);
            mProfile.setVideoQuality(StreamingProfile.VIDEO_QUALITY_HIGH3)
                    .setAudioQuality(StreamingProfile.AUDIO_QUALITY_MEDIUM2)
                    .setEncodingSizeLevel(StreamingProfile.VIDEO_ENCODING_HEIGHT_480)
                    .setEncoderRCMode(StreamingProfile.EncoderRCModes.QUALITY_PRIORITY)
                    .setAVProfile(avProfile)
                    .setDnsManager(getMyDnsManager())
                    .setStreamStatusConfig(new StreamingProfile.StreamStatusConfig(3))
                    .setEncodingOrientation(StreamingProfile.ENCODING_ORIENTATION.PORT)
                    .setSendingBufferProfile(new StreamingProfile.SendingBufferProfile(0.2f, 0.8f, 3.0f, 20 * 1000));

            mCameraStreamingSetting = new CameraStreamingSetting();
            mCameraStreamingSetting.setCameraId(Camera.CameraInfo.CAMERA_FACING_BACK)
                    .setContinuousFocusModeEnabled(true)
                    .setRecordingHint(false)
                    .setResetTouchFocusDelayInMs(3000)
                    .setFocusMode(CameraStreamingSetting.FOCUS_MODE_CONTINUOUS_VIDEO)
                    .setCameraPrvSizeLevel(CameraStreamingSetting.PREVIEW_SIZE_LEVEL.MEDIUM)
                    .setCameraPrvSizeRatio(CameraStreamingSetting.PREVIEW_SIZE_RATIO.RATIO_16_9);

            MicrophoneStreamingSetting microphoneStreamingSetting = new MicrophoneStreamingSetting();
            microphoneStreamingSetting.setChannelConfig(AudioFormat.CHANNEL_IN_STEREO);

            mMediaStreamingManager.prepare(mCameraStreamingSetting, microphoneStreamingSetting, mProfile);
            mMediaStreamingManager.setAutoRefreshOverlay(true);

            mMediaStreamingManager.setStreamingSessionListener(this);
            mMediaStreamingManager.setStreamingStateListener(this);
            mMediaStreamingManager.setStreamStatusCallback(this);
        }
    }

    private void startStreaming() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                mMediaStreamingManager.startStreaming();
            }
        }).start();
    }

    private DnsManager getMyDnsManager() {
        IResolver r0 = new DnspodFree();
        IResolver r1 = AndroidDnsServer.defaultResolver();
        IResolver r2 = null;
        try {
            r2 = new Resolver(InetAddress.getByName("119.29.29.29"));
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        return new DnsManager(NetworkInfo.normal, new IResolver[]{r0, r1, r2});
    }
}
