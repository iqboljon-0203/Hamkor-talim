import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  type?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  // Determine button styles based on type
  const getButtonStyles = () => {
    switch (type) {
      case 'primary':
        return {
          backgroundColor: disabled ? COLORS.gray[300] : COLORS.primary[500],
          borderColor: COLORS.transparent,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? COLORS.gray[200] : COLORS.accent[100],
          borderColor: COLORS.transparent,
        };
      case 'outline':
        return {
          backgroundColor: COLORS.transparent,
          borderColor: disabled ? COLORS.gray[300] : COLORS.primary[500],
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: COLORS.transparent,
          borderColor: COLORS.transparent,
        };
      default:
        return {
          backgroundColor: COLORS.primary[500],
          borderColor: COLORS.transparent,
        };
    }
  };

  // Determine text styles based on type
  const getTextStyles = () => {
    switch (type) {
      case 'primary':
        return {
          color: COLORS.white,
        };
      case 'secondary':
        return {
          color: COLORS.accent[700],
        };
      case 'outline':
        return {
          color: disabled ? COLORS.gray[400] : COLORS.primary[500],
        };
      case 'ghost':
        return {
          color: disabled ? COLORS.gray[400] : COLORS.primary[500],
        };
      default:
        return {
          color: COLORS.white,
        };
    }
  };

  // Determine button size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.sm,
          borderRadius: BORDER_RADIUS.sm,
        };
      case 'lg':
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderRadius: BORDER_RADIUS.lg,
        };
      case 'md':
      default:
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
        };
    }
  };

  // Determine text size based on button size
  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return FONT_SIZES.sm;
      case 'lg':
        return FONT_SIZES.lg;
      case 'md':
      default:
        return FONT_SIZES.md;
    }
  };

  const buttonStyles = {
    ...styles.button,
    ...getButtonStyles(),
    ...getSizeStyles(),
    ...(fullWidth && styles.fullWidth),
  };

  const textStyles = {
    ...styles.text,
    ...getTextStyles(),
    fontSize: getTextSize(),
  };

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={type === 'primary' ? COLORS.white : COLORS.primary[500]}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[textStyles, textStyle, icon ? { marginLeft: SPACING.xs } : undefined]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
});

export default Button;