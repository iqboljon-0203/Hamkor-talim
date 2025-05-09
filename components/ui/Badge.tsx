import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';

interface BadgeProps {
  label: string;
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  type = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  // Determine background color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'primary':
        return COLORS.primary[100];
      case 'secondary':
        return COLORS.secondary[100];
      case 'success':
        return COLORS.success[100];
      case 'warning':
        return COLORS.warning[100];
      case 'error':
        return COLORS.error[100];
      case 'info':
        return COLORS.accent[100];
      default:
        return COLORS.primary[100];
    }
  };

  // Determine text color based on type
  const getTextColor = () => {
    switch (type) {
      case 'primary':
        return COLORS.primary[700];
      case 'secondary':
        return COLORS.secondary[700];
      case 'success':
        return COLORS.success[700];
      case 'warning':
        return COLORS.warning[700];
      case 'error':
        return COLORS.error[700];
      case 'info':
        return COLORS.accent[700];
      default:
        return COLORS.primary[700];
    }
  };

  // Determine size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: SPACING.xs / 2,
          paddingHorizontal: SPACING.xs,
          borderRadius: BORDER_RADIUS.sm,
        };
      case 'lg':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
        };
      case 'md':
      default:
        return {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
          borderRadius: BORDER_RADIUS.sm,
        };
    }
  };

  // Determine text size based on badge size
  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return FONT_SIZES.xs;
      case 'lg':
        return FONT_SIZES.md;
      case 'md':
      default:
        return FONT_SIZES.sm;
    }
  };

  const badgeStyles = {
    ...styles.badge,
    ...getSizeStyles(),
    backgroundColor: getBackgroundColor(),
  };

  const textStyles = {
    ...styles.text,
    color: getTextColor(),
    fontSize: getTextSize(),
  };

  return (
    <View style={[badgeStyles, style]}>
      <Text style={[textStyles, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
});

export default Badge;