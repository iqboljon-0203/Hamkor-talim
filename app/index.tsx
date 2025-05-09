import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/Theme';

export default function Index() {
  const { session, loading, user } = useAuth();

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  // Not authenticated - redirect to auth
  if (!session) {
    return <Redirect href="/(auth)" />;
  }

  // Authenticated but no user profile - could happen during signup process
  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  // Redirect based on role
  return <Redirect href="/(app)" />;
}