import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <BookOpen size={64} color={COLORS.primary[500]} />
          <Text style={styles.logoText}>Hamkor t'alim</Text>
        </View>

        <Text style={styles.subtitle}>O‘rganing, O‘rgating, Rivojlaning</Text>
        
        <Text style={styles.description}>
        Ta’lim vazifalarini boshqarish va o‘quvchi rivojini kuzatishning samarali usuli
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Boshladik"
            onPress={() => router.push('/login')}
            size="lg"
            fullWidth
          />
          <Button
            title="Ro'yxatdan o'tish"
            onPress={() => router.push('/signup')}
            type="outline"
            style={styles.secondaryButton}
            fullWidth
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Samarali ta’lim uchun o‘quvchilar va o‘qituvchilarni birlashtiramiz
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.primary[700],
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[700],
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  secondaryButton: {
    marginTop: SPACING.md,
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});