import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/Theme';

export default function Index() {
  const { session, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  if (session && user) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)" />;
}