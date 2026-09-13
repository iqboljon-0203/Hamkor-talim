import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Theme from '@/constants/Theme';
import { GRADIENTS, STATUS_COLORS } from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/ui/Card';
import AppHeader from '@/components/ui/AppHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import Skeleton from '@/components/ui/Skeleton';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useGroupStore } from '@/hooks/useGroupStore';
import { Task, Group, Submission } from '@/lib/supabase';
import { router } from 'expo-router';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  Plus,
  Search,
  ChevronRight,
  ArrowRight,
} from 'lucide-react-native';
import TaskModal from '@/components/ui/TaskModal';
import Avatar from '@/components/ui/Avatar';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } = Theme;

export default function HomeScreen() {
  const { user, isTeacher } = useAuth();
  const {
    tasks,
    fetchTasks,
    createTask,
    updateTask,
    submissions,
    fetchSubmissions,
    loading: tasksLoading,
  } = useTaskStore();
  const { showToast } = useToast();
  const { groups, fetchGroups, loading: groupsLoading } = useGroupStore();
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);

  const isLoading = tasksLoading || groupsLoading;

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    await fetchGroups(user.id, isTeacher);
    const currentGroups = useGroupStore.getState().groups;

    if (isTeacher) {
      const teacherGroups = currentGroups.filter(
        (group) => group.created_by === user.id,
      );
      const groupIds = teacherGroups.map(g => g.id);
      if (groupIds.length > 0) {
        await useTaskStore.getState().fetchTasksByGroupIds(groupIds);
      }
    } else {
      const studentGroupIds = currentGroups.map((group) => group.id);
      if (studentGroupIds.length > 0) {
        await useTaskStore.getState().fetchTasksByGroupIds(studentGroupIds);
      }
    }

    const currentTasks = useTaskStore.getState().tasks;
    const visibleTasks = isTeacher
      ? currentTasks.filter((task) => task.created_by === user.id)
      : currentTasks.filter((task) =>
          currentGroups.some((group) => group.id === task.group_id),
        );

    const allTaskIds = visibleTasks.map((task) => task.id);
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
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    let filteredTasks = tasks;

    if (isTeacher) {
      filteredTasks = tasks.filter((task) => task.created_by === user?.id);
    } else if (user) {
      const currentGroups = useGroupStore.getState().groups;
      const studentGroupIds = currentGroups.map((group) => group.id);
      filteredTasks = tasks.filter((task) =>
        studentGroupIds.includes(task.group_id),
      );
    }

    const upcoming = filteredTasks.filter((task) => {
      const dueDate = new Date(task.due_date);
      return dueDate >= now && dueDate <= nextWeek;
    });

    upcoming.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    );

    setUpcomingTasks(upcoming);
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
    return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
  };

  const formatFullDate = () => {
    const now = new Date();
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    return `BUGUN: ${now.getDate()}-${months[now.getMonth()].toUpperCase()}, ${days[now.getDay()].toUpperCase()}`;
  };

  const isDueSoon = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
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
        await loadData();
        setTaskModalVisible(false);
        setSelectedTask(null);
      } catch (error: any) {
        showToast(`Xatolik: ${error.message}`, 'error');
      }
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    due_date: string;
    group_id?: string;
    file?: { uri: string; type: string; name: string };
  }) => {
    if (user) {
      try {
        if (!taskData.group_id) {
          throw new Error('Iltimos, guruhni tanlang');
        }
        const { file, ...rest } = taskData;
        const result = await createTask(
          {
            ...rest,
            group_id: taskData.group_id,
            created_by: user.id,
          },
          file,
        );

        if (!result.success) {
          throw new Error(
            result.error || 'Vazifa yaratishda xatolik yuz berdi',
          );
        }

        await loadData();
        setTaskModalVisible(false);
        showToast('Vazifa muvaffaqiyatli yaratildi', 'success');
      } catch (error: any) {
        showToast(`Xatolik: ${error.message}`, 'error');
      }
    }
  };

  const getTaskStatus = (task: Task): 'overdue' | 'pending' | 'submitted' | 'active' => {
    if (isOverdue(task.due_date)) return 'overdue';
    const sub = submissions.find(s => s.task_id === task.id && s.user_id === user?.id);
    if (sub) return 'submitted';
    if (isDueSoon(task.due_date)) return 'pending';
    return 'active';
  };

  const pendingCount = isTeacher
    ? upcomingTasks.length
    : upcomingTasks.filter(t => !submissions.find(s => s.task_id === t.id && s.user_id === user?.id)).length;

  const submittedCount = isTeacher
    ? recentSubmissions.length
    : submissions.filter((s) => s.user_id === user?.id).length;

  const visibleUpcomingTasks = upcomingTasks.slice(0, 5);

  const renderSkeleton = () => (
    <View style={{ padding: SPACING.md }}>
      <Skeleton width="100%" height={100} borderRadius={20} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <Skeleton width="31%" height={90} borderRadius={16} />
        <Skeleton width="31%" height={90} borderRadius={16} />
        <Skeleton width="31%" height={90} borderRadius={16} />
      </View>
      <Skeleton width="100%" height={120} borderRadius={20} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={120} borderRadius={20} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader subtitle="Asosiy" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Date & Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.dateText}>{formatFullDate()}</Text>
          <Text style={styles.greeting}>
            Salom, {user?.full_name?.split(' ')[0] || 'Foydalanuvchi'}{' '}
            {isTeacher ? 'ustoz' : ''} 👋
          </Text>
        </View>

        {/* Alert Banner */}
        {upcomingTasks.length > 0 && (
          <View style={styles.bannerWrap}>
            <LinearGradient
              colors={[GRADIENTS.banner[0], GRADIENTS.banner[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerBadge}>
                <AlertTriangle size={12} color={COLORS.warning[500]} />
                <Text style={styles.bannerBadgeText}>MUHIM ESLATMA</Text>
              </View>
              <Text style={styles.bannerTitle}>
                {upcomingTasks.length > 1
                  ? `Bugun ${upcomingTasks.filter(t => isDueSoon(t.due_date)).length} ta vazifaning topshirish muddati tugaydi!`
                  : 'Yaqinda muddati tugaydigan vazifa bor!'}
              </Text>
              <TouchableOpacity 
                style={styles.bannerButton}
                onPress={() => router.push('/(app)/calendar')}
              >
                <Text style={styles.bannerButtonText}>Tekshirish</Text>
                <ArrowRight size={14} color={COLORS.gray[800]} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {isLoading && !refreshing ? (
          renderSkeleton()
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.primary[50] }]}>
                  <Users size={18} color={COLORS.primary[500]} />
                </View>
                <Text style={styles.statValue}>{groups.length} ta</Text>
                <Text style={styles.statLabel}>Faol guruhlar</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.secondary[50] }]}>
                  <FileText size={18} color={COLORS.secondary[500]} />
                </View>
                <Text style={styles.statValue}>{tasks.length} ta</Text>
                <Text style={styles.statLabel}>Topshiriqlar</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.warning[50] }]}>
                  <Clock size={18} color={COLORS.warning[500]} />
                </View>
                <Text style={[styles.statValue, pendingCount > 0 && { color: COLORS.warning[600] }]}>
                  {pendingCount} ta
                </Text>
                <Text style={styles.statLabel}>Kutilmoqda</Text>
                {pendingCount > 0 && <View style={styles.statDot} />}
              </View>
            </View>

            {/* Groups Carousel */}
            {groups.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Guruhlarim</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{groups.length}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => router.push('/(app)/groups')}
                  >
                    <Text style={styles.seeAllText}>Barchasi →</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.groupsScroll}
                >
                  {groups.slice(0, 5).map((group) => {
                    const groupTasks = tasks.filter(t => t.group_id === group.id);
                    const completedCount = groupTasks.length > 0
                      ? submissions.filter(s => groupTasks.some(t => t.id === s.task_id)).length
                      : 0;
                    const progressPct = groupTasks.length > 0
                      ? Math.round((completedCount / Math.max(groupTasks.length, 1)) * 100)
                      : 0;

                    return (
                      <TouchableOpacity
                        key={group.id}
                        style={styles.groupMiniCard}
                        onPress={() => router.push('/(app)/groups')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.groupMiniTop}>
                          <View style={styles.groupMiniIcon}>
                            <Users size={16} color={COLORS.primary[500]} />
                          </View>
                          {progressPct > 70 && (
                            <StatusBadge status="active" label={`${progressPct}% faollik`} />
                          )}
                        </View>
                        <Text style={styles.groupMiniName} numberOfLines={1}>{group.name}</Text>
                        <Text style={styles.groupMiniMeta}>
                          {groupTasks.length} ta topshiriq
                        </Text>
                        <View style={styles.groupMiniProgress}>
                          <Text style={styles.groupMiniProgressLabel}>Dars o'zlashtirish</Text>
                          <Text style={styles.groupMiniProgressValue}>{progressPct}%</Text>
                        </View>
                        <ProgressBar value={progressPct} height={4} />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Recent Tasks */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>So'nggi vazifalar</Text>
                <Text style={styles.seeAllMuted}>Oxirgi yangilanish</Text>
              </View>

              {visibleUpcomingTasks.length > 0 ? (
                visibleUpcomingTasks.map((task) => {
                  const group = getGroupById(task.group_id);
                  const status = getTaskStatus(task);
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.taskCard}
                      onPress={() => handleTaskPress(task)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.taskCardTop}>
                        <Text style={styles.taskGroupLabel}>
                          {group?.name?.toUpperCase() || "NOMA'LUM"}
                        </Text>
                        <StatusBadge
                          status={status}
                          dot
                          label={
                            status === 'overdue' ? "Muddati o'tgan" :
                            status === 'submitted' ? `${submittedCount} topshirildi` :
                            status === 'pending' ? `${pendingCount} kutilmoqda` :
                            'Faol'
                          }
                        />
                      </View>
                      <Text style={styles.taskCardTitle} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <View style={styles.taskCardBottom}>
                        <View style={styles.taskCardDate}>
                          <Calendar size={14} color={COLORS.gray[400]} />
                          <Text style={styles.taskCardDateText}>
                            {isDueSoon(task.due_date) ? 'Bugun' : formatDate(task.due_date)}, {new Date(task.due_date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <FileText size={32} color={COLORS.gray[300]} />
                  <Text style={styles.emptyText}>Yaqinlashgan vazifalar yo'q</Text>
                </View>
              )}
            </View>

            {/* Recent Activity / Submissions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {isTeacher ? 'Oxirgi javoblar' : "So'nggi faollik"}
                </Text>
              </View>

              {recentSubmissions.length > 0 ? (
                recentSubmissions.slice(0, 3).map((submission) => (
                  <View key={submission.id} style={styles.activityCard}>
                    <View style={styles.activityLeft}>
                      <View style={styles.activityDot} />
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle} numberOfLines={1}>
                          {tasks.find((t) => t.id === submission.task_id)?.title || 'Nomaʼlum vazifa'}
                        </Text>
                        <Text style={styles.activityDate}>
                          {new Date(submission.submitted_at).toLocaleDateString('uz-UZ')}
                        </Text>
                      </View>
                    </View>
                    {submission.rating !== null && submission.rating !== undefined && (
                      <View style={styles.gradeBadge}>
                        <Text style={styles.gradeText}>{submission.rating}</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <CheckCircle2 size={32} color={COLORS.gray[300]} />
                  <Text style={styles.emptyText}>
                    {isTeacher ? 'Oxirgi javoblar mavjud emas' : "Hali faollik yo'q"}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* FAB */}
      {isTeacher && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setTaskModalVisible(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[GRADIENTS.primary[0], GRADIENTS.primary[1]]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus size={20} color={COLORS.white} />
            <Text style={styles.fabText}>Yangi vazifa</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <TaskModal
        isVisible={isTaskModalVisible}
        onClose={() => {
          setTaskModalVisible(false);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        initialData={selectedTask ? selectedTask : undefined}
        groups={isTeacher ? groups.filter((g) => g.created_by === user?.id) : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Greeting
  greetingSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  dateText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  greeting: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.gray[900],
  },
  // Banner
  bannerWrap: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  banner: {
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.lg,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
    gap: 4,
  },
  bannerBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  bannerButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[800],
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[900],
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  statDot: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent[500],
  },
  // Section
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[900],
  },
  countBadge: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  countBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary[600],
  },
  seeAllText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[500],
  },
  seeAllMuted: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
  },
  // Groups Carousel
  groupsScroll: {
    gap: SPACING.md,
    paddingRight: SPACING.lg,
  },
  groupMiniCard: {
    width: 180,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  groupMiniTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  groupMiniIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupMiniName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  groupMiniMeta: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginBottom: SPACING.sm,
  },
  groupMiniProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  groupMiniProgressLabel: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.gray[400],
  },
  groupMiniProgressValue: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.gray[700],
  },
  // Task Card
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  taskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  taskGroupLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.primary[500],
    letterSpacing: 0.5,
  },
  taskCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  taskCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCardDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskCardDateText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
  },
  // Activity
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary[500],
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[800],
  },
  activityDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  gradeText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
  },
  // Empty
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    gap: SPACING.sm,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    ...SHADOWS.lg,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  fabText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
});
