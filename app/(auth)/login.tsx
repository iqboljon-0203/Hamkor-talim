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
  useWindowDimensions,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, GraduationCap } from 'lucide-react-native';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

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
    <SafeAreaView
      style={[styles.container, isDesktop && styles.desktopContainer]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.desktopScrollContent,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Main Card Container */}
          <View style={[styles.content, isDesktop && styles.desktopCard]}>
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push('/')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeft size={20} color={COLORS.gray[700]} />
              <Text style={styles.backButtonText}>Bosh sahifaga qaytish</Text>
            </TouchableOpacity>

            {/* Branding header */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <GraduationCap size={22} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.logoName}>Hamkor Ta'lim</Text>
                <Text style={styles.logoSubtitle}>ZAMONAVIY TA'LIM TIZIMI</Text>
              </View>
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

      {/* ForgotPassword modal */}
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
  desktopContainer: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  desktopScrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    width: '100%',
  },
  desktopCard: {
    flex: 0,
    maxWidth: 480,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 36,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
    marginVertical: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  backButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  logoSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.gray[500],
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
    fontWeight: '800',
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
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  forgotPasswordText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
  },
  signInButton: {
    marginTop: SPACING.xs,
    borderRadius: 14,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  signupText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  signupLink: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});
