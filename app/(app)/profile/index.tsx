import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile, getFileUrl, supabase } from '@/lib/supabase';
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
      Alert.alert('Xatolik', error.message);
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
        Alert.alert(
          'Ruxsat kerak',
          'Rasmlaringizga kirish uchun ruxsat bering',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) {
          uploadProfileImage(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Xatolik', 'Rasmni tanlashda xatolik yuz berdi');
    }
  };

  const uploadProfileImage = async (uri: string) => {
    if (!user) return;

    setLoading(true);

    try {
      // Get file extension
      const fileExtension = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}_${Date.now()}.${fileExtension}`;
      const filePath = `avatars/${fileName}`;

      // Convert URI to blob with error handling
      let blob;
      try {
        const response = await fetch(uri);
        if (!response.ok) throw new Error('Network response was not ok');
        blob = await response.blob();
      } catch (error) {
        console.error('Error converting image to blob:', error);
        throw new Error('Rasmni yuklash uchun tayyorlashda xatolik yuz berdi');
      }

      // Upload to Supabase with retry logic
      let uploadError = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const { error } = await supabase.storage
            .from('avatars')
            .upload(filePath, blob, {
              contentType: `image/${fileExtension}`,
              upsert: true,
              cacheControl: '3600',
            });

          if (!error) {
            uploadError = null;
            break;
          }
          uploadError = error;
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount),
            );
          }
        } catch (err) {
          uploadError = err;
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount),
            );
          }
        }
      }

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

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
      Alert.alert(
        'Xatolik',
        "Rasmni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring",
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
          <Text style={styles.sectionTitle}>Shaxsiy ma’lumotlar</Text>

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
