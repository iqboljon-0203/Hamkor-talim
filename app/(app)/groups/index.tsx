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
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import { useGroupStore } from '@/hooks/useGroupStore';
import { useToast } from '@/context/ToastContext';
import { useTaskStore } from '@/hooks/useTaskStore';
import { router } from 'expo-router';
import {
  PlusCircle,
  Users,
  FileText,
  Edit2,
  Calendar,
  File,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Task } from '@/lib/supabase';
import TaskModal from '@/components/ui/TaskModal';
import * as Clipboard from 'expo-clipboard';
import Modal from 'react-native-modal';
import Skeleton from '@/components/ui/Skeleton';

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

  const isLoading = groupsLoading || (tasksLoading && groups.length === 0);

  useEffect(() => {
    if (user) {
      loadData();
    }
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
        // Guruh yaratilgandan keyin ma'lumotlarni yangilash
        await loadData();
        // Guruh ID sini ko'rsatish
        const newGroupId = result.groupId || '';
        await Clipboard.setStringAsync(newGroupId);
        showToast(
          `Guruh yaratildi. ID: ${newGroupId} (Nusxalandi)`,
          'success',
        );
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
        // Guruhga qo'shilgandan keyin ma'lumotlarni yangilash
        await loadData();
        if (result.group) {
          setExpandedGroup(result.group.id);
        }
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
      // Faylni taskData.file dan ajratib olamiz
      const { file, ...rest } = taskData;
      const result = await createTask(
        {
          ...rest,
          group_id: selectedGroup.id,
          created_by: user.id,
        },
        file, // <-- Faqat shu joyda file obyektini alohida uzatamiz!
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create task');
      }
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
        showToast(error.message, 'error');
      }
    }
  };

  const handleGroupPress = async (group: any) => {
    if (isTeacher) {
      setSelectedGroup(group);
      setTaskModalVisible(true);
    } else {
      // Student uchun expand/collapse qilish
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
        try {
          await fetchTasks(groupId);
        } catch (error) {
          console.warn('[Groups] Failed to fetch tasks for group', groupId, error);
        }
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getGroupTasks = (groupId: string) => {
    return tasks.filter((task) => task.group_id === groupId);
  };

  const renderSkeleton = () => (
    <View style={{ padding: 10 }}>
        <Skeleton width="100%" height={100} borderRadius={16} style={{ marginBottom: 15 }} />
        <Skeleton width="100%" height={100} borderRadius={16} style={{ marginBottom: 15 }} />
        <Skeleton width="100%" height={100} borderRadius={16} style={{ marginBottom: 15 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isTeacher ? 'Mening guruhlarim' : 'Mening guruhlarim'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            isTeacher ? setCreateModalVisible(true) : setJoinModalVisible(true)
          }
        >
          <PlusCircle size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading && !refreshing ? (
            renderSkeleton()
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <View key={group.id} style={styles.groupContainer}>
              <Card
                style={styles.groupCard}
                onPress={() => handleGroupPress(group)}
              >
                <View style={styles.groupIconContainer}>
                  <Users size={24} color={COLORS.primary[600]} />
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  {group.description && (
                    <Text style={styles.groupDescription} numberOfLines={2}>
                      {group.description}
                    </Text>
                  )}
                  <Text style={styles.groupDate}>
                    Yaratilgan: {formatDate(group.created_at)}
                  </Text>
                  {isTeacher && (
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => {
                        Clipboard.setString(group.id);
                        showToast('Guruh ID si nusxa olindi', 'success');
                      }}
                    >
                      <Text style={styles.copyButtonText}>ID: {group.id}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>

              {/* Tasks Section */}
              <View style={styles.tasksContainer}>
                <TouchableOpacity
                  style={styles.tasksHeader}
                  onPress={() => toggleGroupExpansion(group.id)}
                >
                  <Text style={styles.tasksHeaderText}>
                    Vazifalar ({getGroupTasks(group.id).length})
                  </Text>
                  <Text style={styles.expandIcon}>
                    {expandedGroup === group.id ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {expandedGroup === group.id && (
                  <View style={styles.tasksList}>
                    {getGroupTasks(group.id).length > 0 ? (
                      getGroupTasks(group.id).map((task) => (
                        <TouchableOpacity
                          key={task.id}
                          style={styles.taskItem}
                          onPress={() => handleTaskPress(task)}
                        >
                          <View style={styles.taskIconContainer}>
                            <File size={20} color={COLORS.primary[500]} />
                          </View>
                          <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <View style={styles.taskMeta}>
                              <Calendar size={16} color={COLORS.gray[500]} />
                              <Text style={styles.taskDate}>
                                Muddat: {formatDate(task.due_date)}
                              </Text>
                              {isTeacher && (
                                <TouchableOpacity
                                  style={styles.editButton}
                                  onPress={() => handleTaskPress(task)}
                                >
                                  <Edit2
                                    size={16}
                                    color={COLORS.primary[500]}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.emptyTaskContainer}>
                        <Text style={styles.emptyTaskText}>
                          Bu guruhda hali vazifalar yo'q
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Hali guruhlar yo'q</Text>
            <Text style={styles.emptyText}>
              O'qituvchi bergan guruh kodini kiriting
            </Text>
            <Button
              title="Guruhga Qo'shilish"
              onPress={() => setJoinModalVisible(true)}
              style={styles.emptyButton}
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
          <Text style={styles.modalTitle}>Create New Group</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Input
            label="Group Name"
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
          />

          <Input
            label="Description (Optional)"
            placeholder="Enter group description"
            value={groupDescription}
            onChangeText={setGroupDescription}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => {
                setCreateModalVisible(false);
                setError('');
              }}
              type="outline"
              style={styles.modalButton}
            />
            <Button
              title="Create"
              onPress={handleCreateGroup}
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
          <Text style={styles.modalTitle}>Guruhga Qo'shilish</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Input
            label="Guruh ID"
            placeholder="O'qituvchi bergan guruh ID sini kiriting"
            value={groupCode}
            onChangeText={setGroupCode}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Bekor qilish"
              onPress={() => {
                setJoinModalVisible(false);
                setError('');
              }}
              type="outline"
              style={styles.modalButton}
            />
            <Button
              title="Qo'shilish"
              onPress={handleJoinGroup}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      <TaskModal
        isVisible={isTaskModalVisible}
        onClose={() => {
          setTaskModalVisible(false);
          setSelectedGroup(null);
          setSelectedTask(null);
        }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        initialData={selectedTask || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary[500],
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING['2xl'],
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  groupIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  groupDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  groupDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[700],
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    width: '60%',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[800],
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error[500],
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  modalButton: {
    marginLeft: SPACING.md,
    minWidth: 100,
  },
  dateInput: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
  },
  dateInputLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  dateInputValue: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
  },
  fileInput: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInputText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
    marginLeft: SPACING.sm,
  },
  removeFileButton: {
    padding: SPACING.xs,
  },
  groupContainer: {
    marginBottom: SPACING.lg,
  },
  tasksContainer: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  tasksHeaderText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
  },
  expandIcon: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  tasksList: {
    padding: SPACING.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.gray[50],
    marginBottom: SPACING.xs,
  },
  taskIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    marginLeft: SPACING.xs,
  },
  editButton: {
    marginLeft: 'auto',
    padding: SPACING.xs,
  },
  emptyTaskContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyTaskText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  groupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  copyButton: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary[700],
  },
});
