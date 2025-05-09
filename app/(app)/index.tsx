import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useGroupStore } from '@/hooks/useGroupStore';
import { Task, Group, Submission } from '@/lib/supabase';
import { router } from 'expo-router';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronRight,
  FileText,
  Edit2,
  Calendar,
} from 'lucide-react-native';
import TaskModal from '@/components/ui/TaskModal';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS } = Theme;

export default function HomeScreen() {
  const { user, isTeacher } = useAuth();
  const {
    tasks,
    fetchTasks,
    createTask,
    updateTask,
    submissions,
    fetchSubmissions,
  } = useTaskStore();
  const { groups, fetchGroups } = useGroupStore();
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    await fetchGroups(user.id, isTeacher);
    const currentGroups = useGroupStore.getState().groups;

    await Promise.all(currentGroups.map((group) => fetchTasks(group.id)));
    const currentTasks = useTaskStore.getState().tasks;

    const allTaskIds = currentTasks.map((task) => task.id);
    if (allTaskIds.length > 0) {
      if (isTeacher) {
        await fetchSubmissions(allTaskIds);
        const currentSubmissions = useTaskStore.getState().submissions;
        const allSubmissions = currentSubmissions.filter((sub) =>
          allTaskIds.includes(sub.task_id),
        );
        const recentSubs = allSubmissions
          .sort(
            (a, b) =>
              new Date(b.submitted_at).getTime() -
              new Date(a.submitted_at).getTime(),
          )
          .slice(0, 5);
        setRecentSubmissions(recentSubs);
      } else {
        await fetchSubmissions(allTaskIds, user.id);
        const currentSubmissions = useTaskStore.getState().submissions;
        const mySubs = currentSubmissions.filter(
          (sub) => sub.user_id === user.id,
        );
        const recentSubs = mySubs
          .sort(
            (a, b) =>
              new Date(b.submitted_at).getTime() -
              new Date(a.submitted_at).getTime(),
          )
          .slice(0, 5);
        setRecentSubmissions(recentSubs);
      }
    } else {
      setRecentSubmissions([]);
    }
  };

  useEffect(() => {
    // Filter upcoming tasks (due in the next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcoming = tasks.filter((task) => {
      const dueDate = new Date(task.due_date);
      return dueDate >= now && dueDate <= nextWeek;
    });

    // Sort by due date (ascending)
    upcoming.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    );

    setUpcomingTasks(upcoming.slice(0, 3)); // Show top 3 upcoming tasks
  }, [tasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGroupById = (groupId: string) => {
    return groups.find((group) => group.id === groupId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isDueSoon = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  const handleTaskPress = (task: Task) => {
    if (isTeacher) {
      setSelectedTask(task);
      setTaskModalVisible(true);
    } else {
      router.push(`/task-detail/${task.id}`);
    }
  };

  const handleUpdateTask = async (taskData: {
    title: string;
    description: string;
    due_date: string;
    file?: { uri: string; type: string; name: string };
  }) => {
    if (selectedTask) {
      try {
        const result = await updateTask(selectedTask.id, taskData);
        if (!result.success) {
          throw new Error(
            result.error || 'Vazifani yangilashda xatolik yuz berdi',
          );
        }
        // Vazifalar ro'yxatini yangilash
        await loadData();
        setTaskModalVisible(false);
        setSelectedTask(null);
      } catch (error: any) {
        Alert.alert('Xatolik', error.message);
      }
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    due_date: string;
    file?: { uri: string; type: string; name: string };
  }) => {
    if (user) {
      try {
        const result = await createTask(
          {
            ...taskData,
            created_by: user.id,
          },
          taskData.file,
        );

        if (!result.success) {
          throw new Error(
            result.error || 'Vazifa yaratishda xatolik yuz berdi',
          );
        }

        // Vazifalar ro'yxatini yangilash
        await loadData();
        setTaskModalVisible(false);
      } catch (error: any) {
        Alert.alert('Xatolik', error.message);
      }
    }
  };

  // Yaqinlashgan 3 ta vazifani olish uchun
  const sortedTasks = tasks
    .filter((task) => new Date(task.due_date) >= new Date())
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    )
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Salom, {user?.full_name?.split(' ')[0] || 'there'}
            </Text>
            <Text style={styles.role}>{isTeacher ? 'Teacher' : 'Student'}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statsIconContainer}>
              <BookOpen size={24} color={COLORS.primary[500]} />
            </View>
            <Text style={styles.statsValue}>{groups.length}</Text>
            <Text style={styles.statsLabel}>
              {isTeacher ? 'Guruhlar' : 'Darslar'}
            </Text>
          </View>

          <View style={styles.statsCard}>
            <View
              style={[
                styles.statsIconContainer,
                { backgroundColor: COLORS.accent[100] },
              ]}
            >
              <Clock size={24} color={COLORS.accent[500]} />
            </View>
            <Text style={styles.statsValue}>{upcomingTasks.length}</Text>
            <Text style={styles.statsLabel}>Yaqin vazifalar</Text>
          </View>

          <View style={styles.statsCard}>
            <View
              style={[
                styles.statsIconContainer,
                { backgroundColor: COLORS.success[100] },
              ]}
            >
              <CheckCircle2 size={24} color={COLORS.success[500]} />
            </View>
            <Text style={styles.statsValue}>
              {isTeacher
                ? recentSubmissions.length
                : submissions.filter((s) => s.user_id === user?.id).length}
            </Text>
            <Text style={styles.statsLabel}>
              {isTeacher ? 'Oxirgi javoblar' : 'Bajarilgan'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Yaqinlashgan Vazifalar</Text>

          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <Card
                key={task.id}
                style={styles.taskCard}
                onPress={() => handleTaskPress(task)}
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                <Text style={styles.taskGroup}>
                  {getGroupById(task.group_id)?.name || "Noma'lum guruh"}
                </Text>
                <Text numberOfLines={2} style={styles.taskDescription}>
                  {task.description}
                </Text>
                <View style={styles.taskMeta}>
                  <Calendar size={16} color={COLORS.gray[500]} />
                  <Text style={styles.taskDate}>
                    Muddat: {formatDate(task.due_date)}
                  </Text>
                </View>
                {isDueSoon(task.due_date) && (
                  <View style={styles.dueSoonContainer}>
                    <AlertCircle size={16} color={COLORS.warning[500]} />
                    <Text style={styles.dueSoonText}>
                      Tez orada muddati tugaydi
                    </Text>
                  </View>
                )}
              </Card>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Yaqinlashgan vazifalar yo'q</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isTeacher ? 'Oxirgi javoblar' : "So'nggi faollik"}
            </Text>
          </View>

          {isTeacher ? (
            recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => (
                <View key={submission.id} style={styles.submissionCard}>
                  <View style={styles.submissionHeader}>
                    <Text style={styles.submissionTitle}>
                      {tasks.find((t) => t.id === submission.task_id)?.title ||
                        'Unknown Task'}
                    </Text>
                    <Text style={styles.submissionDate}>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.submissionDescription}>
                    {submission.content || 'No description provided'}
                  </Text>
                  {submission.file_url && (
                    <TouchableOpacity
                      style={styles.submissionFile}
                      onPress={() => Linking.openURL(submission.file_url!)}
                    >
                      <FileText size={16} color={COLORS.primary[500]} />
                      <Text style={styles.submissionFileText}>
                        View Submission File
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No recent submissions</Text>
              </View>
            )
          ) : recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission) => (
              <View key={submission.id} style={styles.submissionCard}>
                <View style={styles.submissionHeader}>
                  <Text style={styles.submissionTitle}>
                    {tasks.find((t) => t.id === submission.task_id)?.title ||
                      'Nomaʼlum vazifa'}
                  </Text>
                  <Text style={styles.submissionDate}>
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.submissionDescription}>
                  {submission.content || 'Izoh yoʻq'}
                </Text>
                {submission.file_url && (
                  <TouchableOpacity
                    style={styles.submissionFile}
                    onPress={() => Linking.openURL(submission.file_url!)}
                  >
                    <FileText size={16} color={COLORS.primary[500]} />
                    <Text style={styles.submissionFileText}>
                      Yuborilgan faylni ko'rish
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Sizda hali topshirilgan vazifalar yo'q
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TaskModal
        isVisible={isTaskModalVisible}
        onClose={() => {
          setTaskModalVisible(false);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        initialData={selectedTask ? selectedTask : undefined}
      />
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
  },
  role: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: -SPACING.xl,
    marginHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    width: '30%',
    ...SHADOWS.md,
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statsValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[800],
    textAlign: 'center',
  },
  statsLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  taskCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  taskTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
    flex: 1,
  },
  taskGroup: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  taskDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginTop: SPACING.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  taskDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginLeft: SPACING.xs,
  },
  dueSoonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  dueSoonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning[600],
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
  },
  viewAllButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary[600],
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary[600],
    marginRight: SPACING.xs,
  },
  tasksScrollContent: {
    padding: SPACING.md,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  editButton: {
    padding: SPACING.xs,
  },
  submissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  submissionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
  },
  submissionDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  submissionDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  submissionFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[100],
    padding: SPACING.sm,
    borderRadius: 4,
  },
  submissionFileText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[700],
    marginLeft: SPACING.xs,
  },
});
