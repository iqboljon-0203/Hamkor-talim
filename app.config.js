module.exports = {
  name: 'Hamkor Talim',
  slug: 'hamkor-talim',
  "owner": "iqboljon2003",
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'solostudyapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'uz.hamkor.talim', 
    adaptiveIcon: {
      foregroundImage: './assets/images/favicon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router', 'expo-font', 'expo-web-browser'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
   "eas": {
        "projectId": "933ffb16-7193-494b-8dea-d330d7ecc514"
      },
  },
};