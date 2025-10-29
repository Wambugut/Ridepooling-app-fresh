#!/bin/bash

# React Native Car Pooling App - Dependency Installation Script
# This script installs compatible versions of all required dependencies

echo "🚀 Installing React Native Car Pooling App Dependencies..."
echo "================================================="

# Exit on any error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in a React Native/Expo project
if [ ! -f "package.json" ]; then
    print_error "No package.json found. Please run this in your project root directory."
    exit 1
fi

# Clear any existing node_modules and lock files for clean install
print_warning "Cleaning existing installations..."
rm -rf node_modules
rm -f package-lock.json yarn.lock

# Core Dependencies (React 18 - stable and compatible)
print_status "Installing Core Dependencies..."
npx expo install expo@~54.0.12
npx expo install react@18.2.0 react-dom@18.2.0 react-native
print_status "Installing Core Expo & React Dependencies..."
npx expo install expo expo-router react react-dom react-native

# Router
print_status "Installing Expo Router..."
npx expo install expo-router@~6.0.10

# Firebase (Use ONLY React Native Firebase - don't mix with web Firebase)
print_status "Installing Firebase..."
npm install @react-native-firebase/app
npm install @react-native-firebase/crashlytics
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/app @react-native-firebase/crashlytics @react-native-firebase/auth @react-native-firebase/firestore

# Navigation & UI
print_status "Installing Navigation & UI..."
npx expo install @react-navigation/native
npx expo install react-native-screens
npx expo install react-native-safe-area-context
npm install react-native-paper
npx expo install @expo/vector-icons
npx expo install @react-navigation/native react-native-screens react-native-safe-area-context @expo/vector-icons react-native-paper

# Animation (Simplified - use either Moti OR Framer Motion, not both)
print_status "Installing Animation Libraries..."
npx expo install react-native-reanimated@~4.1.1
npx expo install react-native-gesture-handler
npx expo install react-native-reanimated react-native-gesture-handler lottie-react-native
npm install moti
# Lottie for JSON animations
npx expo install lottie-react-native
# Note: Removed framer-motion to avoid conflicts

# Styling (NativeWind)
print_status "Installing Styling..."
npm install nativewind
npm install tailwindcss
npm install nativewind tailwindcss

# Date/Time & Utilities
print_status "Installing Utilities..."
npx expo install @react-native-community/datetimepicker
npm install dayjs

# Expo Modules
print_status "Installing Expo Modules..."
npx expo install expo-constants
npx expo install expo-font
npx expo install expo-linking
npx expo install expo-splash-screen
npx expo install expo-status-bar
npx expo install expo-system-ui
npx expo install expo-web-browser@~15.0.8
# Core Expo Modules
print_status "Installing Core Expo Modules..."
npx expo install \
  expo-constants \
  expo-font \
  expo-linking \
  expo-splash-screen \
  expo-status-bar \
  expo-system-ui \
  expo-web-browser

# Maps & Location
print_status "Installing Maps & Location..."
npx expo install react-native-maps
npx expo install expo-location
npx expo install react-native-maps expo-location

# Dev Dependencies
print_status "Installing Dev Dependencies..."
npm install --save-dev @babel/core
npm install --save-dev @types/react@~18.2.79
npm install --save-dev jest
npm install --save-dev jest-expo@~51.0.0
npm install --save-dev react-test-renderer
npm install --save-dev typescript
npm install --save-dev \
  @babel/core \
  @types/react \
  jest \
  jest-expo \
  react-test-renderer \
  typescript

# Additional useful dependencies for car pooling app
print_status "Installing Additional Utilities..."
npm install react-native-web # For web compatibility

print_status "All dependencies installed successfully!"
echo "================================================="
echo "🎉 Installation Complete!"
echo ""
echo "Next steps:"
echo "1. Configure NativeWind: npx tailwindcss init"
echo "2. Set up Firebase configuration"
echo "3. Configure Babel for Reanimated"
echo ""
print_warning "Don't forget to:"
echo "- Add reanimated plugin to babel.config.js (must be last)"
echo "- Configure Firebase with your project credentials"
echo "- Set up NativeWind in your tailwind.config.js"
