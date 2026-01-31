import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile, supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import {
  Camera,
  LogOut,
  User2,
  Mail,
  BookOpen,
  School,
} from 'lucide-react-native';
import { router } from 'expo-router';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS } = Theme;

export default function ProfileScreen() {
  const { user, signOut, refreshProfile, isTeacher } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (user?.avatar_url) {
      setImageUri(user.avatar_url);
    }
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      showToast(error.message, 'error');
    } else {
      router.replace('/login');
    }
  };

  const handleImagePick = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        showToast("Rasmlaringizga kirish uchun ruxsat bering", 'error');
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
      } else {
        console.log('[Profile] Image pick cancelled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('Rasmni tanlashda xatolik yuz berdi', 'error');
    }
  };

  const uploadProfileImage = async ({
    uri,
    mimeType,
    fileName,
  }: {
    uri: string;
    mimeType: string;
    fileName: string;
  }) => {
    if (!user) {
      console.warn('[Profile] User not found during avatar upload');
      return;
    }

    setLoading(true);

    try {
      console.log('[Profile] Upload avatar start', {
        uri,
        mimeType,
        fileName,
      });

      const extension =
        fileName.split('.').pop() ||
        mimeType.split('/').pop() ||
        'jpg';
      const normalizedMimeType =
        mimeType || `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      const remoteFileName = `${Date.now()}.${extension}`;
      const remotePath = `${user.id}/${remoteFileName}`;

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.warn('[Profile] Image file not found at URI', uri);
        throw new Error('Tanlangan rasm topilmadi');
      }

      await uploadFile(
        'avatars',
        remotePath,
        uri,
        normalizedMimeType,
        true,
      );

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(remotePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setImageUri(publicUrl);
      await refreshProfile();
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast(
        "Rasmni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring",
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Avatar
              size="xl"
              source={imageUri ? { uri: imageUri } : null}
              name={user.full_name}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleImagePick}
              disabled={loading}
            >
              <Camera size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userRole}>
            {isTeacher ? 'Teacher' : 'Student'}
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Shaxsiy ma'lumotlar</Text>

          <View style={styles.infoItem}>
            <User2 size={20} color={COLORS.gray[600]} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Ism va familya</Text>
              <Text style={styles.infoValue}>{user.full_name}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Mail size={20} color={COLORS.gray[600]} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            {isTeacher ? (
              <BookOpen size={20} color={COLORS.gray[600]} />
            ) : (
              <School size={20} color={COLORS.gray[600]} />
            )}
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Holati</Text>
              <Text style={styles.infoValue}>
                {isTeacher ? 'Teacher' : 'Student'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ilova sozlamalari</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Profil tahrirlash</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Bildirishnoma sozlamalari</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Xavfsizlik sozlamalari</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Chiqish"
          onPress={handleSignOut}
          type="outline"
          icon={<LogOut size={20} color={COLORS.error[500]} />}
          textStyle={styles.signOutText}
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['2xl'],
  },
  header: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary[500],
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  userRole: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    margin: SPACING.md,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  infoTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  infoValue: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
  },
  settingItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  settingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
  },
  signOutButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderColor: COLORS.error[500],
  },
  signOutText: {
    color: COLORS.error[500],
  },
});
