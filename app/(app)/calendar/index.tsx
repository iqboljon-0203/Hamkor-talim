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
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useGroupStore } from '@/hooks/useGroupStore';
import { Task } from '@/lib/supabase';
import { Calendar as CalendarIcon, FileText } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen() {
  const { user, isTeacher } = useAuth();
  const { tasks, fetchTasks } = useTaskStore();
  const { groups, fetchGroups } = useGroupStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    // Avval guruhlarni yuklash
    await fetchGroups(user.id, isTeacher);
    const currentGroups = useGroupStore.getState().groups;
    
    // Har bir guruh uchun vazifalarni yuklash
    await Promise.all(currentGroups.map((group) => fetchTasks(group.id)));
    
    // Marked dates ni yangilash
    updateMarkedDates();
  };

  const updateMarkedDates = () => {
    const currentTasks = useTaskStore.getState().tasks;
    const marked: any = {};
    currentTasks.forEach((task) => {
      const date = task.due_date.split('T')[0];
      marked[date] = {
        marked: true,
        dotColor: COLORS.primary[500],
      };
    });
    // Bugungi sanani belgilash
    const today = new Date().toISOString().split('T')[0];
    marked[today] = {
      ...marked[today],
      selected: true,
      selectedColor: COLORS.primary[500],
    };
    setMarkedDates(marked);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTasksForDate = (date: string) => {
    const currentTasks = useTaskStore.getState().tasks;
    return currentTasks.filter((task) => task.due_date.split('T')[0] === date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isDueSoon = (dateString: string) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays >= 0;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Kalendar</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Calendar
          current={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            todayTextColor: COLORS.primary[500],
            selectedDayBackgroundColor: COLORS.primary[500],
            dotColor: COLORS.primary[500],
            arrowColor: COLORS.primary[500],
          }}
        />

        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>
            {formatDate(selectedDate)} uchun vazifalar
          </Text>

          {getTasksForDate(selectedDate).length > 0 ? (
            getTasksForDate(selectedDate).map((task) => (
              <Card key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskIconContainer}>
                    <FileText size={20} color={COLORS.primary[500]} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDescription} numberOfLines={2}>
                      {task.description}
                    </Text>
                    {isDueSoon(task.due_date) && (
                      <View style={styles.dueSoonContainer}>
                        <CalendarIcon size={16} color={COLORS.warning[500]} />
                        <Text style={styles.dueSoonText}>
                          Tez orada muddati tugaydi
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bu kunda vazifalar yo'q</Text>
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
    backgroundColor: COLORS.gray[50],
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary[500],
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  tasksContainer: {
    marginTop: SPACING.xl,
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
    alignItems: 'flex-start',
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
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  taskDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  dueSoonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
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
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
  },
});
