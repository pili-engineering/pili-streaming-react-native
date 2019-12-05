//
//  PLRNViewManager.m
//  pili_startkit
//
//  Created by 何云旗 on 2019/12/3.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "PLRNViewManager.h"
#import "PLRNStreaming.h"

@implementation PLRNViewManager
RCT_EXPORT_MODULE(PLRNMediaStreaming)

@synthesize bridge = _bridge;

- (UIView *)view {
  return [[PLRNStreaming alloc] init];
}

- (NSArray *)customDirectEventTypes
{
    return @[
             @"onReady",
             @"onConnecting",
             @"onStreaming",
             @"onShutdown",
             @"onIOError",
             @"onDisconnected"
             ];
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_VIEW_PROPERTY(rtmpURL, NSString);
RCT_EXPORT_VIEW_PROPERTY(profile, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(started, BOOL);
RCT_EXPORT_VIEW_PROPERTY(muted, BOOL);
RCT_EXPORT_VIEW_PROPERTY(zoom, NSNumber);
RCT_EXPORT_VIEW_PROPERTY(focus, BOOL);
RCT_EXPORT_VIEW_PROPERTY(camera, NSString);
RCT_EXPORT_VIEW_PROPERTY(onStateChange, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onStreamInfoChange, RCTDirectEventBlock)


@end
