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
import { Mail, Lock, ArrowLeft, User, GraduationCap, BookOpen } from 'lucide-react-native';
import { UserRole } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useToast } from '@/context/ToastContext';


export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { showToast } = useToast();

  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: COLORS.gray[300] };
    if (password.length < 6) return { level: 1, label: 'Zaif', color: COLORS.error[500] };
    if (password.length < 8) return { level: 2, label: "O'rtacha", color: COLORS.warning[500] };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (hasUpper && hasNumber) return { level: 3, label: 'Kuchli', color: COLORS.success[500] };
    return { level: 2, label: "O'rtacha", color: COLORS.warning[500] };
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parollar bir-biriga mos kelmadi");
      return;
    }

    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const redirectUrl = Linking.createURL('/');
      const { error: signUpError } = await signUp(email, password, role, fullName, redirectUrl);

      if (signUpError) {
        setError(signUpError.message || "Hisob yaratishda xatolik yuz berdi");
      } else {
        showToast("Tasdiqlash havolasi email manzilingizga yuborildi. Iltimos, pochta qutingizni tekshiring.", 'success');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || "Kutilmagan xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        enabled={Platform.OS === 'ios'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Hisob yaratish 🚀</Text>
            <Text style={styles.subtitle}>Hamkor Ta'limga qo'shiling</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Role Selection Cards */}
            <Text style={styles.roleLabel}>Rolingiz:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === 'student' && styles.roleCardActive,
                ]}
                onPress={() => setRole('student')}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIconWrap, role === 'student' && styles.roleIconWrapActive]}>
                  <GraduationCap size={24} color={role === 'student' ? COLORS.white : COLORS.primary[500]} />
                </View>
                <Text style={[styles.roleCardTitle, role === 'student' && styles.roleCardTitleActive]}>
                  Talaba
                </Text>
                <Text style={[styles.roleCardDesc, role === 'student' && styles.roleCardDescActive]}>
                  Vazifalarni bajaring
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === 'teacher' && styles.roleCardActive,
                ]}
                onPress={() => setRole('teacher')}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIconWrap, role === 'teacher' && styles.roleIconWrapActive]}>
                  <BookOpen size={24} color={role === 'teacher' ? COLORS.white : COLORS.primary[500]} />
                </View>
                <Text style={[styles.roleCardTitle, role === 'teacher' && styles.roleCardTitleActive]}>
                  O'qituvchi
                </Text>
                <Text style={[styles.roleCardDesc, role === 'teacher' && styles.roleCardDescActive]}>
                  Guruh boshqaring
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="To'liq ismingiz"
              placeholder="Ism va familiyangiz"
              value={fullName}
              onChangeText={setFullName}
              icon={<User size={20} color={COLORS.gray[400]} />}
            />

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
              placeholder="Parol yarating"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[400]} />}
            />

            {/* Password strength */}
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
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[400]} />}
            />

            <Button
              title="Hisob yaratish"
              onPress={handleSignup}
              fullWidth
              loading={loading}
              size="lg"
              gradient
              style={styles.signupButton}
            />

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
    padding: SPACING.xl,
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
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  roleCard: {
    flex: 1,
    padding: SPACING.md,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  roleIconWrapActive: {
    backgroundColor: COLORS.primary[500],
  },
  roleCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
    marginBottom: 2,
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
  signupButton: {
    marginTop: SPACING.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING['2xl'],
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