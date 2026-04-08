import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jameslee.biblerun',
  appName: 'Bible Heroes Run',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: '#000000',
    scrollEnabled: false,
    allowsLinkPreview: false,
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a0a3e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
