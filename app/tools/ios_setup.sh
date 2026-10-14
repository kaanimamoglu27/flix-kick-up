#!/bin/sh
# Run on a Mac after `npx cap add ios`. Locks FLIX Kick Up to portrait, makes it an iPhone app
# (no iPad screenshots needed), hides the status bar, declares no encryption and lets ProMotion phones run at 120 Hz.
set -e
PL=ios/App/App/Info.plist
PBX=ios/App/App.xcodeproj/project.pbxproj
B=/usr/libexec/PlistBuddy
$B -c "Delete :UISupportedInterfaceOrientations" $PL 2>/dev/null || true
$B -c "Add :UISupportedInterfaceOrientations array" $PL
$B -c "Add :UISupportedInterfaceOrientations:0 string UIInterfaceOrientationPortrait" $PL
$B -c "Delete :UISupportedInterfaceOrientations~ipad" $PL 2>/dev/null || true
$B -c "Add :UIRequiresFullScreen bool true" $PL 2>/dev/null || $B -c "Set :UIRequiresFullScreen true" $PL
$B -c "Add :UIStatusBarHidden bool true" $PL 2>/dev/null || $B -c "Set :UIStatusBarHidden true" $PL
$B -c "Add :UIViewControllerBasedStatusBarAppearance bool false" $PL 2>/dev/null || $B -c "Set :UIViewControllerBasedStatusBarAppearance false" $PL
$B -c "Add :ITSAppUsesNonExemptEncryption bool false" $PL 2>/dev/null || $B -c "Set :ITSAppUsesNonExemptEncryption false" $PL
$B -c "Add :CADisableMinimumFrameDurationOnPhone bool true" $PL 2>/dev/null || true
sed -i '' 's/TARGETED_DEVICE_FAMILY = "1,2";/TARGETED_DEVICE_FAMILY = 1;/g' $PBX
echo "Info.plist ready (portrait, iPhone only)"
