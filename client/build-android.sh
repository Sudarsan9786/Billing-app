#!/bin/bash
echo "🚀 Building Annapoorna Android APK..."
echo ""

# Step 1: Build React app
echo "Step 1: Building React app..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

# Step 2: Sync with Capacitor
echo ""
echo "Step 2: Syncing with Capacitor..."
npx cap sync android
npx cap copy android

if [ $? -ne 0 ]; then
  echo "❌ Capacitor sync failed!"
  exit 1
fi

# Step 3: Build debug APK
echo ""
echo "Step 3: Building Android APK..."
cd android && ./gradlew assembleDebug

if [ $? -ne 0 ]; then
  echo "❌ APK build failed!"
  exit 1
fi

# Step 4: Show APK location
echo ""
echo "✅ BUILD COMPLETE!"
echo ""
echo "📱 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📤 Next steps:"
echo "   1. Send this APK to your Android phone via WhatsApp"
echo "   2. Open the file on phone and tap Install"
echo "   3. If blocked: Settings → Security → Allow Unknown Sources"
echo ""
echo "🔧 To open in Android Studio:"
echo "   npx cap open android"
echo ""

