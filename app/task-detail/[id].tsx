import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Theme from '@/constants/Theme';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useGroupStore } from '@/hooks/useGroupStore';
import { Task, Submission } from '@/lib/supabase';
import { useLocalSearchParams, router } from 'expo-router';
import {
  FileText,
  Calendar,
  Upload,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Star,
  Trash2,
  Download,
  AlertCircle,
} from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import * as DocumentPicker from 'expo-document-picker';
import Modal from 'react-native-modal';
import AppHeader from '@/components/ui/AppHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import Avatar from '@/components/ui/Avatar';
import { LinearGradient } from 'expo-linear-gradient';

const { COLORS, FONTS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, GRADIENTS } = Theme;

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, isTeacher } = useAuth();
  const { showToast } = useToast();
  const {
    getTaskDetails,
    submissions,
    fetchSubmissions,
    rateSubmission,
    submitTask,
    deleteTask,
  } = useTaskStore();
  const { groups } = useGroupStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Rating modal state for teacher
  const [ratingModalSubmission, setRatingModalSubmission] = useState<Submission | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [feedbackValue, setFeedbackValue] = useState<string>('');
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  useEffect(() => {
    if (user && id) {
      loadTask();
    }
  }, [id, user]);

  const loadTask = async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const result = await getTaskDetails(id as string);
      if (result.task) {
        setTask(result.task);
        if (isTeacher) {
          await fetchSubmissions(id as string);
        } else {
          await fetchSubmissions(id as string, user.id);
        }
      }
    } catch (error) {
      showToast('Vazifani yuklashda xatolik yuz berdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mySubmission = !isTeacher
    ? submissions.find((s) => s.task_id === id && s.user_id === user?.id)
    : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
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
    if (!selectedFile && !isResubmitting) {
      showToast('Fayl tanlash majburiy!', 'error');
      return;
    }
    if (!task || !user) return;

    setIsSubmitting(true);
    try {
      const result = await submitTask(task.id, user.id, selectedFile, description);
      if (result.success) {
        showToast('Javobingiz muvaffaqiyatli yuborildi', 'success');
        setIsResubmitting(false);
        setSelectedFile(null);
        setDescription('');
        await loadTask();
      } else {
        throw new Error(result.error || 'Javob yuborishda xatolik yuz berdi');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAttachment = async (url?: string) => {
    const targetUrl = url || task?.file_url;
    if (targetUrl) {
      try {
        await Linking.openURL(targetUrl);
      } catch (error) {
        showToast('Faylni ochishda xatolik yuz berdi', 'error');
      }
    }
  };

  const openRatingModal = (submission: Submission) => {
    setRatingModalSubmission(submission);
    setRatingValue(submission.rating || 5);
    setFeedbackValue(submission.feedback || '');
  };

  const handleSaveRating = async () => {
    if (!ratingModalSubmission) return;
    setIsRatingLoading(true);
    try {
      const result = await rateSubmission(
        ratingModalSubmission.id,
        ratingValue,
        feedbackValue,
      );
      if (result.success) {
        showToast('Javob baholandi', 'success');
        setRatingModalSubmission(null);
        await loadTask();
      } else {
        throw new Error(result.error || 'Baholashda xatolik yuz berdi');
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleDeleteTask = () => {
    if (!task) return;
    Alert.alert(
      "Vazifani o'chirish",
      "Haqiqatan ham ushbu vazifani o'chirmoqchimisiz? Barcha yuborilgan javoblar ham o'chib ketadi.",
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            const result = await deleteTask(task.id);
            if (result.success) {
              showToast("Vazifa o'chirildi", 'success');
              router.back();
            } else {
              showToast(result.error || "O'chirishda xatolik yuz berdi", 'error');
            }
          },
        },
      ],
    );
  };

  const getGroupName = (groupId: string) => {
    return groups.find(g => g.id === groupId)?.name || "Noma'lum guruh";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader subtitle="Yuklanmoqda..." showBack />
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Vazifa ma'lumotlari yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader subtitle="Xatolik" showBack />
        <View style={styles.centerContainer}>
          <AlertCircle size={48} color={COLORS.gray[300]} />
          <Text style={styles.emptyText}>Vazifa topilmadi</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOverdue = new Date(task.due_date) < new Date();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        subtitle="Vazifa tafsilotlari"
        showBack
        rightElement={
          isTeacher ? (
            <TouchableOpacity style={styles.headerBtn} onPress={handleDeleteTask}>
              <Trash2 size={20} color={COLORS.error[500]} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Task Info Card */}
        <View style={styles.taskInfoCard}>
          <View style={styles.groupBadge}>
            <Text style={styles.groupBadgeText}>{getGroupName(task.group_id)}</Text>
          </View>
          <Text style={styles.taskTitle}>{task.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Calendar size={16} color={COLORS.gray[400]} />
              <Text style={styles.metaText}>{formatDate(task.due_date)}</Text>
            </View>
            <StatusBadge 
              status={isOverdue ? 'overdue' : 'active'} 
              label={isOverdue ? 'Muddati o\'tgan' : 'Jarayonda'} 
            />
          </View>

          {task.description && (
            <Text style={styles.taskDesc}>{task.description}</Text>
          )}

          {task.file_url && (
            <TouchableOpacity 
              style={styles.attachmentBtn}
              onPress={() => handleViewAttachment()}
              activeOpacity={0.8}
            >
              <View style={styles.attachmentIcon}>
                <FileText size={20} color={COLORS.white} />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentTitle}>Biriktirilgan fayl</Text>
                <Text style={styles.attachmentSub}>Yuklab olish yoki ko'rish</Text>
              </View>
              <Download size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Teacher View: Submissions */}
        {isTeacher && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Talabalar javoblari ({submissions.length})</Text>
            
            {submissions.length > 0 ? (
              submissions.map((sub) => (
                <View key={sub.id} style={styles.submissionCard}>
                  <View style={styles.subHeader}>
                    <Avatar size="sm" name={sub.profile?.full_name || '?'} />
                    <View style={styles.subUserInfo}>
                      <Text style={styles.subUserName}>{sub.profile?.full_name || "Noma'lum"}</Text>
                      <Text style={styles.subDate}>
                        {new Date(sub.submitted_at).toLocaleDateString('uz-UZ')}
                      </Text>
                    </View>
                    {sub.rating ? (
                      <View style={styles.ratingBadge}>
                        <Star size={12} color={COLORS.warning[500]} fill={COLORS.warning[500]} />
                        <Text style={styles.ratingBadgeText}>{sub.rating}/5</Text>
                      </View>
                    ) : (
                      <StatusBadge status="pending" label="Kutilmoqda" />
                    )}
                  </View>
                  
                  {sub.content && <Text style={styles.subContent}>{sub.content}</Text>}
                  
                  {sub.file_url && (
                    <TouchableOpacity
                      style={styles.subFileBtn}
                      onPress={() => handleViewAttachment(sub.file_url!)}
                    >
                      <FileText size={16} color={COLORS.primary[500]} />
                      <Text style={styles.subFileText}>Faylni ochish</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.rateBtn}
                    onPress={() => openRatingModal(sub)}
                  >
                    <Text style={styles.rateBtnText}>
                      {sub.rating ? 'Bahoni o\'zgartirish' : 'Baholash'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Clock size={32} color={COLORS.gray[300]} />
                <Text style={styles.emptyText}>Hali javoblar yo'q</Text>
              </View>
            )}
          </View>
        )}

        {/* Student View: Submission Form */}
        {!isTeacher && (
          <View style={styles.section}>
            {mySubmission && !isResubmitting ? (
              <View style={styles.mySubmissionCard}>
                <View style={styles.mySubHeader}>
                  <View style={styles.mySubTitleRow}>
                    <CheckCircle2 size={24} color={COLORS.success[500]} />
                    <Text style={styles.mySubTitle}>Javobingiz qabul qilingan</Text>
                  </View>
                  <Text style={styles.mySubDate}>
                    {new Date(mySubmission.submitted_at).toLocaleDateString('uz-UZ')}
                  </Text>
                </View>

                {mySubmission.rating ? (
                  <View style={styles.gradeBox}>
                    <Text style={styles.gradeLabel}>Sizning bahoingiz:</Text>
                    <View style={styles.gradeStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          color={COLORS.warning[500]}
                          fill={star <= (mySubmission.rating || 0) ? COLORS.warning[500] : 'none'}
                        />
                      ))}
                    </View>
                    {mySubmission.feedback && (
                      <View style={styles.feedbackBox}>
                        <Text style={styles.feedbackText}>{mySubmission.feedback}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.pendingBox}>
                    <Clock size={20} color={COLORS.warning[500]} />
                    <Text style={styles.pendingText}>O'qituvchi tekshirishi kutilmoqda</Text>
                  </View>
                )}

                <Button
                  title="Qayta yuborish"
                  onPress={() => setIsResubmitting(true)}
                  type="outline"
                  style={{ marginTop: SPACING.md }}
                />
              </View>
            ) : (
              <View style={styles.submitFormCard}>
                <Text style={styles.submitFormTitle}>
                  {isResubmitting ? 'Javobni yangilash' : 'Vazifani topshirish'}
                </Text>
                
                <TouchableOpacity
                  style={styles.fileUploadArea}
                  onPress={handleFilePick}
                  activeOpacity={0.7}
                >
                  <View style={styles.uploadIconWrap}>
                    <Upload size={24} color={COLORS.primary[500]} />
                  </View>
                  <Text style={styles.uploadTitle}>
                    {selectedFile ? selectedFile.name : "Faylni tanlang"}
                  </Text>
                  <Text style={styles.uploadSub}>
                    {selectedFile ? "Boshqa fayl tanlash uchun bosing" : "PDF, Word yoki rasm formatida"}
                  </Text>
                </TouchableOpacity>

                <Input
                  label="Izoh (ixtiyoriy)"
                  placeholder="Vazifa haqida qo'shimcha ma'lumot..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.submitActions}>
                  {isResubmitting && (
                    <Button
                      title="Bekor qilish"
                      onPress={() => setIsResubmitting(false)}
                      type="outline"
                      style={{ flex: 1, marginRight: SPACING.sm }}
                    />
                  )}
                  <Button
                    title="Yuborish"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    gradient
                    style={{ flex: 2 }}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Teacher Rating Modal */}
      <Modal
        isVisible={!!ratingModalSubmission}
        onBackdropPress={() => setRatingModalSubmission(null)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Javobni baholash</Text>
          <Text style={styles.modalSubtitle}>
            {ratingModalSubmission?.profile?.full_name} ning javobi
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRatingValue(star)} style={styles.starBtn}>
                <Star
                  size={40}
                  color={COLORS.warning[500]}
                  fill={star <= ratingValue ? COLORS.warning[500] : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Izoh (Talaba uchun)"
            placeholder="Barakalla, lekin..."
            value={feedbackValue}
            onChangeText={setFeedbackValue}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Bekor qilish"
              onPress={() => setRatingModalSubmission(null)}
              type="outline"
              style={styles.modalButton}
            />
            <Button
              title="Saqlash"
              onPress={handleSaveRating}
              loading={isRatingLoading}
              gradient
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.error[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: SPACING['3xl'] },
  
  // Task Info Card
  taskInfoCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.xl,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  groupBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  groupBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.primary[600],
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
  },
  taskDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  attachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[900],
  },
  attachmentSub: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
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
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },

  // Submissions (Teacher)
  submissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  subUserInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  subUserName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[900],
  },
  subDate: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.gray[400],
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  ratingBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning[600],
  },
  subContent: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
  },
  subFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  subFileText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[600],
  },
  rateBtn: {
    backgroundColor: COLORS.gray[900],
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  rateBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },

  // Submit Form (Student)
  submitFormCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.xl,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: 'rgba(108, 58, 225, 0.05)',
  },
  submitFormTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray[900],
    marginBottom: SPACING.lg,
  },
  fileUploadArea: {
    borderWidth: 2,
    borderColor: COLORS.primary[200],
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    marginBottom: SPACING.lg,
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  uploadTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.primary[700],
    marginBottom: 4,
    textAlign: 'center',
  },
  uploadSub: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary[400],
    textAlign: 'center',
  },
  submitActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
  },

  // My Submission
  mySubmissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.success[200],
    ...SHADOWS.card,
  },
  mySubHeader: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  mySubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  mySubTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.success[600],
  },
  mySubDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  gradeBox: {
    backgroundColor: COLORS.gray[50],
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  gradeLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  gradeStars: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  feedbackBox: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    width: '100%',
  },
  feedbackText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    fontStyle: 'italic',
  },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  pendingText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning[700],
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
  },
  modalSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
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
