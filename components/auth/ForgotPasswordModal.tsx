import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, X } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ForgotPasswordModalProps {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  visible,
  initialEmail = '',
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (visible) {
      setEmail(initialEmail);
      setError('');
      setLoading(false);
    }
  }, [visible, initialEmail]);

  const handleReset = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Iltimos, email manzilingizni kiriting');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Email formati noto'g'ri");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(trimmedEmail);
      if (resetError) {
        setError(resetError.message || 'Xatolik yuz berdi');
        showToast(resetError.message || 'Xatolik yuz berdi', 'error');
      } else {
        showToast(
          'Parolni tiklash havolasi emailingizga yuborildi. Pochtangizni tekshiring.',
          'success',
        );
        onClose();
      }
    } catch (e: any) {
      setError(e.message || 'Kutilmagan xatolik yuz berdi');
      showToast(e.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop tap to dismiss */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.sheet}>
            {/* Top drag handle indicator */}
            <View style={styles.handle} />

            {/* Header with close button */}
            <View style={styles.headerRow}>
              <Text style={styles.title}>Parolni tiklash</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color={COLORS.gray[500]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Ro'yxatdan o'tgan emailingizni kiriting. Yangi parol o'rnatish uchun havola
              yuboramiz.
            </Text>

            {/* Email input */}
            <Input
              label="Email"
              placeholder="namuna@gmail.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Mail size={20} color={COLORS.gray[400]} />}
              error={error}
              returnKeyType="send"
              onSubmitEditing={handleReset}
            />

            {/* Actions */}
            <View style={styles.buttonRow}>
              <Button
                title="Bekor qilish"
                onPress={onClose}
                type="outline"
                style={styles.actionBtn}
                disabled={loading}
              />
              <Button
                title="Yuborish"
                onPress={handleReset}
                loading={loading}
                disabled={loading}
                gradient
                style={styles.actionBtn}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS['3xl'],
    borderTopRightRadius: BORDER_RADIUS['3xl'],
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING['3xl'] : SPACING.xl,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray[300],
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[900],
  },
  closeButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
});
