import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Theme from '@/constants/Theme';

const { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } = Theme;

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
  disabled?: boolean;
  elevation?: 'sm' | 'md' | 'lg' | 'card';
  variant?: 'default' | 'outlined' | 'flat';
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  style,
  contentStyle,
  headerStyle,
  footerStyle,
  footer,
  disabled = false,
  elevation = 'card',
  variant = 'default',
  noPadding = false,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  const getShadow = () => {
    switch (elevation) {
      case 'sm':
        return SHADOWS.sm;
      case 'lg':
        return SHADOWS.lg;
      case 'card':
        return SHADOWS.card;
      case 'md':
      default:
        return SHADOWS.md;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: COLORS.gray[200],
        };
      case 'flat':
        return {
          shadowColor: 'transparent',
          shadowOpacity: 0,
          elevation: 0,
        };
      default:
        return {};
    }
  };

  return (
    <CardComponent
      style={[styles.container, getShadow(), getVariantStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {(title || subtitle) && (
        <View style={[styles.header, headerStyle]}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={[noPadding ? undefined : styles.content, contentStyle]}>
        {children}
      </View>
      {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.06)',
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  content: {
    padding: SPACING.md,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
});

export default Card;
