import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { useGroupStore } from '@/hooks/useGroupStore';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AppHeader from '@/components/ui/AppHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile, supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import {
  Camera,
  LogOut,
  User2,
  Mail,
  Lock,
  Bell,
  Edit3,
  ChevronRight,
  Moon,
  Globe,
  CalendarSync,
  HelpCircle,
  Info,
  Shield,
  Users,
  Zap,
  Clock,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Modal from 'react-native-modal';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } = Theme;

export default function ProfileScreen() {
  const {
    user,
    signOut,
    refreshProfile,
    isTeacher,
    updateProfileName,
    updatePassword,
  } = useAuth();
  const { showToast } = useToast();
  const { groups } = useGroupStore();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Edit profile modal state
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security / change password modal state
  const [isSecurityModalVisible, setSecurityModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification settings modal state
  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);
  const [taskRemindersEnabled, setTaskRemindersEnabled] = useState(true);
  const [gradeAlertsEnabled, setGradeAlertsEnabled] = useState(true);

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (user?.avatar_url) setImageUri(user.avatar_url);
    if (user?.full_name) setEditFullName(user.full_name);
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      showToast(error.message, 'error');
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Rasmlaringizga kirish uchun ruxsat bering', 'error');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const asset = result.assets[0];
        await uploadProfileImage({
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || asset.uri.split('/').pop() || 'avatar.jpg',
        });
      }
    } catch (error) {
      showToast('Rasmni tanlashda xatolik yuz berdi', 'error');
    }
  };

  const uploadProfileImage = async ({ uri, mimeType, fileName }: { uri: string; mimeType: string; fileName: string }) => {
    if (!user) return;
    setLoading(true);
    try {
      const extension = fileName.split('.').pop() || mimeType.split('/').pop() || 'jpg';
      const normalizedMimeType = mimeType || `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      const remoteFileName = `${Date.now()}.${extension}`;
      const remotePath = `${user.id}/${remoteFileName}`;
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error('Tanlangan rasm topilmadi');
      await uploadFile('avatars', remotePath, uri, normalizedMimeType, true);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(remotePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      setImageUri(publicUrl);
      await refreshProfile();
      showToast('Profil rasmi muvaffaqiyatli yangilandi', 'success');
    } catch (error: any) {
      showToast(error.message || 'Rasmni yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFullName = async () => {
    if (!editFullName.trim()) {
      showToast('Iltimos, ism va familiyangizni kiriting', 'error');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const { error } = await updateProfileName(editFullName);
      if (error) {
        showToast(error.message || 'Profilni yangilashda xatolik', 'error');
      } else {
        showToast('Profil muvaffaqiyatli yangilandi', 'success');
        setEditProfileVisible(false);
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Parollar bir-biriga mos kelmadi', 'error');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        showToast(error.message || 'Parolni yangilashda xatolik', 'error');
      } else {
        showToast('Parolingiz muvaffaqiyatli yangilandi', 'success');
        setSecurityModalVisible(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  const renderSettingRow = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
  ) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View style={styles.settingIconWrap}>{icon}</View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <ChevronRight size={18} color={COLORS.gray[400]} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader subtitle="Profil" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <Avatar
                size="2xl"
                source={imageUri ? { uri: imageUri } : null}
                name={user.full_name}
              />
            </View>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handleImagePick}
              disabled={loading}
            >
              <Camera size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <StatusBadge
              status="active"
              label={isTeacher ? "Katta O'qituvchi / Mentor" : "Talaba"}
              size="md"
            />
          </View>

          {/* Mini Stats */}
          <View style={styles.miniStats}>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatValue}>{groups.length}</Text>
              <Text style={styles.miniStatLabel}>Guruhlar</Text>
            </View>
            <View style={[styles.miniStatItem, styles.miniStatBorder]}>
              <Text style={styles.miniStatValue}>—</Text>
              <Text style={styles.miniStatLabel}>{isTeacher ? 'Talabalar' : 'Topshirilgan'}</Text>
            </View>
            <View style={styles.miniStatItem}>
              <Text style={styles.miniStatValue}>98%</Text>
              <Text style={styles.miniStatLabel}>{isTeacher ? 'Javob tezligi' : 'Faollik'}</Text>
            </View>
          </View>
        </View>

        {/* HISOB MA'LUMOTLARI */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionLabel}>HISOB MA'LUMOTLARI</Text>
          <View style={styles.sectionCard}>
            {renderSettingRow(
              <Edit3 size={18} color={COLORS.primary[500]} />,
              'Profilni tahrirlash',
              "Ism va rasmingizni o'zgartiring",
              () => setEditProfileVisible(true),
            )}
            {renderSettingRow(
              <Shield size={18} color={COLORS.primary[500]} />,
              'Parol va Xavfsizlik',
              undefined,
              () => setSecurityModalVisible(true),
              <View style={styles.securityBadgeRow}>
                <StatusBadge status="active" label="2FA" />
                <ChevronRight size={18} color={COLORS.gray[400]} />
              </View>,
            )}
            {renderSettingRow(
              <Bell size={18} color={COLORS.primary[500]} />,
              'Bildirishnomalar',
              undefined,
              () => setNotificationModalVisible(true),
              <Switch
                value={taskRemindersEnabled}
                onValueChange={(val) => setTaskRemindersEnabled(val)}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
                thumbColor={taskRemindersEnabled ? COLORS.primary[500] : COLORS.gray[400]}
              />,
            )}
          </View>
        </View>

        {/* ILOVA SOZLAMALARI */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionLabel}>ILOVA SOZLAMALARI</Text>
          <View style={styles.sectionCard}>
            {renderSettingRow(
              <Moon size={18} color={COLORS.primary[500]} />,
              'Tungi rejim',
              undefined,
              undefined,
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
                thumbColor={darkMode ? COLORS.primary[500] : COLORS.gray[400]}
              />,
            )}
            {renderSettingRow(
              <Globe size={18} color={COLORS.primary[500]} />,
              'Ilova tili',
              undefined,
              undefined,
              <Text style={styles.settingValue}>O'zbekcha (Lotin)</Text>,
            )}
          </View>
        </View>

        {/* YORDAM VA TIZIM */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionLabel}>YORDAM VA TIZIM</Text>
          <View style={styles.sectionCard}>
            {renderSettingRow(
              <HelpCircle size={18} color={COLORS.primary[500]} />,
              "Qo'llab-quvvatlash xizmati",
              undefined,
              () => {},
            )}
            {renderSettingRow(
              <Info size={18} color={COLORS.primary[500]} />,
              'Ilova haqida',
              undefined,
              undefined,
              <Text style={styles.settingValue}>v2.4.0</Text>,
            )}
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <Button
            title="Tizimdan chiqish"
            onPress={handleSignOut}
            type="danger"
            fullWidth
            size="lg"
            icon={<LogOut size={18} color={COLORS.white} />}
          />
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Hamkor Ta'lim Enterprise • Barcha huquqlar himoyalangan
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        isVisible={isEditProfileVisible}
        onBackdropPress={() => setEditProfileVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        avoidKeyboard={true}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Profilni tahrirlash</Text>
          <Input
            label="To'liq ism"
            placeholder="Ism va familiya"
            value={editFullName}
            onChangeText={setEditFullName}
            icon={<User2 size={18} color={COLORS.gray[400]} />}
          />
          <View style={styles.modalButtons}>
            <Button
              title="Bekor qilish"
              onPress={() => setEditProfileVisible(false)}
              type="outline"
              style={styles.modalButton}
            />
            <Button
              title="Saqlash"
              onPress={handleUpdateFullName}
              loading={isUpdatingProfile}
              gradient
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Security Modal */}
      <Modal
        isVisible={isSecurityModalVisible}
        onBackdropPress={() => setSecurityModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        avoidKeyboard={true}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Parolni o'zgartirish</Text>
          <Input
            label="Yangi parol"
            placeholder="Yangi parolni kiriting"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            icon={<Lock size={18} color={COLORS.gray[400]} />}
          />
          <Input
            label="Parolni tasdiqlang"
            placeholder="Qayta kiriting"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            icon={<Lock size={18} color={COLORS.gray[400]} />}
          />
          <View style={styles.modalButtons}>
            <Button
              title="Bekor qilish"
              onPress={() => { setSecurityModalVisible(false); setNewPassword(''); setConfirmPassword(''); }}
              type="outline"
              style={styles.modalButton}
            />
            <Button
              title="O'zgartirish"
              onPress={handleChangePassword}
              loading={isUpdatingPassword}
              gradient
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Notification Modal */}
      <Modal
        isVisible={isNotificationModalVisible}
        onBackdropPress={() => setNotificationModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
        hideModalContentWhileAnimating={true}
        useNativeDriver={true}
        avoidKeyboard={true}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Bildirishnoma sozlamalari</Text>
          <View style={styles.notifRow}>
            <Text style={styles.notifRowLabel}>Vazifa eslatmalari</Text>
            <Switch
              value={taskRemindersEnabled}
              onValueChange={setTaskRemindersEnabled}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
              thumbColor={taskRemindersEnabled ? COLORS.primary[500] : COLORS.gray[400]}
            />
          </View>
          <View style={styles.notifRow}>
            <Text style={styles.notifRowLabel}>Baho bildirishnomalari</Text>
            <Switch
              value={gradeAlertsEnabled}
              onValueChange={setGradeAlertsEnabled}
              trackColor={{ false: COLORS.gray[300], true: COLORS.primary[200] }}
              thumbColor={gradeAlertsEnabled ? COLORS.primary[500] : COLORS.gray[400]}
            />
          </View>
          <Button
            title="Saqlash"
            onPress={() => { setNotificationModalVisible(false); showToast('Sozlamalar saqlandi', 'success'); }}
            gradient
            fullWidth
            style={{ marginTop: SPACING.lg }}
          />
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
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: SPACING['3xl'],
  },
  // Profile Card
  profileCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: COLORS.primary[300],
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    marginBottom: SPACING.lg,
  },
  // Mini Stats
  miniStats: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  miniStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.gray[100],
  },
  miniStatValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[900],
  },
  miniStatLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  // Section Groups
  sectionGroup: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.gray[400],
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[50],
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
  },
  settingSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 1,
  },
  settingValue: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  // Sign Out
  signOutSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  // Footer
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  // Modal
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
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  modalButton: {
    minWidth: 110,
  },
  // Notification modal
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  notifRowLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
  },
});
