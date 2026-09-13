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


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isForgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { signIn, resetPassword } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Iltimos, email va parolni kiriting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError("Noto'g'ri email yoki parol");
        } else {
          setError(signInError.message || 'Tizimga kirishda xatolik yuz berdi');
        }
      } else {
        router.replace('/(app)');
      }
    } catch (err: any) {
      setError(err.message || 'Kutilmagan xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotEmail.trim()) {
      showToast('Iltimos, email manzilingizni kiriting', 'error');
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <CheckCircle size={28} color={COLORS.white} />
              </View>
              <Text style={styles.logoName}>Hamkor Ta'lim</Text>
            </View>

            <Text style={styles.title}>Xush kelibsiz! 👋</Text>
            <Text style={styles.subtitle}>Hisobingizga kiring</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="Email manzilingiz"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color={COLORS.gray[400]} />}
            />

            <Input
              label="Parol"
              placeholder="Parolingiz"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[400]} />}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => {
                setForgotEmail(email);
                setForgotPasswordVisible(true);
              }}
            >
              <Text style={styles.forgotPasswordText}>Parolni unutdingizmi?</Text>
            </TouchableOpacity>

            <Button
              title="Kirish"
              onPress={handleLogin}
              fullWidth
              loading={loading}
              size="lg"
              gradient
              style={styles.signInButton}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Hisobingiz yo'qmi? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Ro'yxatdan o'ting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FORGOT PASSWORD MODAL */}
      <Modal
        isVisible={isForgotPasswordVisible}
        onBackdropPress={() => setForgotPasswordVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Parolni tiklash</Text>
          <Text style={styles.modalSubtitle}>
            Emailingizni kiriting. Biz sizga yangi parol o'rnatish havolasini
            yuboramiz.
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
              gradient
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    padding: SPACING.md,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
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
    marginBottom: SPACING.xl,
    marginTop: -SPACING.sm,
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
    marginTop: SPACING.md,
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
