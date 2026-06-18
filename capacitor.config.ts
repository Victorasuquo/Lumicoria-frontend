/**
 * Capacitor — native iOS / Android wrapper.
 *
 * Wraps the live Vercel deploy in a native shell so we can ship to
 * the App Store / Play Store without re-implementing the React app.
 *
 * To produce native projects:
 *   npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
 *   npx cap init Lumicoria ai.lumicoria.app --web-dir=dist
 *   npx cap add ios
 *   npx cap add android
 *   npx cap sync
 *
 * Then for iOS:
 *   npx cap open ios       # opens Xcode; archive + upload via Transporter
 * Android:
 *   npx cap open android   # opens Android Studio; Generate Signed Bundle
 *
 * `server.url` makes the native shell load the live production URL
 * directly, so every Vercel deploy ships to mobile too. Swap to a
 * static webDir for offline-only builds.
 */

import type { CapacitorConfig } from "@capacitor/cli";

const PRODUCTION_URL = "https://lumicoria.ai";

const config: CapacitorConfig = {
  appId: "ai.lumicoria.app",
  appName: "Lumicoria",
  webDir: "dist",
  bundledWebRuntime: false,
  loggingBehavior: "production",
  ios: {
    contentInset: "always",
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: "mobile",
  },
  android: {
    backgroundColor: "#0F172A",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  server: {
    // Load the live deployment so OTA updates are automatic.
    url: PRODUCTION_URL,
    cleartext: false,
    androidScheme: "https",
    iosScheme: "https",
    allowNavigation: [
      "lumicoria.ai",
      "*.lumicoria.ai",
      "meet.jit.si",
      "meet.lumicoria.ai",
      "*.googleusercontent.com",
      "accounts.google.com",
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0F172A",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#4F46E5",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0F172A",
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
