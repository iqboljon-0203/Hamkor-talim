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
import { useToast } from '@/context/ToastContext';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react-native';
import Modal from 'react-native-modal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  email?: string;
  password?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot-password modal state
  const [isForgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { signIn, resetPassword } = useAuth();
  const { showToast } = useToast();

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: FieldErrors = {};

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

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Login handler ───────────────────────────────────────────────────────────

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

  // ── Reset-password handler ──────────────────────────────────────────────────

  const handleResetPassword = async () => {
    if (!forgotEmail.trim()) {
      showToast('Iltimos, email manzilingizni kiriting', 'error');
      return;
    }
    if (!EMAIL_REGEX.test(forgotEmail.trim())) {
      showToast("Email formati noto'g'ri", 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const { error: resetError } = await resetPassword(forgotEmail.trim());
      if (resetError) {
        showToast(resetError.message || 'Xatolik yuz berdi', 'error');
      } else {
        showToast(
          'Parolni tiklash havolasi emailingizga yuborildi. Pochtangizni tekshiring.',
          'success',
        );
        setForgotPasswordVisible(false);
        setForgotEmail('');
      }
    } catch (e: any) {
      showToast(e.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setForgotLoading(false);
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

            {/* Email */}
            <Input
              label="Email"
              placeholder="Email manzilingiz"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.email}
            />

            {/* Password */}
            <Input
              label="Parol"
              placeholder="Parolingiz"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[400]} />}
              error={fieldErrors.password}
            />

            {/* Forgot password link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => {
                setForgotEmail(email);
                setForgotPasswordVisible(true);
              }}
            >
              <Text style={styles.forgotPasswordText}>Parolni unutdingizmi?</Text>
            </TouchableOpacity>

            {/* Submit */}
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

      {/* ── FORGOT PASSWORD MODAL ───────────────────────────────────────────── */}
      <Modal
        isVisible={isForgotPasswordVisible}
        onBackdropPress={() => setForgotPasswordVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
        avoidKeyboard
        hideModalContentWhileAnimating
        useNativeDriver
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Parolni tiklash</Text>
          <Text style={styles.modalSubtitle}>
            Emailingizni kiriting. Biz sizga yangi parol o'rnatish havolasini yuboramiz.
          </Text>

          <Input
            label="Email"
            placeholder="Email manzilingizni kiriting"
            value={forgotEmail}
            onChangeText={setForgotEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={20} color={COLORS.gray[400]} />}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Bekor qilish"
              onPress={() => setForgotPasswordVisible(false)}
              type="outline"
              style={styles.modalButton}
            />
            <Button
              title="Yuborish"
              onPress={handleResetPassword}
              loading={forgotLoading}
              disabled={forgotLoading}
              gradient
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
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
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  // ── Brand header ──
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
  // ── Typography ──
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
  // ── Actions ──
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
  // ── Modal ──
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS['3xl'],
    borderTopRightRadius: BORDER_RADIUS['3xl'],
    padding: SPACING.xl,
    paddingTop: SPACING.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray[300],
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  modalButton: {
    minWidth: 110,
  },
});
