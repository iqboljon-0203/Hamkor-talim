import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/ui/Card';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useGroupStore } from '@/hooks/useGroupStore';
import { Task, Submission } from '@/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import {
  FileText,
  Calendar,
  Upload,
  ArrowLeft,
  File,
  CheckCircle2,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import * as DocumentPicker from 'expo-document-picker';
import Input from '@/components/ui/Input';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, isTeacher } = useAuth();
  const { showToast } = useToast();
  const {
    tasks,
    getTaskDetails,
    submissions,
    fetchSubmissions,
    rateSubmission,
    submitTask,
  } = useTaskStore();
  const { groups } = useGroupStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    if (id) {
      setLoading(true);
      try {
        const result = await getTaskDetails(id as string);
        if (result.task) {
          setTask(result.task);
          // O'qituvchi uchun yuborilgan javoblarni olish
          if (isTeacher) {
            await fetchSubmissions(id as string);
          }
        }
      } catch (error) {
        showToast('Vazifani yuklashda xatolik yuz berdi', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const getGroupById = (groupId: string) => {
    return groups.find((group) => group.id === groupId);
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
// ...
  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          type: asset.mimeType,
        });
      }
    } catch (error) {
      showToast('Fayl tanlashda xatolik yuz berdi', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      showToast('Iltimos, javob tavsifini kiriting', 'error');
      return;
    }
    if (!selectedFile) {
      showToast('Fayl tanlash majburiy!', 'error');
      return;
    }
    if (!task || !user) return;

    setIsSubmitting(true);
    try {
      const result = await submitTask(
        task.id,
        user.id,
        selectedFile || null,
        description,
      );
      if (result.success) {
        showToast('Javobingiz yuborildi', 'success');
        router.back();
      } else {
        throw new Error(result.error || 'Javob yuborishda xatolik yuz berdi');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAttachment = async () => {
    if (task?.file_url) {
      try {
        await Linking.openURL(task.file_url);
      } catch (error) {
        showToast('Faylni ochishda xatolik yuz berdi', 'error');
      }
    }
  };

  const handleRateSubmission = async (submissionId: string) => {
    if (!rating) {
      showToast('Iltimos, baho bering', 'error');
      return;
    }

    try {
      const result = await rateSubmission(submissionId, rating, feedback);
      if (result.success) {
        showToast('Javob baholandi', 'success');
        await loadTask(); // Javoblarni yangilash
      } else {
        throw new Error(result.error || 'Javobni baholashda xatolik yuz berdi');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  };

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Vazifa</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Vazifa topilmadi</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Vazifa</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Yuklanmoqda...</Text>
          </View>
        ) : task ? (
          <Card style={styles.taskCard}>
            <Text style={styles.taskTitle}>{task.title}</Text>

            <View style={styles.taskMeta}>
              <Calendar size={16} color={COLORS.gray[500]} />
              <Text style={styles.taskDate}>
                Muddat: {formatDate(task.due_date)}
              </Text>
            </View>

            <Text style={styles.taskDescription}>{task.description}</Text>

            {task.file_url && (
              <TouchableOpacity
                style={styles.attachmentButton}
                onPress={handleViewAttachment}
              >
                <File size={20} color={COLORS.primary[500]} />
                <Text style={styles.attachmentText}>
                  Vazifa faylini ko'rish
                </Text>
              </TouchableOpacity>
            )}

            {isTeacher ? (
              <View style={styles.submissionsSection}>
                <Text style={styles.sectionTitle}>Yuborilgan javoblar</Text>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <View key={submission.id} style={styles.submissionCard}>
                      <View style={styles.submissionHeader}>
                        <Text style={styles.submissionTitle}>
                          {new Date(
                            submission.submitted_at,
                          ).toLocaleDateString()}
                        </Text>
                        {submission.rating ? (
                          <View style={styles.ratingContainer}>
                            <Text style={styles.ratingText}>
                              Baho: {submission.rating}/5
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.submissionDescription}>
                        {submission.content || "Tavsif yo'q"}
                      </Text>

                      {submission.file_url && (
                        <TouchableOpacity
                          style={styles.submissionFile}
                          onPress={() => Linking.openURL(submission.file_url!)}
                        >
                          <FileText size={16} color={COLORS.primary[500]} />
                          <Text style={styles.submissionFileText}>
                            Javob faylini ko'rish
                          </Text>
                        </TouchableOpacity>
                      )}

                      {!submission.rating && (
                        <View style={styles.ratingForm}>
                          <Text style={styles.ratingLabel}>Baho:</Text>
                          <View style={styles.ratingButtons}>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <TouchableOpacity
                                key={value}
                                style={[
                                  styles.ratingButton,
                                  rating === value && styles.ratingButtonActive,
                                ]}
                                onPress={() => setRating(value)}
                              >
                                <Text
                                  style={[
                                    styles.ratingButtonText,
                                    rating === value &&
                                      styles.ratingButtonTextActive,
                                  ]}
                                >
                                  {value}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>

                          <Input
                            label="Izoh"
                            placeholder="Javob haqida izoh bering"
                            value={feedback}
                            onChangeText={setFeedback}
                            multiline
                            numberOfLines={3}
                            style={styles.feedbackInput}
                          />

                          <Button
                            title="Baholash"
                            onPress={() => handleRateSubmission(submission.id)}
                            style={styles.rateButton}
                          />
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      Hali javoblar yuborilmagan
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.submissionSection}>
                <Text style={styles.sectionTitle}>Javob yuborish</Text>

                <Input
                  label="Javob tavsifi"
                  placeholder="Javobingiz haqida qisqacha ma'lumot bering"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  style={styles.descriptionInput}
                />

                <TouchableOpacity
                  style={styles.fileInput}
                  onPress={handleFilePick}
                >
                  <View style={styles.fileInputContent}>
                    <Upload size={20} color={COLORS.primary[500]} />
                    <Text style={styles.fileInputText}>
                      {selectedFile?.name
                        ? selectedFile.name
                        : 'Javob faylini tanlang (PDF yoki DOCX)'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <Button
                  title="Javob yuborish"
                  onPress={handleSubmit}
                  disabled={
                    !description.trim() || !selectedFile || isSubmitting
                  }
                  loading={isSubmitting}
                  style={styles.submitButton}
                />
              </View>
            )}
          </Card>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Vazifa topilmadi</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary[500],
  },
  backButton: {
    marginRight: SPACING.md,
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
  taskCard: {
    padding: SPACING.lg,
  },
  taskTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  taskDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginLeft: SPACING.xs,
  },
  taskDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[100],
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  attachmentText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary[700],
    marginLeft: SPACING.sm,
  },
  submissionSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  fileInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
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
  submitButton: {
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
  },
  descriptionInput: {
    marginBottom: SPACING.lg,
  },
  submissionsSection: {
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  submissionFileText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[700],
    marginLeft: SPACING.xs,
  },
  ratingContainer: {
    backgroundColor: COLORS.success[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  ratingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.success[700],
  },
  ratingForm: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  ratingLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
  },
  ratingButtons: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  ratingButtonActive: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  ratingButtonText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[700],
  },
  ratingButtonTextActive: {
    color: COLORS.white,
  },
  feedbackInput: {
    marginBottom: SPACING.md,
  },
  rateButton: {
    marginTop: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const unstable_settings = { initialRouteName: null };
