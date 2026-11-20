import React, { useState, useRef, useCallback, useMemo } from 'react';
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
import { RoleCard } from '@/components/auth/RoleCard';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, User, GraduationCap, BookOpen } from 'lucide-react-native';
import { UserRole } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function calculatePasswordStrength(pass: string) {
  if (pass.length === 0) return { level: 0, label: '', color: COLORS.gray[300] };
  if (pass.length < 6) return { level: 1, label: 'Zaif', color: COLORS.error[500] };
  if (pass.length < 8) return { level: 2, label: "O'rtacha", color: COLORS.warning[500] };
  const hasUpper = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  if (hasUpper && hasNumber) return { level: 3, label: 'Kuchli', color: COLORS.success[500] };
  return { level: 2, label: "O'rtacha", color: COLORS.warning[500] };
}

export default function SignupScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { signUp } = useAuth();
  const { showToast } = useToast();

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const handleFullNameChange = useCallback((text: string) => {
    setFullName(text);
    setFieldErrors((prev) => (prev.fullName ? { ...prev, fullName: undefined } : prev));
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setFieldErrors((prev) => (prev.email ? { ...prev, email: undefined } : prev));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    setFieldErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev));
  }, []);

  const handleConfirmPasswordChange = useCallback((text: string) => {
    setConfirmPassword(text);
    setFieldErrors((prev) => (prev.confirmPassword ? { ...prev, confirmPassword: undefined } : prev));
  }, []);

  const handleRoleSelect = useCallback((selectedRole: UserRole) => {
    setRole(selectedRole);
  }, []);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.fullName = "To'liq ismingizni kiriting";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email manzilini kiriting';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "Email formati noto'g'ri";
    }

    if (!password) {
      errors.password = 'Parol yarating';
    } else if (password.length < 6) {
      errors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Parolni tasdiqlang';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Parollar mos kelmadi';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');

    try {
      const { error: signUpError } = await signUp(
        email.trim(),
        password,
        fullName.trim(),
        role
      );

      if (signUpError) {
        if (signUpError.message?.includes('already registered')) {
          setGeneralError('Bu email allaqachon ro\'yxatdan o\'tgan');
        } else {
          setGeneralError(signUpError.message || 'Ro\'yxatdan o\'tishda xatolik');
        }
      } else {
        showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
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

            <Text style={styles.title}>Ro'yxatdan o'tish</Text>
            <Text style={styles.subtitle}>Ta'lim platformasiga qo'shiling</Text>

            {/* General error banner */}
            {generalError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            {/* Role selector */}
            <Text style={styles.roleLabel}>Rolingizni tanlang</Text>
            <View style={styles.roleContainer}>
              <RoleCard
                role="student"
                selectedRole={role}
                onSelect={handleRoleSelect}
                title="O'quvchi"
                description="Vazifalarni bajaring"
                icon={
                  <GraduationCap
                    size={22}
                    color={role === 'student' ? COLORS.white : COLORS.primary[500]}
                  />
                }
              />
              <RoleCard
                role="teacher"
                selectedRole={role}
                onSelect={handleRoleSelect}
                title="O'qituvchi"
                description="Guruh boshqaring"
                icon={
                  <BookOpen
                    size={22}
                    color={role === 'teacher' ? COLORS.white : COLORS.primary[500]}
                  />
                }
              />
            </View>

            {/* Form fields */}
            <Input
              label="To'liq ismingiz"
              placeholder="Ism va familiyangiz"
              value={fullName}
              onChangeText={handleFullNameChange}
              icon={<User size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.fullName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <Input
              ref={emailRef}
              label="Email"
              placeholder="Email manzilingiz"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Mail size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.email}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Input
              ref={passwordRef}
              label="Parol"
              placeholder="Parol yarating"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.password}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            />

            {/* Password strength indicator */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  {[1, 2, 3].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthSegment,
                        {
                          backgroundColor:
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : COLORS.gray[200],
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}

            <Input
              ref={confirmPasswordRef}
              label="Parolni tasdiqlang"
              placeholder="Parolni qayta kiriting"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.confirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />

            {/* Submit button */}
            <Button
              title="Hisob yaratish"
              onPress={handleSignup}
              fullWidth
              loading={loading}
              disabled={loading}
              size="lg"
              gradient
              style={styles.signupButton}
            />

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Hisobingiz bormi? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Kirish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
    width: '100%',
  },
  desktopCard: {
    maxWidth: 520,
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
    marginBottom: SPACING.md,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    marginBottom: 2,
    fontWeight: '800',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    marginBottom: SPACING.md,
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
  roleLabel: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    height: 4,
    gap: 4,
    marginRight: SPACING.sm,
  },
  strengthSegment: {
    flex: 1,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
  },
  signupButton: {
    marginTop: SPACING.sm,
    borderRadius: 14,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  loginText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  loginLink: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});
