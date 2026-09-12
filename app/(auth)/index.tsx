import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, GRADIENTS } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={[GRADIENTS.primary[0], GRADIENTS.primary[1]]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <CheckCircle size={48} color={COLORS.white} />
            </View>
            <Text style={styles.logoText}>Hamkor Ta'lim</Text>
            <Text style={styles.tagline}>O'rganing · O'rgating · Rivojlaning</Text>
          </View>

          <Text style={styles.description}>
            Ta'lim vazifalarini boshqarish va o'quvchi rivojini kuzatishning zamonaviy platformasi
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Kirish"
              onPress={() => router.push('/login')}
              size="lg"
              fullWidth
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
              type="secondary"
            />
            <Button
              title="Ro'yxatdan o'tish"
              onPress={() => router.push('/signup')}
              size="lg"
              fullWidth
              style={styles.outlineButton}
              textStyle={styles.outlineButtonText}
              type="ghost"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hamkor Ta'lim Enterprise © 2025
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['4xl'],
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: SPACING['3xl'],
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: SPACING.md,
  },
  primaryButtonText: {
    color: COLORS.primary[600],
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    paddingVertical: SPACING.md,
  },
  outlineButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});