import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import { useGroupStore } from '@/hooks/useGroupStore';
import { useTaskStore } from '@/hooks/useTaskStore';
import { router } from 'expo-router';
import {
  PlusCircle,
  Users,
  FileText,
  Upload,
  X,
  Edit2,
  Calendar,
  File,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Modal from 'react-native-modal';
import Input from '@/components/ui/Input';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Task } from '@/lib/supabase';
import * as Clipboard from 'expo-clipboard';

interface TaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    due_date: string;
    file?: { uri: string; type: string; name: string };
  }) => Promise<void>;
  initialData?: Task;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [taskTitle, setTaskTitle] = useState(initialData?.title || '');
  const [taskDescription, setTaskDescription] = useState(
    initialData?.description || '',
  );
  const [taskDueDate, setTaskDueDate] = useState(initialData?.due_date || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    initialData?.due_date ? new Date(initialData.due_date) : new Date(),
  );
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTaskTitle(initialData.title);
      setTaskDescription(initialData.description);
      setTaskDueDate(initialData.due_date);
      setSelectedDate(new Date(initialData.due_date));
    } else {
      // Yangi vazifa yaratilganda bugungi sanani o'rnatish
      const today = new Date();
      setSelectedDate(today);
      setTaskDueDate(today.toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setTaskDueDate(date.toISOString().split('T')[0]);
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });
      console.log('DocumentPicker natija:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
          name: asset.name,
        };
        setSelectedFile(file);
        console.log('Tanlangan fayl:', file);
      } else {
        setSelectedFile(null);
        console.log('Foydalanuvchi fayl tanlashni bekor qildi');
      }
    } catch (e) {
      setSelectedFile(null);
      console.error('Fayl tanlashda xatolik:', e);
    }
  };

  const handleSubmit = async () => {
    if (!taskTitle.trim() || !taskDescription.trim() || !taskDueDate.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await onSubmit({
        title: taskTitle,
        description: taskDescription,
        due_date: taskDueDate,
        file: selectedFile || undefined,
      });

      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setSelectedDate(new Date());
      setSelectedFile(null);
      setError('');
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save task');
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {initialData ? 'Edit Task' : 'Create New Task'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Input
          label="Task Title"
          placeholder="Enter task title"
          value={taskTitle}
          onChangeText={setTaskTitle}
        />

        <Input
          label="Description"
          placeholder="Enter task description"
          value={taskDescription}
          onChangeText={setTaskDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateInputLabel}>Due Date</Text>
          <Text style={styles.dateInputValue}>
            {taskDueDate || 'Select date'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.fileInput} onPress={handleFilePick}>
          <View style={styles.fileInputContent}>
            <Upload size={20} color={COLORS.primary[500]} />
            <Text style={styles.fileInputText}>
              {selectedFile?.type === 'success'
                ? selectedFile.name
                : initialData?.file_url
                  ? 'Change file (PDF or DOCX)'
                  : 'Attach file (PDF or DOCX)'}
            </Text>
          </View>
          {selectedFile?.type === 'success' && (
            <TouchableOpacity
              onPress={() => setSelectedFile(null)}
              style={styles.removeFileButton}
            >
              <X size={20} color={COLORS.error[500]} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <View style={styles.modalButtons}>
          <Button
            title="Cancel"
            onPress={onClose}
            type="outline"
            style={styles.modalButton}
          />
          <Button
            title={initialData ? 'Save Changes' : 'Create Task'}
            onPress={handleSubmit}
            style={styles.modalButton}
          />
        </View>
      </View>
    </Modal>
  );
};

export default function GroupsScreen() {
  const { user, isTeacher } = useAuth();
  const { groups, loading, fetchGroups, createGroup, joinGroup } =
    useGroupStore();
  const { createTask, updateTask, tasks, fetchTasks } = useTaskStore();
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

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (user) {
      await fetchGroups(user.id, isTeacher);
      // Fetch tasks for all groups
      for (const group of groups) {
        await fetchTasks(group.id);
      }
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
        Alert.alert(
          'Guruh yaratildi',
          `Guruh ID: ${result.groupId}\n\nBu ID ni talabalarga bering`,
          [{ text: 'OK' }],
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
        Alert.alert('Xatolik', error.message);
      }
    }
  };

  const handleGroupPress = async (group: any) => {
    if (isTeacher) {
      setSelectedGroup(group);
      setTaskModalVisible(true);
    } else {
      // Student uchun expand/collapse qilish
      toggleGroupExpansion(group.id);
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

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
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
        {groups.length > 0 ? (
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
                        Alert.alert('Nusxa olindi', 'Guruh ID si nusxa olindi');
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
        initialData={selectedTask}
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
