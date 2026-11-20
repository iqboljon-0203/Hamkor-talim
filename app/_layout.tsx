import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { AuthProvider } from '@/hooks/useAuth';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS } from '@/constants/Theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { ToastProvider } from '@/context/ToastContext';
import { PWAProvider } from '@/context/PWAContext';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAInstallModal from '@/components/PWAInstallModal';

// Enable screens
enableScreens();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary[500],
    secondary: COLORS.secondary[500],
    error: COLORS.error[500],
    background: COLORS.gray[50], // Slightly off-white background
  },
};

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-Bold': Poppins_700Bold,
  });

  const [isFontTimeout, setIsFontTimeout] = useState(Platform.OS === 'web');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const timer = setTimeout(() => setIsFontTimeout(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Never get stuck on web or mobile if fonts fail or take time
  if (!fontsLoaded && !fontError && !isFontTimeout && Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ToastProvider>
          <AuthProvider>
            <PWAProvider>
              <View style={styles.webOuter}>
                <View style={styles.webContainer}>
                  <PWAInstallPrompt />
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(app)" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <PWAInstallModal />
                </View>
              </View>
              <StatusBar style="auto" />
            </PWAProvider>
          </AuthProvider>
        </ToastProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
  },
  webContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.white,
  },
});
