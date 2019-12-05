package com.qiniu.pili.droid.rnpili;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PiliPackage implements ReactPackage {

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    List<ViewManager> list = new ArrayList();
    list.add(new PLStreamingViewManager());
    return list;
  }

  @Override
  public List<NativeModule> createNativeModules(
                              ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @Override
  public List<Class<? extends JavaScriptModule>> createJSModules() {
    return null;
  }

}
