import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Download, X, Smartphone } from 'lucide-react-native';
import Theme from '@/constants/Theme';
import { usePWA } from '@/context/PWAContext';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } = Theme;

export default function PWAInstallPrompt() {
  const { isInstalled, isIOS, isMobile, openInstallModal } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (Platform.OS !== 'web' || isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Smartphone size={20} color="#ffffff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Hamkor Ta'lim Mobil Ilovasi</Text>
          <Text style={styles.subtitle}>
            {isMobile
              ? "Telefoningizga qulay mobil ilova sifatida o'rnating"
              : "Mobil ilova sifatida telefonga yuklab olish mumkin"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.installButton}
          onPress={openInstallModal}
          activeOpacity={0.8}
        >
          <Download size={15} color="#ffffff" />
          <Text style={styles.installButtonText}>Yuklab olish</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
    paddingRight: SPACING.xs,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[900],
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.gray[500],
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.xs,
  },
  installButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});
