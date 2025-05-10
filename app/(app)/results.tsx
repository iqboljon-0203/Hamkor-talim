import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useGroupStore } from '@/hooks/useGroupStore';
import { Star, FileText, ChevronLeft } from 'lucide-react-native';
import { router, Redirect } from 'expo-router';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS } = Theme;

export default function SubmissionsScreen() {
  const { user, isTeacher } = useAuth();
  const { submissions, fetchSubmissions, rateSubmission, tasks, fetchTasks } = useTaskStore();
  const { groups } = useGroupStore();

  // Teacher uchun modal state
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  // Student uchun state
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    if (isTeacher) {
      loadTeacherSubmissions();
    } else {
      loadStudentGrades();
    }
  }, [user, isTeacher]);

  // === TEACHER uchun barcha submissions va tasks yuklash ===
  const loadTeacherSubmissions = async () => {
    try {
      for (const group of groups) {
        await fetchTasks(group.id);
      }
      const allTasks = useTaskStore.getState().tasks;
      for (const task of allTasks) {
        await fetchSubmissions(task.id);
      }
    } catch (error) {
      Alert.alert('Xatolik', 'Javoblarni yuklashda xatolik yuz berdi');
    }
  };

  // === STUDENT uchun o‘zining baholari ===
  const loadStudentGrades = async () => {
    await fetchTasks();
    const allTasks = useTaskStore.getState().tasks;
    for (const task of allTasks) {
      await fetchSubmissions(task.id, user.id);
    }
    const mySubs = submissions.filter((s) => s.user_id === user.id);
    setMySubmissions(mySubs);
  };

  // === TEACHER: Baholashni saqlash ===
  const handleRateSubmission = async () => {
    if (!selectedSubmission) return;
    try {
      const result = await rateSubmission(
        selectedSubmission.id,
        rating,
        feedback,
      );
      if (result.success) {
        Alert.alert('Muvaffaqiyatli', 'Javob baholandi');
        setSelectedSubmission(null);
        setRating(0);
        setFeedback('');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      Alert.alert('Xatolik', error.message);
    }
  };

  // === Yordamchi funksiyalar ===
  const getGroupName = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const group = groups.find((g) => g.id === task?.group_id);
    return group?.name || "Noma'lum guruh";
  };

  const getTaskTitle = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.title || "Noma'lum vazifa";
  };

  // === REDIRECT ===
  if (!user) {
    return <Redirect href="/" />;
  }

  // === TEACHER UI ===
  if (isTeacher) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Javoblar</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <TouchableOpacity
                key={submission.id}
                style={styles.submissionCard}
                onPress={() => setSelectedSubmission(submission)}
              >
                <View style={styles.submissionHeader}>
                  <Text style={styles.submissionTitle}>
                    {getTaskTitle(submission.task_id)}
                  </Text>
                  <Text style={styles.submissionGroup}>
                    {getGroupName(submission.task_id)}
                  </Text>
                </View>
                <Text style={styles.submissionStudent}>
                  {submission.users?.full_name || "Noma'lum o'quvchi"}
                </Text>
                <Text style={styles.submissionDate}>
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </Text>
                <Text style={styles.submissionContent}>
                  {submission.content || "Izoh yo'q"}
                </Text>
                {submission.file_url && (
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={() => Linking.openURL(submission.file_url!)}
                  >
                    <FileText size={16} color={COLORS.primary[500]} />
                    <Text style={styles.fileButtonText}>Faylni ko'rish</Text>
                  </TouchableOpacity>
                )}
                {submission.rating && (
                  <View style={styles.ratingContainer}>
                    <Star
                      size={16}
                      color={COLORS.warning[500]}
                      fill={COLORS.warning[500]}
                    />
                    <Text style={styles.ratingText}>{submission.rating}/5</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Hozircha javoblar yo'q</Text>
            </View>
          )}
        </ScrollView>

        {selectedSubmission && (
          <View style={styles.ratingModal}>
            <View style={styles.ratingContent}>
              <Text style={styles.ratingTitle}>Javobni baholash</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Star
                      size={32}
                      color={COLORS.warning[500]}
                      fill={star <= rating ? COLORS.warning[500] : 'none'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Izoh yozing..."
                value={feedback}
                onChangeText={setFeedback}
                multiline
              />
              <View style={styles.ratingButtons}>
                <TouchableOpacity
                  style={[styles.ratingButton, styles.cancelButton]}
                  onPress={() => {
                    setSelectedSubmission(null);
                    setRating(0);
                    setFeedback('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Bekor qilish</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ratingButton, styles.submitButton]}
                  onPress={handleRateSubmission}
                >
                  <Text style={styles.submitButtonText}>Baholash</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // === STUDENT UI ===
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
       <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Baholar</Text>
        </View>
      <ScrollView style={styles.scrollView}>
        {mySubmissions.length > 0 ? (
          mySubmissions.map((submission) => (
            <View key={submission.id} style={styles.gradeCard}>
              <Text style={styles.taskTitle}>
                {tasks.find((t) => t.id === submission.task_id)?.title ||
                  'Nomaʼlum vazifa'}
              </Text>
              <Text style={styles.date}>
                {new Date(submission.submitted_at).toLocaleDateString()}
              </Text>
              <View style={styles.ratingRow}>
                <Star
                  size={18}
                  color={COLORS.warning[500]}
                  fill={submission.rating ? COLORS.warning[500] : 'none'}
                />
                <Text style={styles.ratingText}>
                  {submission.rating
                    ? `${submission.rating}/5`
                    : 'Baholanmagan'}
                </Text>
              </View>
              {submission.feedback && (
                <Text style={styles.feedback}>
                  Ustoz izohi: {submission.feedback}
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Sizda hali baholangan topshiriqlar yo'q
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.gray[50],
    },
    header: {
      backgroundColor: COLORS.primary[500],
      padding: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    backButton: {
      marginRight: SPACING.md,
    },
    headerTitle: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.lg,
      color: COLORS.white,
    },
    scrollView: {
      flex: 1,
      padding: SPACING.md,
    },
    submissionCard: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    },
    submissionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    submissionTitle: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.md,
      color: COLORS.gray[800],
      flex: 1,
    },
    submissionGroup: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      color: COLORS.gray[600],
    },
    submissionStudent: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: COLORS.primary[600],
      marginBottom: SPACING.xs,
    },
    submissionDate: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.xs,
      color: COLORS.gray[500],
      marginBottom: SPACING.xs,
    },
    submissionContent: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      color: COLORS.gray[700],
      marginBottom: SPACING.sm,
    },
    fileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.primary[100],
      padding: SPACING.sm,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginBottom: SPACING.xs,
    },
    fileButtonText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: COLORS.primary[700],
      marginLeft: SPACING.xs,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.sm,
    },
    ratingText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: COLORS.warning[600],
      marginLeft: SPACING.xs,
    },
    emptyContainer: {
      padding: SPACING.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.md,
      color: COLORS.gray[500],
    },
    ratingModal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ratingContent: {
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: SPACING.lg,
      width: '90%',
      maxWidth: 400,
    },
    ratingTitle: {
      fontFamily: FONTS.bold,
      fontSize: FONT_SIZES.lg,
      color: COLORS.gray[800],
      marginBottom: SPACING.lg,
      textAlign: 'center',
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
    },
    feedbackInput: {
      borderWidth: 1,
      borderColor: COLORS.gray[300],
      borderRadius: 8,
      padding: SPACING.sm,
      marginBottom: SPACING.lg,
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    ratingButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    ratingButton: {
      flex: 1,
      padding: SPACING.sm,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: COLORS.gray[200],
      marginRight: SPACING.sm,
    },
    submitButton: {
      backgroundColor: COLORS.primary[500],
      marginLeft: SPACING.sm,
    },
    cancelButtonText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: COLORS.gray[700],
    },
    submitButtonText: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.sm,
      color: COLORS.white,
    },
    // Student uchun baholar (grades) kartasi
    gradeCard: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      ...SHADOWS.sm,
    },
    taskTitle: {
      fontFamily: FONTS.medium,
      fontSize: FONT_SIZES.md,
      color: COLORS.gray[800],
      marginBottom: SPACING.xs,
    },
    date: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.xs,
      color: COLORS.gray[500],
      marginBottom: SPACING.xs,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.xs,
    },
    feedback: {
      fontFamily: FONTS.regular,
      fontSize: FONT_SIZES.sm,
      color: COLORS.gray[700],
      marginTop: SPACING.xs,
    },
  });