import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import { useToast } from '@/context/ToastContext';
import Input from './Input';
import Button from './Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, X } from 'lucide-react-native';
import { Task } from '@/lib/supabase';

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

const truncateFileName = (name: string, maxLength = 24) => {
  if (name.length <= maxLength) return name;

  const extensionIndex = name.lastIndexOf('.');
  const extension =
    extensionIndex !== -1 ? name.slice(extensionIndex) : '';
  const baseName =
    extensionIndex !== -1 ? name.slice(0, extensionIndex) : name;

  const start = baseName.slice(0, 18);
  const end = baseName.slice(-8);

  return `${start}...${end}${extension}`;
};

const TaskModal: React.FC<TaskModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { showToast } = useToast();
  const [taskTitle, setTaskTitle] = useState(initialData?.title || '');
  const [taskDescription, setTaskDescription] = useState(
    initialData?.description || '',
  );
  const [taskDueDate, setTaskDueDate] = useState(initialData?.due_date || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    initialData?.due_date ? new Date(initialData.due_date) : new Date(),
  );
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type?: string;
    isExisting?: boolean;
  } | null>(
    initialData?.file_url
      ? {
          uri: initialData.file_url,
          name: initialData.file_url.split('/').pop() || 'Attached file',
          type: undefined,
          isExisting: true,
        }
      : null,
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    if (initialData) {
      setTaskTitle(initialData.title);
      setTaskDescription(initialData.description);
      setTaskDueDate(initialData.due_date);
      setSelectedDate(new Date(initialData.due_date));
      if (initialData.file_url) {
        setSelectedFile({
          uri: initialData.file_url,
          name: initialData.file_url.split('/').pop() || 'Attached file',
          type: undefined,
          isExisting: true,
        });
      } else {
        setSelectedFile(null);
      }
    } else {
      const today = new Date();
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate(today.toISOString().split('T')[0]);
      setSelectedDate(today);
      setSelectedFile(null);
    }
    setError('');
  }, [initialData, isVisible]);

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
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const file = {
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
          name: asset.name || `file_${Date.now()}.pdf`,
        };
        console.log('[TaskModal] Fayl tanlandi:', file);
        setSelectedFile(file);
      } else {
        console.log('[TaskModal] Fayl tanlash bekor qilindi');
      }
    } catch (e) {
      console.error('Fayl tanlashda xatolik:', e);
      showToast('Fayl tanlashda xatolik yuz berdi', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!taskTitle.trim() || !taskDescription.trim() || !taskDueDate.trim()) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: taskTitle,
        description: taskDescription,
        due_date: taskDueDate,
        file:
          selectedFile && !selectedFile.isExisting
            ? {
                uri: selectedFile.uri,
                type: selectedFile.type || 'application/pdf',
                name: selectedFile.name,
              }
            : undefined,
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
      setError(error.message || 'Vazifani saqlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
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
          {initialData ? 'Vazifani tahrirlash' : 'Yangi vazifa yaratish'}
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Input
          label="Vazifa nomi"
          placeholder="Vazifa nomini kiriting"
          value={taskTitle}
          onChangeText={setTaskTitle}
        />

        <Input
          label="Tavsif"
          placeholder="Vazifa tavsifini kiriting"
          value={taskDescription}
          onChangeText={setTaskDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateInputLabel}>Muddati</Text>
          <Text style={styles.dateInputValue}>
            {taskDueDate || 'Sana tanlang'}
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
            <Text
              style={styles.fileInputText}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {selectedFile?.name
                ? truncateFileName(selectedFile.name)
                : "Fayl qo'shish (PDF yoki DOCX)"}
            </Text>
          </View>
          {selectedFile && (
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
            title="Bekor qilish"
            onPress={onClose}
            type="outline"
            style={styles.modalButton}
            disabled={submitting}
          />
          <Button
            title={
              submitting
                ? initialData
                  ? 'Saqlanmoqda...'
                  : 'Yaratilmoqda...'
                : initialData
                  ? 'Saqlash'
                  : 'Yaratish'
            }
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.modalButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    flex: 1,
    paddingRight: SPACING.sm,
  },
  fileInputText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[800],
    marginLeft: SPACING.sm,
    flex: 1,
  },
  removeFileButton: {
    padding: SPACING.xs,
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
});

export default TaskModal;
