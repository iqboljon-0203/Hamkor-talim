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
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { RoleCard } from '@/components/auth/RoleCard';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, User, GraduationCap, BookOpen, CheckCircle } from 'lucide-react-native';
import { UserRole } from '@/lib/supabase';
import * as Linking from 'expo-linking';
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
      errors.password = 'Parolni kiriting';
    } else if (password.length < 6) {
      errors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Parolni tasdiqlang';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Parollar bir-biriga mos kelmadi';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError('');

    try {
      const redirectUrl = Linking.createURL('/');
      const { error: signUpError } = await signUp(
        email.trim(),
        password,
        role,
        fullName.trim(),
        redirectUrl,
      );

      if (signUpError) {
        setGeneralError(signUpError.message || 'Hisob yaratishda xatolik yuz berdi');
      } else {
        showToast(
          'Tasdiqlash havolasi email manzilingizga yuborildi. Iltimos, pochta qutingizni tekshiring.',
          'success',
        );
        router.push('/login');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Kutilmagan xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* On Android, behavior='height' causes window resize loops and drops keyboard input */}
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
                <CheckCircle size={22} color={COLORS.white} />
              </View>
              <Text style={styles.logoName}>Hamkor Ta'lim</Text>
            </View>

            <Text style={styles.title}>Hisob yaratish 🚀</Text>
            <Text style={styles.subtitle}>Hamkor Ta'limga qo'shiling</Text>

            {/* General error banner */}
            {generalError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            {/* ── Role Selection (External Memoized Component) ───────────── */}
            <Text style={styles.roleLabel}>Rolingiz:</Text>
            <View style={styles.roleContainer}>
              <RoleCard
                role="student"
                selectedRole={role}
                onSelect={handleRoleSelect}
                title="Talaba"
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

            {/* ── Form fields ────────────────────────────────────────────── */}
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

            {/* ── Submit button ──────────────────────────────────────────── */}
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.lg,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginBottom: 2,
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
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
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
    color: COLORS.primary[500],
  },
});