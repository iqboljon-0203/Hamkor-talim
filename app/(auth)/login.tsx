import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react-native';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordVisible, setForgotPasswordVisible] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  const { signIn } = useAuth();

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setFieldErrors((prev) => (prev.email ? { ...prev, email: undefined } : prev));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setFieldErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev));
  }, []);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email manzilini kiriting';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "Email formati noto'g'ri";
    }

    if (!password) {
      errors.password = 'Parolni kiriting';
    } else if (password.length < 6) {
      errors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');

    try {
      const { error: signInError } = await signIn(email.trim(), password);

      if (signInError) {
        if (signInError.message?.includes('Invalid login credentials')) {
          setGeneralError("Noto'g'ri email yoki parol");
        } else {
          setGeneralError(signInError.message || 'Tizimga kirishda xatolik yuz berdi');
        }
      } else {
        router.replace('/(app)');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Kutilmagan xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* On Android, windowSoftInputMode already resizes properly. Setting behavior='height' breaks IME. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Branding header */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <CheckCircle size={28} color={COLORS.white} />
              </View>
              <Text style={styles.logoName}>Hamkor Ta'lim</Text>
            </View>

            <Text style={styles.title}>Xush kelibsiz! 👋</Text>
            <Text style={styles.subtitle}>Hisobingizga kiring</Text>

            {/* General error banner */}
            {generalError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            {/* Email input */}
            <Input
              label="Email"
              placeholder="Email manzilingiz"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              icon={<Mail size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.email}
            />

            {/* Password input */}
            <Input
              ref={passwordInputRef}
              label="Parol"
              placeholder="Parolingiz"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              icon={<Lock size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.password}
            />

            {/* Forgot password link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => setForgotPasswordVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotPasswordText}>Parolni unutdingizmi?</Text>
            </TouchableOpacity>

            {/* Submit button */}
            <Button
              title="Kirish"
              onPress={handleLogin}
              fullWidth
              loading={loading}
              disabled={loading}
              size="lg"
              gradient
              style={styles.signInButton}
            />

            {/* Signup link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Hisobingiz yo'qmi? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Ro'yxatdan o'ting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fully interactive, native ForgotPassword modal */}
      <ForgotPasswordModal
        visible={isForgotPasswordVisible}
        initialEmail={email}
        onClose={() => setForgotPasswordVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    padding: SPACING.md,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  logoName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[800],
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    marginBottom: SPACING.xl,
  },
  errorContainer: {
    backgroundColor: COLORS.error[50],
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error[500],
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error[600],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
    marginTop: -SPACING.xs,
  },
  forgotPasswordText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[500],
  },
  signInButton: {
    marginBottom: SPACING.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  signupText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  signupLink: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[500],
  },
});
