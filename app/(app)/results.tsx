import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useGroupStore } from '@/hooks/useGroupStore';
import { Star, FileText, TrendingUp, Award } from 'lucide-react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { Task, Submission } from '@/lib/supabase';
import AppHeader from '@/components/ui/AppHeader';
import ProgressBar from '@/components/ui/ProgressBar';
import Avatar from '@/components/ui/Avatar';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from 'react-native-modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } = Theme;

export default function ResultsScreen() {
  const { user, isTeacher } = useAuth();
  const { showToast } = useToast();
  const { submissions, fetchSubmissions, rateSubmission, tasks, fetchTasks } = useTaskStore();
  const { groups, fetchGroups } = useGroupStore();

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (!isTeacher && user) {
      const mine = submissions.filter((s) => s.user_id === user.id);
      setMySubmissions(mine);
    }
  }, [submissions, isTeacher, user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      if (isTeacher) loadTeacherSubmissions();
      else loadStudentGrades();
    }, [user?.id, isTeacher]),
  );

  const loadTeacherSubmissions = async () => {
    if (!user) return;
    try {
      await fetchGroups(user.id, isTeacher);
      const currentGroups = useGroupStore.getState().groups;
      const teacherGroups = currentGroups.filter((group) => group.created_by === user.id);
      const teacherGroupIds = teacherGroups.map((g) => g.id);
      if (teacherGroupIds.length > 0) {
        await useTaskStore.getState().fetchTasksByGroupIds(teacherGroupIds);
      }
      const allTasks = useTaskStore.getState().tasks;
      const teacherTasks = allTasks.filter((task) => teacherGroupIds.includes(task.group_id));
      const teacherTaskIds = teacherTasks.map((t) => t.id);
      if (teacherTaskIds.length > 0) {
        await fetchSubmissions(teacherTaskIds);
      }
    } catch (error) {
      showToast('Javoblarni yuklashda xatolik yuz berdi', 'error');
    }
  };

  const loadStudentGrades = async () => {
    if (!user) return;
    try {
      await fetchGroups(user.id, isTeacher);
      const currentGroups = useGroupStore.getState().groups;
      const studentGroupIds = currentGroups.map((g) => g.id);
      if (studentGroupIds.length > 0) {
        await useTaskStore.getState().fetchTasksByGroupIds(studentGroupIds);
      }
      const allTasks = useTaskStore.getState().tasks;
      const studentTasks = allTasks.filter((task) => studentGroupIds.includes(task.group_id));
      const studentTaskIds = studentTasks.map((t) => t.id);
      if (studentTaskIds.length > 0) {
        await fetchSubmissions(studentTaskIds, user.id);
      }
      const currentSubmissions = useTaskStore.getState().submissions;
      const mySubs = currentSubmissions.filter((s) => s.user_id === user.id);
      setMySubmissions(mySubs);
    } catch (error) {
      showToast('Baholarni yuklashda xatolik yuz berdi', 'error');
    }
  };

  const handleRateSubmission = async () => {
    if (!selectedSubmission) return;
    try {
      const result = await rateSubmission(selectedSubmission.id, rating, feedback);
      if (result.success) {
        showToast('Javob baholandi', 'success');
        setSelectedSubmission(null);
        setRating(0);
        setFeedback('');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  const getGroupName = (taskId: string) => {
    const currentTasks = useTaskStore.getState().tasks;
    const currentGroups = useGroupStore.getState().groups;
    const task = currentTasks.find((t) => t.id === taskId);
    const group = currentGroups.find((g) => g.id === task?.group_id);
    return group?.name || "Noma'lum guruh";
  };

  const getTaskTitle = (taskId: string) => {
    const currentTasks = useTaskStore.getState().tasks;
    const task = currentTasks.find((t) => t.id === taskId);
    return task?.title || "Noma'lum vazifa";
  };

  if (!user) return <Redirect href="/(auth)/login" />;

  // Compute stats
  const totalSubmissions = isTeacher
    ? submissions.filter(s => {
        const currentGroups = useGroupStore.getState().groups;
        const teacherGroupIds = currentGroups.filter(g => g.created_by === user.id).map(g => g.id);
        const currentTasks = useTaskStore.getState().tasks;
        const teacherTaskIds = currentTasks.filter(t => teacherGroupIds.includes(t.group_id)).map(t => t.id);
        return teacherTaskIds.includes(s.task_id);
      })
    : mySubmissions;

  const avgGrade = totalSubmissions.length > 0
    ? Math.round(totalSubmissions.filter(s => s.rating != null).reduce((sum, s) => sum + (s.rating || 0), 0) / Math.max(totalSubmissions.filter(s => s.rating != null).length, 1))
    : 0;

  // === TEACHER UI ===
  if (isTeacher) {
    const currentGroups = useGroupStore.getState().groups;
    const teacherGroupIds = currentGroups.filter((group) => group.created_by === user?.id).map((g) => g.id);
    const currentTasks = useTaskStore.getState().tasks;
    const teacherTaskIds = currentTasks.filter((task) => teacherGroupIds.includes(task.group_id)).map((t) => t.id);
    const teacherSubmissions = submissions.filter((submission) => teacherTaskIds.includes(submission.task_id));

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader subtitle="Natijalar" />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsCardHeader}>
              <View>
                <Text style={styles.statsCardLabel}>AKADEMIK HOLAT</Text>
                <Text style={styles.statsCardTitle}>Guruh umumiy statistikasi</Text>
              </View>
              <View style={styles.trendBadge}>
                <TrendingUp size={12} color={COLORS.success[600]} />
                <Text style={styles.trendText}>+{totalSubmissions.length}</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>{avgGrade > 0 ? `${avgGrade}%` : '—'}</Text>
                <Text style={styles.statItemLabel}>O'rtacha ball</Text>
                {avgGrade > 0 && <ProgressBar value={avgGrade} height={4} />}
              </View>
              <View style={[styles.statItem, styles.statItemBorder]}>
                <Text style={styles.statItemValue}>{teacherSubmissions.length}</Text>
                <Text style={styles.statItemLabel}>Jami javoblar</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statItemValue}>{tasks.length}</Text>
                <Text style={styles.statItemLabel}>Vazifalar</Text>
              </View>
            </View>
          </View>

          {/* Submissions List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Umumiy javoblar ro'yxati</Text>

            {teacherSubmissions.length > 0 ? (
              teacherSubmissions.map((submission, idx) => (
                <TouchableOpacity
                  key={submission.id}
                  style={styles.submissionRow}
                  onPress={() => setSelectedSubmission(submission)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submissionRank}>#{idx + 1}</Text>
                  <Avatar
                    size="sm"
                    name={submission.profile?.full_name || '?'}
                  />
                  <View style={styles.submissionInfo}>
                    <Text style={styles.submissionName}>
                      {submission.profile?.full_name || "Noma'lum"}
                    </Text>
                    <Text style={styles.submissionMeta}>
                      {getTaskTitle(submission.task_id)}
                    </Text>
                  </View>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreText}>
                      {submission.rating != null ? submission.rating : '—'}
                    </Text>
                    <Text style={styles.scoreLabel}>ball</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <FileText size={36} color={COLORS.gray[300]} />
                <Text style={styles.emptyText}>Hozircha javoblar yo'q</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Rating Modal */}
        <Modal
          isVisible={!!selectedSubmission}
          onBackdropPress={() => { setSelectedSubmission(null); setRating(0); setFeedback(''); }}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropTransitionOutTiming={0}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Javobni baholash</Text>
            <Text style={styles.modalSubtitle}>
              {selectedSubmission?.profile?.full_name || "Talaba"} — {getTaskTitle(selectedSubmission?.task_id || '')}
            </Text>

            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                  <Star
                    size={36}
                    color={COLORS.warning[500]}
                    fill={star <= rating ? COLORS.warning[500] : 'none'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Izoh"
              placeholder="Talabaga izoh yozing..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Bekor qilish"
                onPress={() => { setSelectedSubmission(null); setRating(0); setFeedback(''); }}
                type="outline"
                style={styles.modalButton}
              />
              <Button
                title="Baholash"
                onPress={handleRateSubmission}
                gradient
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // === STUDENT UI ===
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader subtitle="Natijalar" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsCardHeader}>
            <View>
              <Text style={styles.statsCardLabel}>MENING NATIJALARIM</Text>
              <Text style={styles.statsCardTitle}>Umumiy statistika</Text>
            </View>
            <View style={styles.awardCircle}>
              <Award size={20} color={COLORS.primary[500]} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{avgGrade > 0 ? `${avgGrade}` : '—'}</Text>
              <Text style={styles.statItemLabel}>O'rtacha ball</Text>
              {avgGrade > 0 && <ProgressBar value={avgGrade} height={4} />}
            </View>
            <View style={[styles.statItem, styles.statItemBorder]}>
              <Text style={styles.statItemValue}>{mySubmissions.length}</Text>
              <Text style={styles.statItemLabel}>Topshirilgan</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statItemValue}>{tasks.length}</Text>
              <Text style={styles.statItemLabel}>Jami vazifa</Text>
            </View>
          </View>
        </View>

        {/* My Grades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mening baholarim</Text>

          {mySubmissions.length > 0 ? (
            mySubmissions.map((submission) => {
              const currentTasks = useTaskStore.getState().tasks;
              const taskTitle = currentTasks.find((t) => t.id === submission.task_id)?.title || 'Nomaʼlum vazifa';
              return (
                <View key={submission.id} style={styles.gradeCard}>
                  <View style={styles.gradeCardLeft}>
                    <Text style={styles.gradeTaskTitle}>{taskTitle}</Text>
                    <Text style={styles.gradeDate}>
                      {new Date(submission.submitted_at).toLocaleDateString('uz-UZ')}
                    </Text>
                    {submission.feedback && (
                      <Text style={styles.gradeFeedback} numberOfLines={2}>
                        💬 {submission.feedback}
                      </Text>
                    )}
                  </View>
                  <View style={styles.gradeScoreCircle}>
                    <Text style={styles.gradeScoreText}>
                      {submission.rating != null ? submission.rating : '—'}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Star size={36} color={COLORS.gray[300]} />
              <Text style={styles.emptyText}>Hali baholar yo'q</Text>
              <Text style={styles.emptySubText}>Vazifalarni bajaring va natijalarni kuzating</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  // Stats Card
  statsCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.lg,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statsCardLabel: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.gray[400],
    letterSpacing: 1,
    marginBottom: 2,
  },
  statsCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[900],
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  trendText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.success[600],
  },
  awardCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.gray[100],
  },
  statItemValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.gray[900],
  },
  statItemLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 2,
    marginBottom: SPACING.xs,
  },
  // Section
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  // Submission Row (Teacher)
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    gap: SPACING.md,
  },
  submissionRank: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary[500],
    width: 30,
  },
  submissionInfo: {
    flex: 1,
  },
  submissionName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
  },
  submissionMeta: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  scoreText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary[600],
  },
  scoreLabel: {
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.primary[400],
  },
  // Grade Card (Student)
  gradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  gradeCardLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  gradeTaskTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
  },
  gradeDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  gradeFeedback: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
  gradeScoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary[200],
  },
  gradeScoreText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary[600],
  },
  // Empty
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    gap: SPACING.sm,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
  },
  emptySubText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
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
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  starBtn: {
    padding: SPACING.xs,
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