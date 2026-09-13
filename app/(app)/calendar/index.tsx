import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useGroupStore } from '@/hooks/useGroupStore';
import { Task } from '@/lib/supabase';
import { Calendar as CalendarIcon, FileText, Clock, ChevronLeft, ChevronRight, MapPin } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';
import AppHeader from '@/components/ui/AppHeader';
import StatusBadge from '@/components/ui/StatusBadge';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } = Theme;

const WEEKDAYS_UZ = ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'];
const MONTHS_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

export default function CalendarScreen() {
  const { user, isTeacher } = useAuth();
  const { tasks } = useTaskStore();
  const { groups, fetchGroups } = useGroupStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    await fetchGroups(user.id, isTeacher);
    const currentGroups = useGroupStore.getState().groups;
    const groupIds = currentGroups.map((g) => g.id);
    if (groupIds.length > 0) {
      await useTaskStore.getState().fetchTasksByGroupIds(groupIds);
    }
  };

  useEffect(() => {
    const currentTasks = useTaskStore.getState().tasks;
    const marked: any = {};
    currentTasks.forEach((task) => {
      const date = task.due_date.split('T')[0];
      marked[date] = {
        marked: true,
        dotColor: COLORS.primary[500],
      };
    });
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: COLORS.primary[500],
    };
    setMarkedDates(marked);
  }, [selectedDate, tasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTasksForDate = (date: string) => {
    const currentTasks = useTaskStore.getState().tasks;
    return currentTasks.filter((task) => task.due_date.split('T')[0] === date);
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || '';
  };

  const formatSelectedDate = () => {
    const date = new Date(selectedDate);
    return `${date.getDate()}-${MONTHS_UZ[date.getMonth()].toLowerCase()}`;
  };

  const isDueSoon = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1 && diffDays >= 0;
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const selectedTasks = getTasksForDate(selectedDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader subtitle="Taqvim" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: COLORS.white,
              calendarBackground: COLORS.white,
              todayTextColor: COLORS.primary[500],
              selectedDayBackgroundColor: COLORS.primary[500],
              selectedDayTextColor: COLORS.white,
              dotColor: COLORS.primary[500],
              arrowColor: COLORS.primary[500],
              monthTextColor: COLORS.gray[900],
              textDayFontFamily: FONTS.medium,
              textMonthFontFamily: FONTS.bold,
              textDayHeaderFontFamily: FONTS.medium,
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
              dayTextColor: COLORS.gray[800],
              textDisabledColor: COLORS.gray[300],
            } as any}
            style={styles.calendar}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.chipRow}>
          <TouchableOpacity style={[styles.chip, styles.chipActive]}>
            <MapPin size={12} color={COLORS.white} />
            <Text style={[styles.chipText, styles.chipTextActive]}>Barcha guruhlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip}>
            <FileText size={12} color={COLORS.gray[600]} />
            <Text style={styles.chipText}>Mening vazifalarim</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks for Selected Date */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Text style={styles.tasksSectionTitle}>
              Bugungi reja va muddatlar ({formatSelectedDate()})
            </Text>
            <View style={styles.taskCount}>
              <Text style={styles.taskCountText}>{selectedTasks.length} ta</Text>
            </View>
          </View>

          {selectedTasks.length > 0 ? (
            selectedTasks.map((task) => {
              const groupName = getGroupName(task.group_id);
              const dueSoon = isDueSoon(task.due_date);
              const overdue = isOverdue(task.due_date);

              return (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskCard,
                    overdue && styles.taskCardOverdue,
                    dueSoon && !overdue && styles.taskCardUrgent,
                  ]}
                  onPress={() => router.push(`/task-detail/${task.id}`)}
                  activeOpacity={0.7}
                >
                  {/* Time & Group */}
                  <View style={styles.taskCardTop}>
                    <View style={styles.taskTime}>
                      <Clock size={13} color={COLORS.gray[400]} />
                      <Text style={styles.taskTimeText}>
                        {new Date(task.due_date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} gacha
                      </Text>
                    </View>
                    {groupName && (
                      <Text style={styles.taskGroupName}>{groupName}</Text>
                    )}
                  </View>

                  {/* Title & Description */}
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.description && (
                    <Text style={styles.taskDesc} numberOfLines={2}>
                      {task.description}
                    </Text>
                  )}

                  {/* Status */}
                  <View style={styles.taskCardBottom}>
                    {overdue && (
                      <StatusBadge status="overdue" />
                    )}
                    {dueSoon && !overdue && (
                      <StatusBadge status="pending" label="Shoshilinch (Bugun)" />
                    )}
                    {!overdue && !dueSoon && (
                      <StatusBadge status="active" />
                    )}
                    <TouchableOpacity
                      style={styles.taskActionBtn}
                      onPress={() => router.push(`/task-detail/${task.id}`)}
                    >
                      <Text style={styles.taskActionText}>Topshirish →</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <CalendarIcon size={36} color={COLORS.gray[300]} />
              <Text style={styles.emptyText}>Bu kunda vazifalar yo'q</Text>
              <Text style={styles.emptySubText}>Boshqa kunni tanlang</Text>
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
  // Calendar
  calendarCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: BORDER_RADIUS['2xl'],
  },
  // Chips
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: SPACING.xs,
  },
  chipActive: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  chipText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
  },
  chipTextActive: {
    color: COLORS.white,
  },
  // Tasks Section
  tasksSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tasksSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
    flex: 1,
  },
  taskCount: {
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  taskCountText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary[600],
  },
  // Task Card
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  taskCardOverdue: {
    borderLeftColor: COLORS.error[500],
  },
  taskCardUrgent: {
    borderLeftColor: COLORS.warning[500],
  },
  taskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  taskTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskTimeText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  taskGroupName: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary[500],
  },
  taskTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  taskDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  taskCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  taskActionBtn: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
  },
  taskActionText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
  },
  // Empty
  emptyContainer: {
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
});
