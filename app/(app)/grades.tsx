import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/hooks/useTaskStore';
import { Star } from 'lucide-react-native';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS } = Theme;

export default function GradesScreen() {
  const { user } = useAuth();
  const { submissions, fetchSubmissions, tasks, fetchTasks } = useTaskStore();
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadGrades();
    }
  }, [user]);

  const loadGrades = async () => {
    // Barcha topshiriqlar uchun o'zining javoblarini va baholarini olish
    for (const task of tasks) {
      await fetchSubmissions(task.id, user.id);
    }
    const mySubs = submissions.filter((s) => s.user_id === user.id);
    setMySubmissions(mySubs);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Baholar</Text>
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
              Sizda hali baholangan topshiriqlar yoʻq
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
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[800],
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
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
  ratingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning[600],
    marginLeft: SPACING.xs,
  },
  feedback: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginTop: SPACING.xs,
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
});
