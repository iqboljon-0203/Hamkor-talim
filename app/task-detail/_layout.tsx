import { Stack } from 'expo-router';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

export default function TaskDetailLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  return (
    <View style={[styles.outer, isDesktop && styles.desktopOuter]}>
      <View style={[styles.inner, isDesktop && styles.desktopInner]}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  desktopOuter: {
    backgroundColor: '#f1f5f9',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  desktopInner: {
    maxWidth: 960,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
});
