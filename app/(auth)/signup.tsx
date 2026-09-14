import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, User, GraduationCap, BookOpen, CheckCircle } from 'lucide-react-native';
import { UserRole } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useToast } from '@/context/ToastContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignupScreen() {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  // UI state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { showToast } = useToast();

  // ── Password strength ───────────────────────────────────────────────────────

  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: COLORS.gray[300] };
    if (password.length < 6) return { level: 1, label: 'Zaif', color: COLORS.error[500] };
    if (password.length < 8) return { level: 2, label: "O'rtacha", color: COLORS.warning[500] };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (hasUpper && hasNumber) return { level: 3, label: 'Kuchli', color: COLORS.success[500] };
    return { level: 2, label: "O'rtacha", color: COLORS.warning[500] };
  };

  const passwordStrength = getPasswordStrength();

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!fullName.trim()) {
      errors.fullName = "To'liq ismingizni kiriting";
    }

    if (!email.trim()) {
      errors.email = 'Email manzilini kiriting';
    } else if (!EMAIL_REGEX.test(email.trim())) {
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

  // ── Clear single field error on change ──────────────────────────────────────

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Signup handler ──────────────────────────────────────────────────────────

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
          "Tasdiqlash havolasi email manzilingizga yuborildi. Iltimos, pochta qutingizni tekshiring.",
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Back button stays fixed above scroll */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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

            {/* ── Role Selection ───────────────────────────────────────────── */}
            <Text style={styles.roleLabel}>Rolingiz:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleCard, role === 'student' && styles.roleCardActive]}
                onPress={() => setRole('student')}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIconWrap, role === 'student' && styles.roleIconWrapActive]}>
                  <GraduationCap size={22} color={role === 'student' ? COLORS.white : COLORS.primary[500]} />
                </View>
                <Text style={[styles.roleCardTitle, role === 'student' && styles.roleCardTitleActive]}>
                  Talaba
                </Text>
                <Text style={[styles.roleCardDesc, role === 'student' && styles.roleCardDescActive]}>
                  Vazifalarni bajaring
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleCard, role === 'teacher' && styles.roleCardActive]}
                onPress={() => setRole('teacher')}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIconWrap, role === 'teacher' && styles.roleIconWrapActive]}>
                  <BookOpen size={22} color={role === 'teacher' ? COLORS.white : COLORS.primary[500]} />
                </View>
                <Text style={[styles.roleCardTitle, role === 'teacher' && styles.roleCardTitleActive]}>
                  O'qituvchi
                </Text>
                <Text style={[styles.roleCardDesc, role === 'teacher' && styles.roleCardDescActive]}>
                  Guruh boshqaring
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Form fields ──────────────────────────────────────────────── */}
            <Input
              label="To'liq ismingiz"
              placeholder="Ism va familiyangiz"
              value={fullName}
              onChangeText={(t) => { setFullName(t); clearFieldError('fullName'); }}
              icon={<User size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.fullName}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="Email manzilingiz"
              value={email}
              onChangeText={(t) => { setEmail(t); clearFieldError('email'); }}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.email}
            />

            <Input
              label="Parol"
              placeholder="Parol yarating"
              value={password}
              onChangeText={(t) => { setPassword(t); clearFieldError('password'); }}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.password}
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
              label="Parolni tasdiqlang"
              placeholder="Parolni qayta kiriting"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); clearFieldError('confirmPassword'); }}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.confirmPassword}
            />

            {/* ── Submit ───────────────────────────────────────────────────── */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  // ── Brand header ──
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
  // ── Typography ──
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
  // ── Error banner ──
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
  // ── Role selection ──
  roleLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  roleCard: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  roleIconWrapActive: {
    backgroundColor: COLORS.primary[500],
  },
  roleCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: 1,
  },
  roleCardTitleActive: {
    color: COLORS.primary[700],
  },
  roleCardDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
  },
  roleCardDescActive: {
    color: COLORS.primary[400],
  },
  // ── Password strength ──
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  strengthBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
  },
  // ── Actions ──
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