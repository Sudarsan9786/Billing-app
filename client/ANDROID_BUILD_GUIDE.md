# Annapoorna Android APK Build Guide

## ✅ Setup Complete!

All Capacitor dependencies and configurations have been installed and set up.

## 📋 Next Steps

### 1. Build the React App
```bash
cd client
npm run build
```

### 2. Add Android Platform
```bash
npx cap add android
```

### 3. Sync with Capacitor
```bash
npx cap sync android
npx cap copy android
```

### 4. Build APK

**Option A: Using the build script (Recommended)**
```bash
./build-android.sh
```

**Option B: Manual build**
```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 5. Open in Android Studio (Optional)
```bash
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. Click "locate" when build completes

## 📱 Install on Phone

1. Send `app-debug.apk` to your Android phone via WhatsApp/Email
2. Open the file on phone
3. Tap "Install"
4. If blocked: Settings → Security → Allow Unknown Sources → Install

## 🔧 Important Configuration

### Backend URL
The app is configured to use:
- **Production**: `https://billing-app-zct8.onrender.com/api`
- **Development**: `http://localhost:5001/api`

Update in `src/utils/api.js` if needed.

### App Icons
Create these icon files in `public/` folder:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `splash.png` (2732x2732px) - Optional

For now, placeholder icons will be used.

## 🎯 Android Configuration Files

After running `npx cap add android`, update these files:

### `android/app/src/main/res/values/strings.xml`
```xml
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">Annapoorna</string>
    <string name="title_activity_main">Annapoorna</string>
    <string name="package_name">com.annapoorna.billing</string>
    <string name="custom_url_scheme">com.annapoorna.billing</string>
</resources>
```

### `android/app/src/main/AndroidManifest.xml`
Add permissions inside `<manifest>`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

Add to `<activity>`:
```xml
android:windowSoftInputMode="adjustResize"
android:screenOrientation="portrait"
```

## 🚀 Google Play Store (Future)

For Play Store release:
1. Create keystore: `keytool -genkey -v -keystore annapoorna-release.keystore -alias annapoorna -keyalg RSA -keysize 2048 -validity 10000`
2. Build release: `./gradlew bundleRelease`
3. Upload AAB to Play Console

## ✅ What's Been Configured

- ✅ Capacitor installed and initialized
- ✅ Android platform ready
- ✅ Mobile hooks (network, back button)
- ✅ Offline banner component
- ✅ Mobile-specific CSS styles
- ✅ API configured for live backend
- ✅ Socket.io configured for live backend
- ✅ Status bar and splash screen config
- ✅ Manifest.json for PWA support
- ✅ Build script created

## 🐛 Troubleshooting

**Build fails?**
- Make sure Java JDK 17+ is installed
- Run `npx cap sync android` again
- Check `android/gradle.properties`

**APK won't install?**
- Enable "Unknown Sources" in Android settings
- Check if APK is corrupted (re-download)

**App crashes on startup?**
- Check backend URL is correct
- Verify CORS allows mobile requests
- Check Android logs: `adb logcat`

## 📞 Support

For issues, check:
- Capacitor docs: https://capacitorjs.com/docs
- Android Studio logs
- Network connectivity

