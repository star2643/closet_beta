# React Native
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }

# Keep your app's classes
-keep class com.imageclass.** { *; }
-keep class com.imageclass.MainApplication { *; }
-keep class com.imageclass.MainActivity { *; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ReactNative JSON 相關
-keepclassmembers,allowobfuscation class * {
  @com.facebook.proguard.annotations.DoNotStrip *;
  @com.facebook.proguard.annotations.KeepGettersAndSetters *;
  @com.facebook.react.uimanager.annotations.ReactProp *;
}

# 保持原始碼行號等調試訊息
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# OkHttp 相關
-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep all classes in your app package
-keep class your.app.package.** { *; }

# Keep ReactNative modules
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }

# Keep custom components
-keep public class * extends com.facebook.react.ReactActivity
-keep public class * extends com.facebook.react.ReactActivityDelegate
-keep public class * extends com.facebook.react.ReactApplication
-keep public class * extends com.facebook.react.ReactNativeHost

# 避免警告
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn org.mozilla.javascript.**
-dontwarn org.mozilla.classfile.**
-dontwarn org.benf.cfr.reader.**
-dontwarn org.w3c.dom.bootstrap.**
-dontwarn org.sqlite.**