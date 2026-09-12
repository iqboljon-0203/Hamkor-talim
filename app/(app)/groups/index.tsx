import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { GRADIENTS } from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useGroupStore } from '@/hooks/useGroupStore';
import { useToast } from '@/context/ToastContext';
import { useTaskStore } from '@/hooks/useTaskStore';
import { router } from 'expo-router';
import {
  Plus,
  Users,
  FileText,
  Edit2,
  Calendar,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Hash,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Task } from '@/lib/supabase';
import TaskModal from '@/components/ui/TaskModal';
import AppHeader from '@/components/ui/AppHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';
import Skeleton from '@/components/ui/Skeleton';
import Avatar from '@/components/ui/Avatar';
import * as Clipboard from 'expo-clipboard';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } = Theme;

export default function GroupsScreen() {
  const { user, isTeacher } = useAuth();
  const { groups, loading: groupsLoading, fetchGroups, createGroup, joinGroup } =
    useGroupStore();
  const { createTask, updateTask, tasks, fetchTasks, loading: tasksLoading } = useTaskStore();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setJoinModalVisible] = useState(false);
  const [isTaskModalVisible, setTaskModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isLoading = groupsLoading || (tasksLoading && groups.length === 0);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    await fetchGroups(user.id, isTeacher);
    const latestGroups = useGroupStore.getState().groups;
    const groupIds = latestGroups.map(g => g.id);
    if (groupIds.length > 0) {
      await useTaskStore.getState().fetchTasksByGroupIds(groupIds);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Iltimos, guruh nomini kiriting');
      return;
    }
    if (user) {
      const result = await createGroup(groupName, groupDescription, user.id);
      if (result.success) {
        setGroupName('');
        setGroupDescription('');
        setCreateModalVisible(false);
        await loadData();
        const newGroupId = result.groupId || '';
        await Clipboard.setStringAsync(newGroupId);
        showToast(`Guruh yaratildi. ID: ${newGroupId} (Nusxalandi)`, 'success');
      } else {
        setError(result.error || 'Guruh yaratishda xatolik yuz berdi');
      }
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      setError('Iltimos, guruh ID sini kiriting');
      return;
    }
    if (user) {
      const result = await joinGroup(groupCode, user.id);
      if (result.success) {
        setGroupCode('');
        setJoinModalVisible(false);
        await loadData();
        if (result.group) setExpandedGroup(result.group.id);
      } else {
        setError(result.error || "Guruhga qo'shilishda xatolik yuz berdi");
      }
    }
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    due_date: string;
    file?: { uri: string; type: string; name: string };
  }) => {
    if (selectedGroup && user) {
      const { file, ...rest } = taskData;
      const result = await createTask(
        { ...rest, group_id: selectedGroup.id, created_by: user.id },
        file,
      );
      if (!result.success) {
        throw new Error(result.error || 'Vazifa yaratishda xatolik yuz berdi');
      }
      await loadData();
      setTaskModalVisible(false);
      setSelectedGroup(null);
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
        if (!result.success) throw new Error(result.error || 'Vazifani yangilashda xatolik yuz berdi');
        await loadData();
        setTaskModalVisible(false);
        setSelectedTask(null);
      } catch (error: any) {
        showToast(error.message, 'error');
      }
    }
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    Alert.alert(
      "Guruhni o'chirish",
      `Haqiqatan ham "${groupName}" guruhini o'chirmoqchimisiz?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            const result = await useGroupStore.getState().deleteGroup(groupId);
            if (result.success) {
              showToast("Guruh muvaffaqiyatli o'chirildi", 'success');
              await loadData();
            } else {
              showToast(result.error || "Guruhni o'chirishda xatolik yuz berdi", 'error');
            }
          },
        },
      ],
    );
  };

  const handleGroupPress = async (group: any) => {
    if (isTeacher) {
      setSelectedGroup(group);
      setTaskModalVisible(true);
    } else {
      await toggleGroupExpansion(group.id);
    }
  };

  const handleTaskPress = (task: Task) => {
    if (isTeacher) {
      setSelectedTask(task);
      setTaskModalVisible(true);
    } else {
      router.push(`/task-detail/${task.id}`);
    }
  };

  const toggleGroupExpansion = async (groupId: string) => {
    const isNowExpanded = expandedGroup !== groupId;
    setExpandedGroup(isNowExpanded ? groupId : null);
    if (isNowExpanded) {
      const hasTasks = tasks.some((task) => task.group_id === groupId);
      if (!hasTasks) {
        try { await fetchTasks(groupId); } catch (e) {}
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getGroupTasks = (groupId: string) => tasks.filter((task) => task.group_id === groupId);

  const filteredGroups = searchQuery
    ? groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : groups;

  const renderSkeleton = () => (
    <View style={{ padding: SPACING.md }}>
      <Skeleton width="100%" height={56} borderRadius={16} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={180} borderRadius={20} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={180} borderRadius={20} style={{ marginBottom: 16 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader subtitle="Guruhlar" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Search size={18} color={COLORS.gray[400]} />
            <Text style={styles.searchPlaceholder}>
              {searchQuery || 'Guruhlarni qidirish...'}
            </Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={18} color={COLORS.gray[600]} />
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => isTeacher ? setCreateModalVisible(true) : setJoinModalVisible(true)}
          >
            <LinearGradient
              colors={[GRADIENTS.primary[0], GRADIENTS.primary[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <Plus size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>
                {isTeacher ? 'Yangi guruh ochish' : "Guruhga qo'shilish"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {isLoading && !refreshing ? (
          renderSkeleton()
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const groupTasks = getGroupTasks(group.id);
            const isExpanded = expandedGroup === group.id;

            return (
              <View key={group.id} style={styles.groupCard}>
                {/* Group Header */}
                <TouchableOpacity
                  style={styles.groupHeader}
                  onPress={() => handleGroupPress(group)}
                  activeOpacity={0.7}
                >
                  <View style={styles.groupHeaderLeft}>
                    <View style={styles.groupIcon}>
                      <Users size={18} color={COLORS.primary[500]} />
                    </View>
                    <View style={styles.groupHeaderInfo}>
                      <View style={styles.groupNameRow}>
                        <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
                        <StatusBadge status="active" />
                      </View>
                      <View style={styles.groupIdRow}>
                        <Text style={styles.groupIdText}>#{group.id.slice(0, 7)}</Text>
                        <TouchableOpacity
                          onPress={async () => {
                            await Clipboard.setStringAsync(group.id);
                            showToast('ID nusxalandi', 'success');
                          }}
                          style={styles.copyBtn}
                        >
                          <Copy size={12} color={COLORS.primary[500]} />
                          <Text style={styles.copyText}>Nusxa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  {isTeacher && (
                    <TouchableOpacity
                      onPress={() => handleDeleteGroup(group.id, group.name)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={16} color={COLORS.error[400]} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {/* Group Description */}
                {group.description && (
                  <Text style={styles.groupDesc} numberOfLines={2}>{group.description}</Text>
                )}

                {/* Group Stats */}
                <View style={styles.groupStats}>
                  <View style={styles.groupStatItem}>
                    <Users size={14} color={COLORS.gray[400]} />
                    <Text style={styles.groupStatText}>
                      {groupTasks.length > 0 ? `${groupTasks.length} ta topshiriq` : "Topshiriq yo'q"}
                    </Text>
                  </View>
                  <View style={styles.groupStatItem}>
                    <Calendar size={14} color={COLORS.gray[400]} />
                    <Text style={styles.groupStatText}>
                      {formatDate(group.created_at)}
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                {groupTasks.length > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>O'zlashtirish va topshirish</Text>
                      <Text style={styles.progressValue}>
                        {Math.round((groupTasks.length / Math.max(groupTasks.length, 1)) * 100)}%
                      </Text>
                    </View>
                    <ProgressBar value={groupTasks.length} maxValue={Math.max(groupTasks.length, 1)} height={5} />
                  </View>
                )}

                {/* Tasks Accordion */}
                <TouchableOpacity
                  style={styles.tasksToggle}
                  onPress={() => toggleGroupExpansion(group.id)}
                >
                  <View style={styles.tasksToggleLeft}>
                    <FileText size={14} color={COLORS.primary[500]} />
                    <Text style={styles.tasksToggleText}>
                      Topshiriqlar ({groupTasks.length} ta)
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronDown size={16} color={COLORS.gray[400]} />
                  ) : (
                    <ChevronRight size={16} color={COLORS.gray[400]} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.tasksList}>
                    {groupTasks.length > 0 ? (
                      groupTasks.map((task) => (
                        <TouchableOpacity
                          key={task.id}
                          style={styles.taskItem}
                          onPress={() => handleTaskPress(task)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.taskItemLeft}>
                            <View style={styles.taskDot} />
                            <View>
                              <Text style={styles.taskItemTitle}>{task.title}</Text>
                              <Text style={styles.taskItemDate}>
                                Muddat: {formatDate(task.due_date)}
                              </Text>
                            </View>
                          </View>
                          {isTeacher && (
                            <Edit2 size={14} color={COLORS.primary[400]} />
                          )}
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noTasksText}>Bu guruhda hali vazifalar yo'q</Text>
                    )}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.groupActions}>
                  <TouchableOpacity
                    style={styles.manageBtn}
                    onPress={() => handleGroupPress(group)}
                  >
                    <Text style={styles.manageBtnText}>
                      {isTeacher ? "Boshqarish" : "Kirish →"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Users size={48} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>Hali guruhlar yo'q</Text>
            <Text style={styles.emptyText}>
              {isTeacher
                ? 'Yangi guruh ochib talabalarni qo\'shing'
                : "O'qituvchi bergan guruh kodini kiriting"}
            </Text>
            <Button
              title={isTeacher ? "Guruh yaratish" : "Guruhga qo'shilish"}
              onPress={() => isTeacher ? setCreateModalVisible(true) : setJoinModalVisible(true)}
              gradient
              style={{ marginTop: SPACING.md }}
            />
          </View>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        isVisible={isCreateModalVisible}
        onBackdropPress={() => setCreateModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Yangi guruh yaratish</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Input
            label="Guruh nomi"
            placeholder="Guruh nomini kiriting"
            value={groupName}
            onChangeText={setGroupName}
          />
          <Input
            label="Tavsif (ixtiyoriy)"
            placeholder="Guruh tavsifini kiriting"
            value={groupDescription}
            onChangeText={setGroupDescription}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalButtons}>
            <Button
              title="Bekor qilish"
              onPress={() => { setCreateModalVisible(false); setError(''); }}
              type="outline"
              style={styles.modalButton}
            />
            <Button
              title="Yaratish"
              onPress={handleCreateGroup}
              gradient
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        isVisible={isJoinModalVisible}
        onBackdropPress={() => setJoinModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Guruhga Qo'shilish</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Input
            label="Guruh ID"
            placeholder="O'qituvchi bergan guruh ID sini kiriting"
            value={groupCode}
            onChangeText={setGroupCode}
            icon={<Hash size={18} color={COLORS.gray[400]} />}
          />
          <View style={styles.modalButtons}>
            <Button
              title="Bekor qilish"
              onPress={() => { setJoinModalVisible(false); setError(''); }}
              type="outline"
              style={styles.modalButton}
            />
            <Button
              title="Qo'shilish"
              onPress={handleJoinGroup}
              gradient
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      <TaskModal
        isVisible={isTaskModalVisible}
        onClose={() => { setTaskModalVisible(false); setSelectedGroup(null); setSelectedTask(null); }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        initialData={selectedTask || undefined}
      />
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
  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  searchPlaceholder: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
  },
  filterBtn: {
    backgroundColor: COLORS.white,
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  // Action
  actionSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  actionButtonText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  // Group Card
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  groupIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  groupHeaderInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  groupName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[900],
    flex: 1,
  },
  groupIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  groupIdText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  copyText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary[500],
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  groupDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  // Stats
  groupStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  groupStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  groupStatText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  // Progress
  progressSection: {
    marginTop: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
  },
  progressValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[700],
  },
  // Tasks Toggle
  tasksToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  tasksToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tasksToggleText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
  },
  // Tasks List
  tasksList: {
    marginTop: SPACING.sm,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  taskItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary[400],
  },
  taskItemTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[800],
  },
  taskItemDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    marginTop: 1,
  },
  noTasksText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  // Group Actions
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    gap: SPACING.md,
  },
  manageBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[500],
  },
  manageBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
    marginTop: SPACING['2xl'],
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[700],
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[400],
    textAlign: 'center',
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
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error[500],
    marginBottom: SPACING.md,
    backgroundColor: COLORS.error[50],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
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
});
