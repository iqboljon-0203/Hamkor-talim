import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, GRADIENTS } from '@/constants/Theme';

interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  type?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradient?: boolean;
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
  iconRight,
  style,
  textStyle,
  gradient = false,
}) => {
  const getButtonStyles = () => {
    switch (type) {
      case 'primary':
        return {
          backgroundColor: disabled ? COLORS.gray[300] : COLORS.primary[500],
          borderColor: COLORS.transparent,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? COLORS.gray[200] : COLORS.primary[50],
          borderColor: COLORS.transparent,
        };
      case 'outline':
        return {
          backgroundColor: COLORS.transparent,
          borderColor: disabled ? COLORS.gray[300] : COLORS.primary[500],
          borderWidth: 1.5,
        };
      case 'ghost':
        return {
          backgroundColor: COLORS.transparent,
          borderColor: COLORS.transparent,
        };
      case 'danger':
        return {
          backgroundColor: disabled ? COLORS.gray[300] : COLORS.error[500],
          borderColor: COLORS.transparent,
        };
      default:
        return {
          backgroundColor: COLORS.primary[500],
          borderColor: COLORS.transparent,
        };
    }
  };

  const getTextStyles = () => {
    switch (type) {
      case 'primary':
        return { color: COLORS.white };
      case 'secondary':
        return { color: COLORS.primary[600] };
      case 'outline':
        return { color: disabled ? COLORS.gray[400] : COLORS.primary[500] };
      case 'ghost':
        return { color: disabled ? COLORS.gray[400] : COLORS.primary[500] };
      case 'danger':
        return { color: COLORS.white };
      default:
        return { color: COLORS.white };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: SPACING.xs + 2,
          paddingHorizontal: SPACING.md,
          borderRadius: BORDER_RADIUS.md,
        };
      case 'lg':
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderRadius: BORDER_RADIUS.xl,
        };
      case 'md':
      default:
        return {
          paddingVertical: SPACING.sm + 2,
          paddingHorizontal: SPACING.lg,
          borderRadius: BORDER_RADIUS.lg,
        };
    }
  };

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

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={type === 'primary' || type === 'danger' ? COLORS.white : COLORS.primary[500]}
          size="small"
        />
      ) : (
        <>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[textStyles, textStyle]}>{title}</Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </>
      )}
    </>
  );

  if (gradient && type === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={[GRADIENTS.primary[0], GRADIENTS.primary[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, getSizeStyles(), fullWidth && styles.fullWidth]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
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
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;