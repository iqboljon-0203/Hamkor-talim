import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, User } from 'lucide-react-native';
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

  const handleSignup = async () => {
    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const redirectUrl = Linking.createURL('/'); 
      console.log('Redirect URL:', redirectUrl);

      // Pass redirectUrl to signUp
      const { error: signUpError } = await signUp(email, password, role, fullName, redirectUrl);
      
      if (signUpError) {
        setError(signUpError.message || 'Failed to create account');
      } else {
        // Confirmation email sent
        showToast("Tasdiqlash havolasi email manzilingizga yuborildi. Iltimos, pochta qutingizni tekshiring.", 'success');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Hisob yaratish</Text>
            <Text style={styles.subtitle}>Hamkor t'alimga qo'shiling</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Input
              label="Ismingiz"
              placeholder="Ismingizni kiriting"
              value={fullName}
              onChangeText={setFullName}
              icon={<User size={20} color={COLORS.gray[500]} />}
            />

            <Input
              label="Email"
              placeholder="Email kiriting"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={20} color={COLORS.gray[500]} />}
            />

            <Input
              label="Parol"
              placeholder="Parolni kiriting"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[500]} />}
            />

            <Input
              label="Parolni tasdiqlang"
              placeholder="Parolni qayta kiriting"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.gray[500]} />}
            />

            <Text style={styles.roleLabel}>Men:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'student' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('student')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'student' && styles.roleButtonTextActive,
                  ]}
                >
                  O'quvchi
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'teacher' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('teacher')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'teacher' && styles.roleButtonTextActive,
                  ]}
                >
                  O'qituvchi
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Hisob yaratish"
              onPress={handleSignup}
              fullWidth
              loading={loading}
              style={styles.signupButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Hisobingiz bormi?</Text>
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
    backgroundColor: COLORS.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  content: {
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.xl,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error[500],
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.error[50],
    borderRadius: 4,
  },
  roleLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  roleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  roleButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
  },
  roleButtonTextActive: {
    color: COLORS.white,
  },
  signupButton: {
    marginTop: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  loginText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  loginLink: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
  },
});