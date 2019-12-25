//
//  PLRNStreaming.m
//  pili_react_native
//
//  Created by 何云旗 on 2019/12/3.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "PLRNStreaming.h"
#import <React/RCTBridgeModule.h>
#import <React/UIView+React.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTComponent.h>
#import <AssetsLibrary/AssetsLibrary.h>

typedef NS_ENUM(NSUInteger, PLRNStreamState) {
  
  PLRNStreamStateReady = 0,
  
  PLRNStreamStateConnecting,
  
  PLRNStreamStateStreaming,
  
  PLRNStreamStateShutdown,
  
  PLRNStreamStateError,
  
  PLRNStreamStateDisconnected,
};

@interface PLRNStreaming()

@property (nonatomic, copy) RCTDirectEventBlock onStateChange;
@property (nonatomic, copy) RCTDirectEventBlock onStreamInfoChange;
@property (nonatomic, copy) RCTDirectEventBlock onAudioMixProgress;
@property (nonatomic, strong) PLAudioPlayer *audioPlayer;

@end

@implementation PLRNStreaming{
//  RCTEventDispatcher *_eventDispatcher;
  BOOL _started;
  BOOL _muted;
  BOOL _focus;
  NSString *_camera;
  BOOL _faceBeautyEnable;
  NSDictionary *_faceBeautySetting;
  NSDictionary *_watermarkSetting;
  BOOL _pictureStreamingEnable;
  NSString * _pictureStreamingFile;
  BOOL _torchEnable;
  BOOL _previewMirrorEnable;
  BOOL _encodingMirrorEnable;
  NSDictionary *_audioMixFile;
  BOOL _playMixAudio;
  NSDictionary * _audioMixVolume;
  BOOL _playbackEnable;
  BOOL _isPlayerFinish;
}

const char *stateNames[] = {
  "Unknow",
  "Connecting",
  "Connected",
  "Disconnecting",
  "Disconnected",
  "Error"
};


const char *networkStatus[] = {
  "Not Reachable",
  "Reachable via WiFi",
  "Reachable via CELL"
};

- (instancetype)init
{
  if ((self = [super init])) {
    [PLStreamingEnv initEnv];
    _started = YES;
    _muted = NO;
    _focus = NO;
    _isPlayerFinish = NO;
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleInterruption:)
                                                 name:AVAudioSessionInterruptionNotification
                                               object:[AVAudioSession sharedInstance]];
    CGSize videoSize = CGSizeMake(480 , 640);
    UIDeviceOrientation orientation = [[UIDevice currentDevice] orientation];
    if (orientation <= AVCaptureVideoOrientationLandscapeLeft) {
      if (orientation > AVCaptureVideoOrientationPortraitUpsideDown) {
        videoSize = CGSizeMake(640 , 480);
      }
    }
  }
  
  return self;
};

- (void)setRtmpURL:(NSString *)rtmpURL
{
  _rtmpURL = rtmpURL;
  [self setSourceAndProfile];
}

- (void)setProfile:(NSDictionary *)profile{
  _profile = profile;
  [self setSourceAndProfile];
}

- (void) setSourceAndProfile{
    if(self.profile && self.rtmpURL){
    
        NSDictionary *videoCapture = self.profile[@"cameraStreamingSetting"];
        NSDictionary *audioCapture = self.profile[@"microphoneSteamingSetting"];
        NSDictionary *videoStream = self.profile[@"videoStreamingSetting"];
        NSDictionary *audioStream = self.profile[@"audioStreamingSetting"];
    
        //cameraSetting
        int presetVideo = [videoCapture[@"resolution"] intValue];
        int cameraId = [videoCapture[@"cameraId"] intValue];
        int videoOrientation = [videoCapture[@"videoOrientation"] intValue];
      
        //MicrophoneSteamingSetting
        int channelsPerFrame = [audioCapture[@"channel"] intValue] +1;
        BOOL acousticEchoCancellationEnable = [audioCapture[@"isAecEnable"] boolValue];
      
        //videoStreamingSetting
        int fps = [videoStream[@"fps"] intValue];
        int bps = [videoStream[@"bps"] intValue];
        int maxFrameInterval = [videoStream[@"maxFrameInterval"] intValue];
        double height = [videoStream[@"customVideoEncodeSize"][@"height"] intValue];
        double width = [videoStream[@"customVideoEncodeSize"][@"width"] intValue];
        int h264Profile = [videoStream[@"h264Profile"] intValue];
        int avCodecType = [self.profile[@"avCodecType"] intValue];
      
        //audioStreamingSetting
        int audioRate = [audioStream[@"rate"] intValue];
        int audioBps = [audioStream[@"bitrate"] intValue];
        
        BOOL quicEnable = [self.profile[@"quicEnable"] boolValue];
        BOOL autoBitrateAdjustMode = NO;
        if ([self.profile[@"bitrateAdjustMode"] intValue] == 0) {
            autoBitrateAdjustMode = YES;
        }
        NSUInteger minVideoBitRate = [self.profile[@"adaptiveBitrateRange"][@"minBitrate"] unsignedIntegerValue];
        int streamStatusConfig = [self.profile[@"streamInfoUpdateInterval"] intValue];
    
    //TODO videoProfileLevel 需要通过 分辨率 选择
    
        PLVideoStreamingConfiguration *videoStreamingConfiguration = [[PLVideoStreamingConfiguration alloc] initWithVideoSize:CGSizeMake(width, height) expectedSourceVideoFrameRate:fps videoMaxKeyframeInterval:maxFrameInterval averageVideoBitRate:bps videoProfileLevel:[self getH264Profile:h264Profile] videoEncoderType:avCodecType];
    
        PLVideoCaptureConfiguration *videoCaptureConfiguration = [PLVideoCaptureConfiguration defaultConfiguration];
        videoCaptureConfiguration.sessionPreset = [self getPresetVideo:presetVideo];
        videoCaptureConfiguration.position = cameraId+1;
        videoCaptureConfiguration.videoOrientation = videoOrientation;
    
        PLAudioCaptureConfiguration *audioCaptureConfiguration = [PLAudioCaptureConfiguration defaultConfiguration];
      audioCaptureConfiguration.channelsPerFrame = channelsPerFrame;
      audioCaptureConfiguration.acousticEchoCancellationEnable = acousticEchoCancellationEnable;
        // 音频编码配置
        PLAudioStreamingConfiguration *audioStreamingConfiguration = [[PLAudioStreamingConfiguration alloc] initWithEncodedAudioSampleRate:audioRate encodedNumberOfChannels:1 audioBitRate:audioBps];
      
        // 推流 session
        self.session = [[PLMediaStreamingSession alloc] initWithVideoCaptureConfiguration:videoCaptureConfiguration audioCaptureConfiguration:audioCaptureConfiguration videoStreamingConfiguration:videoStreamingConfiguration audioStreamingConfiguration:audioStreamingConfiguration stream:nil];
        self.session.delegate = self;
    
        //            UIImage *waterMark = [UIImage imageNamed:@"qiniu.png"];
        //            PLFilterHandler handler = [self.session addWaterMark:waterMark origin:CGPointMake(100, 300)];
        //            self.filterHandlers = [@[handler] mutableCopy];//TODO -  水印暂时注释
    
        [self.session setMonitorNetworkStateEnable:YES];
        self.session.statusUpdateInterval = streamStatusConfig;
        self.session.quicEnable = quicEnable;
        if (autoBitrateAdjustMode) {
          [self.session   enableAdaptiveBitrateControlWithMinVideoBitRate:minVideoBitRate];
        }
        self.session.connectionChangeActionCallback = ^(PLNetworkStateTransition transition) {
            switch (transition) {
                case PLNetworkStateTransitionWiFiToWWAN:
                    NSLog(@"允许WiFi->4G重启推流");
                    return YES;
                case PLNetworkStateTransitionWWANToWiFi:
                    NSLog(@"允许4G->WiFi重启推流");
                    return YES;
                case PLNetworkStateTransitionWiFiToUnconnected:
                    return NO;
                case PLNetworkStateTransitionWWANToUnconnected:
                    return NO;
                default:
                    break;
            }
            return YES;
        };
    
        dispatch_async(dispatch_get_main_queue(), ^{
            UIView *previewView = self.session.previewView;
            [self addSubview:previewView];
            [previewView setTranslatesAutoresizingMaskIntoConstraints:NO];
      
            NSLayoutConstraint *centerX = [NSLayoutConstraint constraintWithItem:previewView attribute:NSLayoutAttributeCenterX relatedBy:NSLayoutRelationEqual toItem:self attribute:NSLayoutAttributeCenterX multiplier:1.0 constant:0];
            NSLayoutConstraint *centerY = [NSLayoutConstraint constraintWithItem:previewView attribute:NSLayoutAttributeCenterY relatedBy:NSLayoutRelationEqual toItem:self attribute:NSLayoutAttributeCenterY multiplier:1.0 constant:0];
            NSLayoutConstraint *width = [NSLayoutConstraint constraintWithItem:previewView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:self attribute:NSLayoutAttributeWidth multiplier:1.0 constant:0];
            NSLayoutConstraint *height = [NSLayoutConstraint constraintWithItem:previewView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:self attribute:NSLayoutAttributeHeight multiplier:1.0 constant:0];
      
            NSArray *constraints = [NSArray arrayWithObjects:centerX, centerY,width,height, nil];
            [self addConstraints: constraints];
      
            NSString *log = [NSString stringWithFormat:@"Zoom Range: [1..%.0f]", self.session.videoActiveFormat.videoMaxZoomFactor];
            NSLog(@"%@", log);
      
            if(_focus){
                [self.session setSmoothAutoFocusEnabled:_focus];
                [self.session setTouchToFocusEnable:_focus];
            }
      
            if(_muted){
                [self setMuted:_muted];
            }
            
            if (_started) {
                [self startSession];
            }
        });
    
        
    }
}

- (void)setStarted:(BOOL) started {
    if(started != _started){
        if(started){
            [self startSession];
            _started = started;
        }else{
            [self stopSession];
            _started = started;
        }
    }
}

-(void)setMuted:(BOOL) muted {
    _muted = muted;
    [self.session setMuted:muted];
}

-(void)setFocus:(BOOL) focus {
    _focus = focus;
    [self.session setSmoothAutoFocusEnabled:focus];
    [self.session setTouchToFocusEnable:focus];
}

-(void)setZoom:(NSNumber*) zoom {
    self.session.videoZoomFactor = [zoom integerValue];
}

-(void)setCamera:(NSString*)camera{
    if([camera isEqualToString:@"front"] || [camera isEqualToString:@"back"]){
        if(![camera isEqualToString:_camera]){
            _camera = camera;
            [self.session toggleCamera];
        }
    }
}

- (void)setFaceBeautyEnable:(BOOL)faceBeautyEnable {
  _faceBeautyEnable = faceBeautyEnable;
  [self.session setBeautifyModeOn:faceBeautyEnable];
}

- (void)setFaceBeautySetting:(NSDictionary *)faceBeautySetting {
  _faceBeautySetting = [faceBeautySetting copy];
  [self.session setBeautify:[faceBeautySetting[@"beautyLevel"] floatValue]];
  [self.session setRedden:[faceBeautySetting[@"redden"] floatValue]];
  [self.session setWhiten:[faceBeautySetting[@"whiten"] floatValue]];
}

- (void)setWatermarkSetting:(NSDictionary *)watermarkSetting {
  _watermarkSetting = [watermarkSetting copy];
  if (watermarkSetting && (watermarkSetting[@"src"] != [NSNull null]) &&![watermarkSetting[@"src"] isEqual:@""] && [watermarkSetting[@"src"] containsString:@"/"]) {
    UIImage *waterMark = [UIImage imageWithContentsOfFile:watermarkSetting[@"src"]];
    [self.session setWaterMarkWithImage:waterMark position:CGPointMake([watermarkSetting[@"position"][@"x"] floatValue], [watermarkSetting[@"position"][@"y"] floatValue])];
  }else {
    [self.session clearWaterMark];
  }
}

- (void)setPictureStreamingEnable:(BOOL)pictureStreamingEnable {
    _pictureStreamingEnable = pictureStreamingEnable;
    UIImage * pushImage = [UIImage imageWithContentsOfFile:_pictureStreamingFile];
    if (pictureStreamingEnable && _pictureStreamingFile) {
        [self.session setPushImage:pushImage];
    }else {
        [self.session setPushImage:nil];
        [self.session startCaptureSession];
    }
    
}

- (void)setPictureStreamingFile:(NSString *)pictureStreamingFile {
  _pictureStreamingFile = pictureStreamingFile;
  
}

- (void)setTorchEnable:(BOOL)torchEnable {
  _torchEnable = torchEnable;
  [self.session setTorchOn:torchEnable];
}

- (void)setPreviewMirrorEnable:(BOOL)previewMirrorEnable {
  _previewMirrorEnable = previewMirrorEnable;
  self.session.previewMirrorRearFacing = previewMirrorEnable;
  self.session.previewMirrorFrontFacing = previewMirrorEnable;
}

- (void)setEncodingMirrorEnable:(BOOL)encodingMirrorEnable {
  _encodingMirrorEnable = encodingMirrorEnable;
  self.session.streamMirrorRearFacing = encodingMirrorEnable;
  self.session.streamMirrorFrontFacing = encodingMirrorEnable;
}

- (void)setAudioMixFile:(NSDictionary *)audioMixFile {
  if (audioMixFile && audioMixFile[@"filePath"] != [NSNull null] && [audioMixFile[@"filePath"] containsString:@"/"]) {
    _audioMixFile = [audioMixFile copy];
    self.audioPlayer = [self.session audioPlayerWithFilePath:audioMixFile[@"filePath"]];
  }
  
}

- (void)setPlayMixAudio:(BOOL)playMixAudio {
  if (_audioMixFile && (_audioMixFile[@"filePath"] != [NSNull null]) && [_audioMixFile[@"filePath"] containsString:@"/"]) {
    _playMixAudio = playMixAudio;
    if (playMixAudio) {
      [self.audioPlayer play];
    }else {
      [self.audioPlayer pause];
    }
  }
  
}

- (void)setAudioMixVolume:(NSDictionary *)audioMixVolume {
  if (_audioMixFile && (_audioMixFile[@"filePath"] != [NSNull null]) && [_audioMixFile[@"filePath"] containsString:@"/"]) {
    _audioMixVolume = [audioMixVolume copy];
    self.session.inputGain = [audioMixVolume[@"micVolume"] floatValue];
    self.audioPlayer.volume = [audioMixVolume[@"musicVolume"] floatValue];
  }
  
}

- (void)setPlaybackEnable:(BOOL)playbackEnable {
  _playbackEnable = playbackEnable;
  [self.session setPlayback:playbackEnable];
}

- (void)streamingSessionSendingBufferDidFull:(id)session {
    NSString *log = @"Buffer is full";
    NSLog(@"%@", log);
}

- (void)streamingSession:(id)session sendingBufferDidDropItems:(NSArray *)items {
    NSString *log = @"Frame dropped";
    NSLog(@"%@", log);
}



- (void)stopSession {
    [self.session stopStreaming];
}

- (void)startSession {
    NSURL *streamURL = [NSURL URLWithString:self.rtmpURL];
    [self.session startStreamingWithPushURL:streamURL feedback:^(PLStreamStartStateFeedback feedback) {
        dispatch_async(dispatch_get_main_queue(), ^{
            NSLog(@"success ");
        });
    }];
}

- (void)mediaStreamingSession:(PLMediaStreamingSession *)session streamStatusDidUpdate:(PLStreamStatus *)status {
    NSString *log = [NSString stringWithFormat:@"Stream Status: %@", status];
    NSLog(@"%@", log);
    if (!self.onStreamInfoChange) {
        return;
    }
    self.onStreamInfoChange(@{@"videoFPS":@(status.videoFPS),
                              @"audioFPS":@(status.audioFPS),
                              @"totalBitrate":@(status.totalBitrate)
    });
}

- (void)mediaStreamingSession:(PLMediaStreamingSession *)session streamStateDidChange:(PLStreamState)state {
    NSString *log = [NSString stringWithFormat:@"Stream State: %s", stateNames[state]];
    NSLog(@"%@", log);
    if (!self.onStateChange) {
        return;
    }
  
    switch (state) {
        case PLStreamStateUnknow:
      
            self.onStateChange(@{@"state":@(PLRNStreamStateReady)});
            break;
        case PLStreamStateConnecting:
      
            self.onStateChange(@{@"state":@(PLRNStreamStateConnecting)});
            break;
        case PLStreamStateConnected:
      
            self.onStateChange(@{@"state":@(PLRNStreamStateStreaming)});
            break;
        case PLStreamStateDisconnecting:
      
            break;
        case PLStreamStateDisconnected:
                
            self.onStateChange(@{@"state":@(PLRNStreamStateShutdown)});
            self.onStateChange(@{@"state":@(PLRNStreamStateDisconnected)});
            break;
        case PLStreamStateError:
      
            self.onStateChange(@{@"state":@(PLRNStreamStateError)});
            break;
        default:
            break;
    }
}
- (void)mediaStreamingSession:(PLMediaStreamingSession *)session didDisconnectWithError:(NSError *)error {
    NSString *log = [NSString stringWithFormat:@"Stream State: Error. %@", error];
    NSLog(@"%@", log);
    [self startSession];
}

- (void)audioPlayer:(PLAudioPlayer *)audioPlayer audioDidPlayedRateChanged:(double)audioDidPlayedRate {
    self.onAudioMixProgress(@{@"progress":@(audioDidPlayedRate * self.audioPlayer.audioLength),@"duration":@(self.audioPlayer.audioLength),@"finish":@(_isPlayerFinish)});
}

- (BOOL)didAudioFilePlayingFinishedAndShouldAudioPlayerPlayAgain:(PLAudioPlayer *)audioPlayer {
    _isPlayerFinish = YES;
    return [_audioMixFile[@"loop"] boolValue];
}

- (void)handleInterruption:(NSNotification *)notification {
    if ([notification.name isEqualToString:AVAudioSessionInterruptionNotification]) {
        NSLog(@"Interruption notification");
    
        if ([[notification.userInfo valueForKey:AVAudioSessionInterruptionTypeKey] isEqualToNumber:[NSNumber numberWithInt:AVAudioSessionInterruptionTypeBegan]]) {
                NSLog(@"InterruptionTypeBegan");
        } else {
            // the facetime iOS 9 has a bug: 1 does not send interrupt end 2 you can use application become active, and repeat set audio session acitve until success.  ref http://blog.corywiles.com/broken-facetime-audio-interruptions-in-ios-9
            NSLog(@"InterruptionTypeEnded");
            AVAudioSession *session = [AVAudioSession sharedInstance];
            [session setActive:YES error:nil];
        }
    }
}

- (NSString *)getH264Profile:(int)h264Profile {
    switch (h264Profile) {
        case 0:
            
            return AVVideoProfileLevelH264Baseline30;
            
        case 1:
        
            return AVVideoProfileLevelH264Main30;
            
        case 2:
            
            return AVVideoProfileLevelH264Baseline31;
            
        case 3:
        
            return AVVideoProfileLevelH264Main31;
            
        case 4:
            
            return AVVideoProfileLevelH264Main32;
            
        case 5:
            
            return AVVideoProfileLevelH264High40;
            
        case 6:
            
            return AVVideoProfileLevelH264Baseline41;
            
        case 7:
            
            return AVVideoProfileLevelH264Main41;
            
        case 8:
            
            return AVVideoProfileLevelH264High41;
            
        case 9:
            
            return AVVideoProfileLevelH264BaselineAutoLevel;
            
        case 10:
            
            return AVVideoProfileLevelH264MainAutoLevel;
            
        case 11:
            
            return AVVideoProfileLevelH264HighAutoLevel;
            
        default:
            return AVVideoProfileLevelH264Baseline31;
    }
    return AVVideoProfileLevelH264Baseline31;
}

- (NSString *)getPresetVideo:(int)presetVideo {
        switch (presetVideo) {
            case 0:
                
                return AVCaptureSessionPresetPhoto;
                
            case 1:
            
                return AVCaptureSessionPresetHigh;
                
            case 2:
                
                return AVCaptureSessionPresetMedium;
                
            case 3:
            
                return AVCaptureSessionPresetLow;
                
            case 4:
                
                return AVCaptureSessionPreset352x288;
                
            case 5:
                
                return AVCaptureSessionPreset640x480;
                
            case 6:
                
                return AVCaptureSessionPreset1280x720;
                
            case 7:
                
                return AVCaptureSessionPreset1920x1080;
                
            case 8:
                
                return AVCaptureSessionPreset3840x2160;
                
            case 9:
                
                return AVCaptureSessionPresetiFrame960x540;
                
            case 10:
                
                return AVCaptureSessionPresetiFrame1280x720;
                
                
            default:
                return AVCaptureSessionPreset640x480;
        }
        return AVCaptureSessionPreset640x480;
}


/*
 // Only override drawRect: if you perform custom drawing.
 // An empty implementation adversely affects performance during animation.
 - (void)drawRect:(CGRect)rect {
 // Drawing code
 }
 */

@end
