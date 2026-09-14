import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  icon,
  onBlur,
  onFocus,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          multiline && styles.multilineContainer,
          disabled && styles.disabledInput,
        ]}
      >
        {/* Leading icon — pointerEvents="none" ensures touches pass through to TextInput */}
        {icon && (
          <View style={styles.iconContainer} pointerEvents="none">
            {icon}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            multiline ? styles.multilineInput : null,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={!disabled}
        />

        {/* Password visibility toggle — flex sibling, NOT absolutely positioned */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={20} color={COLORS.gray[400]} />
            ) : (
              <Eye size={20} color={COLORS.gray[400]} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const ICON_AREA_WIDTH = 44;

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: SPACING.xs + 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[50],
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    // Explicit height: undefined ensures TextInput is never collapsed to 0
  },
  inputWithIcon: {
    // Text starts after the icon area (icon container width + gap)
    paddingLeft: SPACING.sm,
  },
  iconContainer: {
    width: ICON_AREA_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedInput: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  errorInput: {
    borderColor: COLORS.error[500],
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.error[500],
    marginTop: SPACING.xs,
  },
  multilineContainer: {
    minHeight: 100,
    alignItems: 'flex-start',
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  disabledInput: {
    backgroundColor: COLORS.gray[100],
    borderColor: COLORS.gray[200],
    opacity: 0.7,
  },
});

export default Input;