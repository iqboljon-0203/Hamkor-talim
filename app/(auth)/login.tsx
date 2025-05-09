import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={10}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Xush kelibsiz!</Text>
          <Text style={styles.subtitle}> Hisobingizga kiring</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            label="Password"
            placeholder="Parolni kiriting"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={20} color={COLORS.gray[500]} />}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Parolni unutdingizmi?</Text>
          </TouchableOpacity>

          <Button
            title="Kirish"
            onPress={handleLogin}
            fullWidth
            loading={loading}
            style={styles.signInButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Hisobingiz yo'qmi?</Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Ro'yxatdan o'ting</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  backButton: {
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  content: {
    flex: 1,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
  },
  signInButton: {
    marginBottom: SPACING.xl,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  signupText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  signupLink: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
  },
});
