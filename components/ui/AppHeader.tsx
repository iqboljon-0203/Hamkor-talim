import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import { Bell, CheckCircle, Download } from 'lucide-react-native';
import Avatar from './Avatar';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { usePWA } from '@/context/PWAContext';

interface AppHeaderProps {
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ subtitle = 'Asosiy', showBack, rightElement }) => {
  const { user } = useAuth();
  const { openInstallModal, isInstalled } = usePWA();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.gray[900]} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoCircle}>
            <CheckCircle size={18} color={COLORS.white} />
          </View>
        )}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Hamkor Ta'lim</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {rightElement ? (
          rightElement
        ) : (
          <>
            {!isInstalled && (
              <TouchableOpacity
                style={styles.pwaHeaderBtn}
                onPress={openInstallModal}
                activeOpacity={0.8}
              >
                <Download size={15} color={COLORS.primary[600]} />
                <Text style={styles.pwaHeaderBtnText}>Ilova</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.bellButton}>
              <Bell size={22} color={COLORS.gray[700]} />
              <View style={styles.bellDot} />
            </TouchableOpacity>
            <Avatar
              size="sm"
              name={user?.full_name || 'F'}
              source={user?.avatar_url ? { uri: user.avatar_url } : null}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  titleWrap: {
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    lineHeight: 14,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pwaHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  pwaHeaderBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary[700],
    fontWeight: '600',
  },
  bellButton: {
    position: 'relative',
    padding: SPACING.xs,
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent[500],
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
});

export default AppHeader;
