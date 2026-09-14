import React, { useState, forwardRef, useRef, useImperativeHandle } from 'react';
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
  Pressable,
  Platform,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';
import { Eye, EyeOff } from 'lucide-react-native';

export interface InputProps {
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
  onBlur?: (e: any) => void;
  onFocus?: (e: any) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  disabled?: boolean;
  autoCorrect?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
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
      autoCorrect = false,
      returnKeyType,
      onSubmitEditing,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const innerRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => innerRef.current as TextInput);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const isPasswordMasked = secureTextEntry && !showPassword;

    return (
      <View style={[styles.container, style]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <Pressable
          onPress={() => {
            if (!disabled) {
              innerRef.current?.focus();
            }
          }}
          style={[
            styles.inputContainer,
            isFocused && styles.focusedInput,
            error ? styles.errorInput : null,
            multiline && styles.multilineContainer,
            disabled && styles.disabledInput,
          ]}
        >
          {/* Leading icon — pointerEvents="none" so touches pass directly to container/input */}
          {icon && (
            <View style={styles.iconContainer} pointerEvents="none">
              {icon}
            </View>
          )}

          <TextInput
            ref={innerRef}
            style={[
              styles.input,
              icon ? styles.inputWithIcon : null,
              multiline ? styles.multilineInput : null,
              // On Android, password masking with custom Google fonts can cause blank text or dropped keystrokes
              Platform.OS === 'android' && isPasswordMasked ? styles.androidSecureInput : null,
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={COLORS.gray[400]}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={isPasswordMasked}
            multiline={multiline}
            numberOfLines={multiline ? numberOfLines : 1}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            spellCheck={false}
            maxLength={maxLength}
            editable={!disabled}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            cursorColor={COLORS.primary[500]}
            selectionColor={COLORS.primary[200]}
            underlineColorAndroid="transparent"
          />

          {/* Password visibility toggle */}
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              {showPassword ? (
                <EyeOff size={20} color={COLORS.gray[400]} />
              ) : (
                <Eye size={20} color={COLORS.gray[400]} />
              )}
            </TouchableOpacity>
          )}
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

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
  },
  androidSecureInput: {
    fontFamily: undefined, // Native Android typeface prevents character drop or blank rendering
  },
  inputWithIcon: {
    paddingLeft: SPACING.xs,
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