#!/bin/bash
# Mac terminal helper: builds this game's iOS app and uploads it to TestFlight.
#   ./ios.sh hazirla           iOS projesini oluşturur / günceller (npm, oyun dosyaları, ikon, ayarlar)
#   ./ios.sh simulator         iPhone simülatöründe açar
#   ./ios.sh xcode             projeyi Xcode'da açar
#   ./ios.sh yukle 1.0         derler, imzalar ve App Store Connect'e (TestFlight) yükler
# For "yukle": APPLE_TEAM_ID is required. Sign in once in Xcode > Settings > Accounts with your Apple ID,
# or set ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_PATH (path of the AuthKey_XXXX.p8 file) to use an API key.
set -euo pipefail
cd "$(dirname "$0")"
NAME=$(python3 -c "import json;print(json.load(open('capacitor.config.json'))['appName'])")
need() { command -v "$1" >/dev/null || { echo "Eksik: $1. $2"; exit 1; }; }

prepare() {
  need node "Kur: https://nodejs.org (22 veya üstü) ya da 'brew install node'"
  need pod "Kur: 'brew install cocoapods' (Homebrew yoksa: 'sudo gem install cocoapods')"
  need xcodebuild "App Store'dan Xcode'u kur, bir kez aç, sonra 'sudo xcode-select -s /Applications/Xcode.app'"
  npm ci
  npm run build
  [ -d ios ] || npx cap add ios --packagemanager CocoaPods
  npx cap sync ios
  python3 tools/ios_setup.py
  echo "$NAME: iOS projesi hazır (ios/App/App.xcworkspace)"
}

upload() {
  local version="${1:-1.0}"
  : "${APPLE_TEAM_ID:?APPLE_TEAM_ID eksik. Örnek: export APPLE_TEAM_ID=ABCDE12345 (developer.apple.com > Membership)}"
  export APP_VERSION="$version" BUILD_NUMBER="${BUILD_NUMBER:-$(date +%y%m%d%H%M)}"
  prepare
  local auth=() out="build/testflight"
  if [ -n "${ASC_KEY_ID:-}" ]; then
    auth=(-authenticationKeyPath "${ASC_KEY_PATH:?ASC_KEY_PATH eksik (.p8 dosyasının yolu)}" -authenticationKeyID "$ASC_KEY_ID" -authenticationKeyIssuerID "${ASC_ISSUER_ID:?ASC_ISSUER_ID eksik}")
  fi
  rm -rf "$out"; mkdir -p "$out"
  xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release \
    -destination 'generic/platform=iOS' -archivePath "$out/App.xcarchive" \
    DEVELOPMENT_TEAM="$APPLE_TEAM_ID" CODE_SIGN_STYLE=Automatic -allowProvisioningUpdates ${auth[@]+"${auth[@]}"} \
    archive | tail -n 40
  cat > "$out/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>$APPLE_TEAM_ID</string>
  <key>signingStyle</key><string>automatic</string>
  <key>uploadSymbols</key><true/>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
PLIST
  xcodebuild -exportArchive -archivePath "$out/App.xcarchive" -exportOptionsPlist "$out/ExportOptions.plist" \
    -exportPath "$out/export" -allowProvisioningUpdates ${auth[@]+"${auth[@]}"} | tail -n 30
  echo "$NAME $version ($BUILD_NUMBER) yüklendi. 10-30 dakika içinde App Store Connect > TestFlight'ta görünür."
}

case "${1:-}" in
  hazirla) prepare ;;
  simulator) prepare; npx cap run ios ;;
  xcode) [ -d ios ] || prepare; npx cap open ios ;;
  yukle) upload "${2:-1.0}" ;;
  *) sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
