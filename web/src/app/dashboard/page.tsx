'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  Plus,
  LogOut,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  GraduationCap,
  Layers,
  ChevronRight,
  Loader2,
  X,
  Star,
  Upload,
  Download,
  Eye,
  Trash2,
  Share2,
  Check,
  Search,
  Filter,
  ArrowLeft,
  ExternalLink,
  Award,
  Sparkles,
  Paperclip,
  ZoomIn,
  UserCheck,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, Group, Task, Submission, uploadFile, getFileUrl } from '@/lib/supabase';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, isTeacher, isGuest, loading: authLoading, signOut } = useAuth();

  // Data states
  const [groups, setGroups] = useState<Group[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, { full_name: string; email: string }>>({});
  const [loadingData, setLoadingData] = useState(true);

  // Active view tab: 'tasks' | 'groups' | 'results' | 'calendar'
  const [activeTab, setActiveTab] = useState<'tasks' | 'groups' | 'results' | 'calendar'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Group Members Modal State
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<{ id: string; full_name: string; email: string; joined_at: string }[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Image Lightbox Preview
  const [previewingImage, setPreviewingImage] = useState<string | null>(null);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskGroupId, setTaskGroupId] = useState('');
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [taskFilePreview, setTaskFilePreview] = useState<string | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const taskFileInputRef = useRef<HTMLInputElement>(null);

  // New Group form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Join Group state
  const [joinGroupId, setJoinGroupId] = useState('');
  const [joiningGroup, setJoiningGroup] = useState(false);

  // Student Task Submission Form State
  const [subContent, setSubContent] = useState('');
  const [subFile, setSubFile] = useState<File | null>(null);
  const [subFilePreview, setSubFilePreview] = useState<string | null>(null);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [isEditingSub, setIsEditingSub] = useState(false);
  const subFileInputRef = useRef<HTMLInputElement>(null);

  // Teacher Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingFeedback, setRatingFeedback] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => {
    loadData();
  }, [user, isTeacher]);

  const loadData = async () => {
    setLoadingData(true);

    try {
      // 1. Fetch user groups
      let loadedGroups: Group[] = [];
      if (user && isTeacher) {
        const { data: gData } = await supabase
          .from('groups')
          .select('*')
          .eq('created_by', user.id);
        loadedGroups = (gData as Group[]) || [];
      } else if (user && !isGuest) {
        // Fetch groups user is a member of
        const { data: mData } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);
        const groupIds = (mData || []).map((m: any) => m.group_id);

        if (groupIds.length > 0) {
          const { data: gData } = await supabase
            .from('groups')
            .select('*')
            .in('id', groupIds);
          loadedGroups = (gData as Group[]) || [];
        } else {
          // Fallback: fetch general public groups
          const { data: allG } = await supabase.from('groups').select('*').limit(20);
          loadedGroups = (allG as Group[]) || [];
        }
      } else {
        // Guest / Public access
        const { data: allG } = await supabase.from('groups').select('*').limit(20);
        loadedGroups = (allG as Group[]) || [];
      }
      setGroups(loadedGroups);

      // 2. Fetch tasks for these groups
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });
      const loadedTasks = (tasksData as Task[]) || [];
      setTasks(loadedTasks);

      // 3. Fetch submissions
      let subsQuery = supabase.from('submissions').select('*');
      if (!isTeacher && user) {
        subsQuery = subsQuery.eq('user_id', user.id);
      }
      const { data: subsData } = await subsQuery.order('submitted_at', { ascending: false });
      const loadedSubs = (subsData as Submission[]) || [];
      setSubmissions(loadedSubs);

      // 4. Load profile details for student submissions
      const userIdsToFetch = Array.from(new Set(loadedSubs.map((s) => s.user_id)));
      if (userIdsToFetch.length > 0) {
        const { data: pData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIdsToFetch);
        if (pData) {
          const map: Record<string, { full_name: string; email: string }> = {};
          pData.forEach((p: any) => {
            map[p.id] = { full_name: p.full_name, email: p.email };
          });
          setProfilesMap(map);
        }
      }
    } catch (err) {
      console.error('[Dashboard] Error loading data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // ===================== FILE UPLOAD HELPER =====================
  const uploadFileToStorage = async (file: File, folder = 'tasks'): Promise<string> => {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${folder}/${Date.now()}_${cleanName}`;
      await uploadFile('task-files', filePath, file, file.type);
      return getFileUrl('task-files', filePath);
    } catch (err: any) {
      console.warn('[uploadFileToStorage] Storage upload note, fallback to DataURL:', err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  // ===================== VIEW GROUP MEMBERS =====================
  const handleOpenGroupMembers = async (group: Group) => {
    setViewingGroup(group);
    setLoadingMembers(true);
    setGroupMembers([]);

    try {
      const { data: mData, error } = await supabase
        .from('group_members')
        .select('user_id, joined_at')
        .eq('group_id', group.id);

      if (!error && mData && mData.length > 0) {
        const memberIds = mData.map((m: any) => m.user_id);
        const { data: pData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', memberIds);

        const profilesLookup: Record<string, any> = {};
        (pData || []).forEach((p: any) => {
          profilesLookup[p.id] = p;
        });

        const fullMemberList = mData.map((m: any) => ({
          id: m.user_id,
          full_name: profilesLookup[m.user_id]?.full_name || "Noma'lum O'quvchi",
          email: profilesLookup[m.user_id]?.email || '',
          joined_at: m.joined_at,
        }));

        setGroupMembers(fullMemberList);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching group members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // ===================== CREATE TASK =====================
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !taskTitle.trim() || !taskGroupId) {
      showToast("Iltimos, topshiriq nomi va guruhni tanlang!", "error");
      return;
    }

    setCreatingTask(true);
    try {
      let fileUrl = '';
      if (taskFile) {
        fileUrl = await uploadFileToStorage(taskFile, 'tasks');
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          due_date: taskDueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
          group_id: taskGroupId,
          created_by: user.id,
          file_url: fileUrl || null,
        })
        .select();

      if (!error && data) {
        setTasks((prev) => [...prev, data[0] as Task]);
        setIsTaskModalOpen(false);
        setTaskTitle('');
        setTaskDescription('');
        setTaskDueDate('');
        setTaskGroupId('');
        setTaskFile(null);
        setTaskFilePreview(null);
        showToast("Topshiriq muvaffaqiyatli e'lon qilindi!");
      } else {
        showToast("Topshiriq yaratishda xatolik yuz berdi", "error");
      }
    } catch (err) {
      console.error('[Dashboard] Error creating task:', err);
      showToast("Topshiriq yaratishda xatolik", "error");
    } finally {
      setCreatingTask(false);
    }
  };

  // ===================== CREATE GROUP =====================
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !groupName.trim()) return;

    setCreatingGroup(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          description: groupDescription.trim(),
          created_by: user.id,
        })
        .select();

      if (!error && data) {
        setGroups((prev) => [...prev, data[0] as Group]);
        setIsGroupModalOpen(false);
        setGroupName('');
        setGroupDescription('');
        showToast("Yangi guruh muvaffaqiyatli ochildi!");
      } else {
        showToast("Guruh ochishda xatolik yuz berdi", "error");
      }
    } catch (err) {
      console.error('[Dashboard] Error creating group:', err);
      showToast("Guruh ochishda xatolik", "error");
    } finally {
      setCreatingGroup(false);
    }
  };

  // ===================== JOIN GROUP =====================
  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinGroupId.trim()) return;

    setJoiningGroup(true);
    try {
      const { error } = await supabase.from('group_members').insert({
        group_id: joinGroupId.trim(),
        user_id: user.id,
      });

      if (!error) {
        setIsJoinGroupModalOpen(false);
        setJoinGroupId('');
        showToast("Guruhga muvaffaqiyatli a'zo bo'ldingiz!");
        loadData();
      } else {
        showToast("Guruhga a'zo bo'lishda xatolik yoki ID noto'g'ri", "error");
      }
    } catch (err) {
      console.error('[Dashboard] Error joining group:', err);
      showToast("Guruhga qo'shilishda xatolik", "error");
    } finally {
      setJoiningGroup(false);
    }
  };

  // ===================== SUBMIT TASK (STUDENT) =====================
  const handleSubmitTaskAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTask) return;

    if (!subContent.trim() && !subFile) {
      showToast("Iltimos, javob matnini yozing yoki fayl/rasm biriktiring!", "error");
      return;
    }

    setSubmittingTask(true);
    try {
      let fileUrl = '';
      if (subFile) {
        fileUrl = await uploadFileToStorage(subFile, 'submissions');
      }

      // Check if user already submitted for this task
      const existingSub = submissions.find(
        (s) => s.task_id === selectedTask.id && s.user_id === user.id
      );

      if (existingSub) {
        // Update existing submission
        const { data, error } = await supabase
          .from('submissions')
          .update({
            content: subContent.trim() || existingSub.content,
            file_url: fileUrl || existingSub.file_url,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existingSub.id)
          .select();

        if (!error && data) {
          setSubmissions((prev) =>
            prev.map((s) => (s.id === existingSub.id ? (data[0] as Submission) : s))
          );
        }
      } else {
        // Insert new submission
        const { data, error } = await supabase
          .from('submissions')
          .insert({
            task_id: selectedTask.id,
            user_id: user.id,
            content: subContent.trim(),
            file_url: fileUrl || null,
            submitted_at: new Date().toISOString(),
          })
          .select();

        if (!error && data) {
          setSubmissions((prev) => [data[0] as Submission, ...prev]);
        }
      }

      setSubContent('');
      setSubFile(null);
      setSubFilePreview(null);
      setIsEditingSub(false);
      showToast("Topshiriq javobi muvaffaqiyatli yuborildi!");
    } catch (err) {
      console.error('[Dashboard] Error submitting task:', err);
      showToast("Javobni yuborishda xatolik yuz berdi", "error");
    } finally {
      setSubmittingTask(false);
    }
  };

  // ===================== GRADE SUBMISSION (TEACHER) =====================
  const handleSaveGrade = async () => {
    if (!gradingSubmission) return;

    setSavingGrade(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          rating: ratingScore,
          grade: ratingScore,
          feedback: ratingFeedback.trim(),
          status: 'graded',
        })
        .eq('id', gradingSubmission.id)
        .select();

      if (!error && data) {
        const updated = data[0] as Submission;
        setSubmissions((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        setGradingSubmission(null);
        setRatingFeedback('');
        showToast("Baho va izoh muvaffaqiyatli saqlandi!");
      } else {
        showToast("Baholashda xatolik yuz berdi", "error");
      }
    } catch (err) {
      console.error('[Dashboard] Error grading submission:', err);
      showToast("Baholashda xatolik", "error");
    } finally {
      setSavingGrade(false);
    }
  };

  // ===================== DELETE TASK (TEACHER) =====================
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Haqiqatan ham bu topshiriqni o'chirmoqchimisiz?")) return;

    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
      showToast("Topshiriq o'chirildi");
    } catch (err) {
      console.error('[Dashboard] Error deleting task:', err);
      showToast("O'chirishda xatolik", "error");
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    const isLate = new Date(task.due_date).getTime() < Date.now();
    const mySub = submissions.find(
      (s) => s.task_id === task.id && s.user_id === user?.id
    );

    if (taskFilter === 'active') return !isLate && !mySub;
    if (taskFilter === 'completed') return !!mySub;
    if (taskFilter === 'overdue') return isLate && !mySub;
    return true;
  });

  // Calculate statistics
  const totalTasksCount = tasks.length;
  const activeTasksCount = tasks.filter(
    (t) => new Date(t.due_date).getTime() >= Date.now()
  ).length;
  const completedCount = isTeacher
    ? submissions.length
    : submissions.filter((s) => s.user_id === user?.id).length;
  const gradedCount = submissions.filter((s) => (s.rating || s.grade)).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* ===================== FLOATING TOAST NOTIFICATION ===================== */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-bold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300 shadow-emerald-500/20'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-300 shadow-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ===================== IMAGE LIGHTBOX MODAL ===================== */}
      {previewingImage && (
        <div
          onClick={() => setPreviewingImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewingImage}
              alt="Enlarged preview"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setPreviewingImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ===================== DASHBOARD DEDICATED APP HEADER ===================== */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                <GraduationCap className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-white block leading-tight">
                  HAMKOR TA'LIM
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  {isTeacher ? "Ustoz Kabineti" : "O'quvchi Kabineti"}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tasks'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Topshiriqlar</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px]">
                {tasks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'groups'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Guruhlar</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px]">
                {groups.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'results'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Baholar & Natijalar</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Taqvim</span>
            </button>
          </nav>

          {/* Right Action: User Pill & Login/Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {isGuest ? "Mehmon o'quvchi" : isTeacher ? "O'qituvchi" : "O'quvchi"}
                </div>
              </div>
            </div>

            {isGuest ? (
              <Link
                href="/login"
                title="O'qituvchi yoki profilingiz bilan kiring"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all"
              >
                <span>Kirish</span>
              </Link>
            ) : (
              <button
                onClick={signOut}
                title="Tizimdan chiqish"
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile View Tabs Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-white/10 px-2 py-2 bg-slate-950">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[11px] font-bold ${
              activeTab === 'tasks' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Vazifalar</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[11px] font-bold ${
              activeTab === 'groups' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Guruhlar</span>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[11px] font-bold ${
              activeTab === 'results' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Award className="w-4 h-4 mb-0.5" />
            <span>Baholar</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[11px] font-bold ${
              activeTab === 'calendar' ? 'text-purple-400' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>Taqvim</span>
          </button>
        </div>
      </header>

      {/* ===================== DASHBOARD MAIN CONTAINER ===================== */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Welcome & Summary Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-950/60 via-slate-900 to-amber-950/40 border border-white/10 shadow-2xl mb-8 overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTeacher ? "Ustoz Boshqaruv Markazi" : "O'quvchi Shaxsiy Kabineti"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Xush kelibsiz, {profile?.full_name || 'Foydalanuvchi'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xl">
                {isTeacher
                  ? "Topshiriqlar bering, o'quvchilar yuborgan javoblarni tekshirib 5 ballik tizimda baholang."
                  : "Berilgan topshiriqlarni bajaring, fayl yoki rasm ilova qiling va baholarni kuzatib boring."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {isTeacher ? (
                <>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yangi Topshiriq</span>
                  </button>
                  <button
                    onClick={() => setIsGroupModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs tracking-wider transition-all shadow-md"
                  >
                    <Users className="w-4 h-4" />
                    <span>Guruh Yaratish</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsJoinGroupModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs tracking-wider transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guruhga Qo'shilish</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Jami Topshiriqlar</span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalTasksCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Faol Muddatlar</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{activeTasksCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Topshirilgan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{completedCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 shadow-md">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Baholangan Ishlar</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-2xl font-black text-white">{gradedCount}</div>
          </div>
        </div>

        {/* ===================== TAB 1: TOPSHIRIQLAR ===================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Search & Filter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(['all', 'active', 'completed', 'overdue'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTaskFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      taskFilter === filter
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {filter === 'all' && 'Barchasi'}
                    {filter === 'active' && 'Faol'}
                    {filter === 'completed' && 'Topshirilgan'}
                    {filter === 'overdue' && "Muddati o'tgan"}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {loadingData ? (
              <div className="py-20 text-center text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3 text-amber-500" />
                <span>Topshiriqlar yuklanmoqda...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-20 px-4 text-center rounded-3xl bg-slate-900/60 border border-white/5">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">
                  Hozircha mos topshiriqlar topilmadi
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  {isTeacher
                    ? "Yangi topshiriq yaratib o'quvchilaringizga ulashing."
                    : "Sizda bu bo'limda hozircha faol topshiriqlar mavjud emas."}
                </p>
                {isTeacher && (
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Topshiriq yaratish</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTasks.map((task) => {
                  const group = groups.find((g) => g.id === task.group_id);
                  const isLate = new Date(task.due_date).getTime() < Date.now();
                  const mySub = submissions.find(
                    (s) => s.task_id === task.id && s.user_id === user?.id
                  );
                  const taskSubs = submissions.filter((s) => s.task_id === task.id);

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        {/* Top Metadata */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                            {group?.name || 'Umumiy Guruh'}
                          </span>

                          {mySub ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Topshirilgan</span>
                            </span>
                          ) : isLate ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Muddati o'tgan
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Faol
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-amber-400 transition-colors">
                          {task.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                          {task.description || "Qo'shimcha izoh mavjud emas."}
                        </p>

                        {/* File Attachment Pill */}
                        {task.file_url && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 text-[11px] font-semibold mb-3 border border-slate-700">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>Biriktirilgan fayl/rasm bor</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Due date & status/submissions */}
                      <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isTeacher ? (
                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                              {taskSubs.length} ta javob
                            </span>
                          ) : mySub?.rating ? (
                            <span className="flex items-center gap-1 text-xs font-black text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{mySub.rating} ball</span>
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                              Batafsil →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: GURUHLAR ===================== */}
        {activeTab === 'groups' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Mavjud Guruhlar</h3>
                <p className="text-xs text-slate-400">O'quvchilar va sinflar ro'yxati</p>
              </div>

              {isTeacher ? (
                <button
                  onClick={() => setIsGroupModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Guruh Yaratish</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsJoinGroupModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guruhga Qo'shilish</span>
                </button>
              )}
            </div>

            {groups.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-slate-900/60 border border-white/5">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Hozircha guruhlar mavjud emas</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  {isTeacher
                    ? "Yangi sinf yoki to'garak uchun guruh oching va o'quvchilarni jalb qiling."
                    : "Siz hali birorta guruhga a'zo bo'lmadingiz. Guruh kodi orqali qo'shiling."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {groups.map((group) => {
                  const groupTasks = tasks.filter((t) => t.group_id === group.id);
                  return (
                    <div
                      key={group.id}
                      className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/30 text-blue-400 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            ID: {group.id.slice(0, 8)}...
                          </span>
                        </div>

                        <h4 className="text-lg font-bold text-white mb-1">{group.name}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          {group.description || "Guruh haqida qo'shimcha ma'lumot kiritilmagan."}
                        </p>
                      </div>

                      <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs">
                        <button
                          onClick={() => handleOpenGroupMembers(group)}
                          className="text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <UserCheck className="w-4 h-4 text-blue-400" />
                          <span>{groupTasks.length} ta vazifa · A'zolar</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(group.id);
                            showToast(`Guruh ID nusxalandi: ${group.id.slice(0, 8)}...`);
                          }}
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 p-1 hover:bg-blue-500/10 rounded transition-colors"
                          title="Guruh ID sini nusxalash"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Ulashish</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: BAHOLAR & NATIJALAR ===================== */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Baholar va Natijalar Tahlili</h3>
              <p className="text-xs text-slate-400">
                {isTeacher
                  ? "Barcha o'quvchilar javoblari, qo'yilgan baholar va izohlar"
                  : "Siz topshirgan vazifalar va ustozingiz tomonidan qo'yilgan baholar"}
              </p>
            </div>

            {submissions.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-slate-900/60 border border-white/5">
                <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Hozircha topshirilgan ishlar yo'q</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Topshiriqlar bajarilib topshirilgach, natijalar shu yerda ko'rinadi.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-slate-900/80 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4">Topshiriq</th>
                          <th className="px-6 py-4">{isTeacher ? "O'quvchi" : "Guruh"}</th>
                          <th className="px-6 py-4">Topshirilgan Vaqt</th>
                          <th className="px-6 py-4">Fayl/Javob</th>
                          <th className="px-6 py-4">Baho (1-5)</th>
                          <th className="px-6 py-4 text-right">Amal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {submissions.map((sub) => {
                          const task = tasks.find((t) => t.id === sub.task_id);
                          const group = task ? groups.find((g) => g.id === task.group_id) : null;
                          const studentProfile = profilesMap[sub.user_id];
                          const gradeVal = sub.rating || sub.grade;

                          return (
                            <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-white text-sm">
                                  {task?.title || 'Topshiriq'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {isTeacher ? (
                                  <div>
                                    <div className="font-semibold text-slate-200">
                                      {studentProfile?.full_name || sub.user_id.slice(0, 8)}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {studentProfile?.email}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-blue-400 font-semibold">
                                    {group?.name || 'Umumiy'}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-400">
                                {formatDateTime(sub.submitted_at)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  {sub.content && (
                                    <div className="text-slate-300 line-clamp-1 max-w-xs">
                                      {sub.content}
                                    </div>
                                  )}
                                  {sub.file_url && (
                                    <button
                                      onClick={() => {
                                        if (sub.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i) || sub.file_url?.startsWith('data:image')) {
                                          setPreviewingImage(sub.file_url);
                                        } else {
                                          window.open(sub.file_url, '_blank');
                                        }
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline"
                                    >
                                      <Paperclip className="w-3 h-3" />
                                      <span>Faylni ko'rish</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {gradeVal ? (
                                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    <span>{gradeVal} ball</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic">Baholanmagan</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isTeacher ? (
                                  <button
                                    onClick={() => {
                                      setGradingSubmission(sub);
                                      setRatingScore(gradeVal || 5);
                                      setRatingFeedback(sub.feedback || '');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                                  >
                                    {gradeVal ? "O'zgartirish" : "Baholash"}
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-xs">
                                    {sub.feedback ? `Ustoz: "${sub.feedback}"` : "Izoh yo'q"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Responsive Cards View */}
                <div className="md:hidden space-y-3">
                  {submissions.map((sub) => {
                    const task = tasks.find((t) => t.id === sub.task_id);
                    const gradeVal = sub.rating || sub.grade;

                    return (
                      <div
                        key={sub.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2.5"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-sm">{task?.title || 'Topshiriq'}</h4>
                          {gradeVal ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{gradeVal} ball</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic bg-slate-950 px-2 py-0.5 rounded">
                              Baholanmagan
                            </span>
                          )}
                        </div>

                        {sub.content && <p className="text-xs text-slate-300">"{sub.content}"</p>}

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                          <span>{formatDateTime(sub.submitted_at)}</span>
                          {sub.file_url && (
                            <button
                              onClick={() => {
                                if (sub.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i) || sub.file_url?.startsWith('data:image')) {
                                  setPreviewingImage(sub.file_url);
                                } else {
                                  window.open(sub.file_url, '_blank');
                                }
                              }}
                              className="text-amber-400 font-semibold text-xs flex items-center gap-1"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>Fayl</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===================== TAB 4: TAQVIM ===================== */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Vazifalar Taqvimi va Muddatlar</h3>
              <p className="text-xs text-slate-400">Dedlaynlar ketma-ketligi va reja</p>
            </div>

            {tasks.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-slate-900/60 border border-white/5">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Taqvimda muddatlar yo'q</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Topshiriqlar yaratilgach, ularning barcha muddatlari tartibli ro'yxatda aks etadi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const group = groups.find((g) => g.id === task.group_id);
                  const isLate = new Date(task.due_date).getTime() < Date.now();

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 flex items-center justify-between gap-4 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-600/15 text-purple-400 flex flex-col items-center justify-center font-bold shrink-0">
                          <span className="text-[10px] uppercase">
                            {new Date(task.due_date).toLocaleString('uz-UZ', { month: 'short' })}
                          </span>
                          <span className="text-base font-black">
                            {new Date(task.due_date).getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{task.title}</h4>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {group?.name || 'Umumiy'} · Muddat: {formatDateTime(task.due_date)}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                          isLate
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {isLate ? "Muddati o'tgan" : "Faol"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===================== TASK DETAIL & SUBMISSION & GRADING MODAL ===================== */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsEditingSub(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-md">
                  {groups.find((g) => g.id === selectedTask.group_id)?.name || 'Umumiy Guruh'}
                </span>
                <span className="text-xs text-slate-400">
                  Muddat: <b>{formatDateTime(selectedTask.due_date)}</b>
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{selectedTask.title}</h2>
            </div>

            {/* Description */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-sm text-slate-300 leading-relaxed mb-6">
              {selectedTask.description || "Topshiriq uchun qo'shimcha izoh kiritilmagan."}
            </div>

            {/* Attached file/image to the task itself */}
            {selectedTask.file_url && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20">
                <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4" />
                  <span>Ustoz biriktirgan fayl yoki rasm:</span>
                </div>

                {selectedTask.file_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ||
                selectedTask.file_url.startsWith('data:image') ? (
                  <div
                    onClick={() => setPreviewingImage(selectedTask.file_url!)}
                    className="rounded-xl overflow-hidden max-h-72 border border-slate-800 bg-black flex items-center justify-center mb-2 cursor-zoom-in relative group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedTask.file_url}
                      alt="Task attachment"
                      className="max-h-72 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                      <ZoomIn className="w-4 h-4" />
                      <span>Kattalashtirib ko'rish</span>
                    </div>
                  </div>
                ) : (
                  <a
                    href={selectedTask.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Faylni yuklab olish / ko'rish</span>
                  </a>
                )}
              </div>
            )}

            {/* STUDENT SECTION: Submit homework */}
            {!isTeacher && (
              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Javobingizni topshiring</span>
                </h3>

                {/* If student already submitted */}
                {(() => {
                  const mySub = submissions.find(
                    (s) => s.task_id === selectedTask.id && s.user_id === user?.id
                  );

                  if (mySub && !isEditingSub) {
                    const gradeVal = mySub.rating || mySub.grade;
                    return (
                      <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 mb-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Vazifa topshirilgan ({formatDateTime(mySub.submitted_at)})</span>
                          </span>
                          {gradeVal && (
                            <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-lg">
                              ⭐ {gradeVal} ball
                            </span>
                          )}
                        </div>

                        {mySub.content && (
                          <p className="text-xs text-slate-300">
                            <b>Sizning izohingiz:</b> {mySub.content}
                          </p>
                        )}

                        {mySub.file_url && (
                          <div className="pt-1">
                            <button
                              onClick={() => {
                                if (mySub.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i) || mySub.file_url?.startsWith('data:image')) {
                                  setPreviewingImage(mySub.file_url);
                                } else {
                                  window.open(mySub.file_url, '_blank');
                                }
                              }}
                              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-semibold"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>Yuklangan javob faylingizni ochish</span>
                            </button>
                          </div>
                        )}

                        {mySub.feedback && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-200">
                            <span className="text-amber-400 font-bold block mb-1">
                              Ustoz xulosasi:
                            </span>
                            "{mySub.feedback}"
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setIsEditingSub(true);
                              setSubContent(mySub.content || '');
                            }}
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Javobni qayta yuborish / tahrirlash →
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Submission Form */}
                {(!submissions.find((s) => s.task_id === selectedTask.id && s.user_id === user?.id) || isEditingSub) && (
                  <form onSubmit={handleSubmitTaskAnswer} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Javob matni yoki izoh:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Bajargan ishingiz haqida qisqacha ma'lumot yozing..."
                        value={subContent}
                        onChange={(e) => setSubContent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Attachment File Input for Student */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Daftar rasmi yoki javob fayli:
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          ref={subFileInputRef}
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSubFile(file);
                              if (file.type.startsWith('image/')) {
                                setSubFilePreview(URL.createObjectURL(file));
                              } else {
                                setSubFilePreview(null);
                              }
                            }
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => subFileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                        >
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span>Fayl/Rasm tanlash</span>
                        </button>

                        {subFile && (
                          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                            <span className="truncate max-w-[200px]">{subFile.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSubFile(null);
                                setSubFilePreview(null);
                              }}
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {subFilePreview && (
                        <div className="mt-3 w-28 h-28 rounded-xl overflow-hidden border border-slate-700 bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={subFilePreview}
                            alt="Student upload preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={submittingTask}
                        className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        {submittingTask ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Yuborilmoqda...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Javobni Yuborish</span>
                          </>
                        )}
                      </button>

                      {isEditingSub && (
                        <button
                          type="button"
                          onClick={() => setIsEditingSub(false)}
                          className="px-4 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                        >
                          Bekor qilish
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TEACHER SECTION: View and Grade Student Submissions */}
            {isTeacher && (
              <div className="border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>O'quvchilar javoblari ({submissions.filter((s) => s.task_id === selectedTask.id).length})</span>
                  </h3>

                  <button
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Topshiriqni o'chirish</span>
                  </button>
                </div>

                {submissions.filter((s) => s.task_id === selectedTask.id).length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-white/5 text-center text-xs text-slate-400">
                    Hozircha hech bir o'quvchi javob yubormadi.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions
                      .filter((s) => s.task_id === selectedTask.id)
                      .map((sub) => {
                        const studentProfile = profilesMap[sub.user_id];
                        const gradeVal = sub.rating || sub.grade;

                        return (
                          <div
                            key={sub.id}
                            className="p-4 rounded-2xl bg-slate-950 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {studentProfile?.full_name || sub.user_id.slice(0, 8)}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {formatDateTime(sub.submitted_at)}
                                </span>
                              </div>

                              {sub.content && (
                                <p className="text-xs text-slate-300">"{sub.content}"</p>
                              )}

                              {sub.file_url && (
                                <div>
                                  <button
                                    onClick={() => {
                                      if (sub.file_url?.match(/\.(jpeg|jpg|gif|png|webp)/i) || sub.file_url?.startsWith('data:image')) {
                                        setPreviewingImage(sub.file_url);
                                      } else {
                                        window.open(sub.file_url, '_blank');
                                      }
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-semibold"
                                  >
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>Javob fayli/rasmini ochish</span>
                                  </button>
                                </div>
                              )}

                              {sub.feedback && (
                                <div className="text-[11px] text-slate-400">
                                  <b>Izohingiz:</b> "{sub.feedback}"
                                </div>
                              )}
                            </div>

                            {/* Grade & Action */}
                            <div className="flex items-center gap-3 shrink-0">
                              {gradeVal ? (
                                <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                  <span>{gradeVal} ball</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-lg">
                                  Baholanmagan
                                </span>
                              )}

                              <button
                                onClick={() => {
                                  setGradingSubmission(sub);
                                  setRatingScore(gradeVal || 5);
                                  setRatingFeedback(sub.feedback || '');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                              >
                                {gradeVal ? "O'zgartirish" : "Baholash"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== GROUP MEMBERS MODAL ===================== */}
      {viewingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setViewingGroup(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Guruh ID: {viewingGroup.id}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{viewingGroup.name}</h3>
              <p className="text-xs text-slate-400">{viewingGroup.description || "Guruh a'zolari ro'yxati"}</p>
            </div>

            {loadingMembers ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                <span>A'zolar ro'yxati yuklanmoqda...</span>
              </div>
            ) : groupMembers.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-400">
                Bu guruhga hozircha o'quvchilar qo'shilmagan.
                <div className="mt-2 text-blue-400 font-mono text-[11px]">
                  Guruh ID si: {viewingGroup.id}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {groupMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{member.full_name}</div>
                        <div className="text-[10px] text-slate-400">{member.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {formatDate(member.joined_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TEACHER GRADING MODAL ===================== */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setGradingSubmission(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">O'quvchi Javobini Baholash</h3>
            <p className="text-xs text-slate-400 mb-6">
              O'quvchiga 1 dan 5 gacha baho qo'ying va izoh qoldiring:
            </p>

            {/* 1-5 Star selector */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-300 block mb-2">Baho (1 - 5):</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setRatingScore(score)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-1 transition-all ${
                      ratingScore >= score
                        ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span>{score}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback textarea */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Ustoz izohi / Tavsiya:
              </label>
              <textarea
                rows={3}
                placeholder="A'lo ish, barcha misollar to'g'ri ishlangan..."
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleSaveGrade}
              disabled={savingGrade}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {savingGrade ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Bahoni Saqlash</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ===================== CREATE TASK MODAL (TEACHER) ===================== */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Yangi Topshiriq Yaratish</h3>
            <p className="text-xs text-slate-400 mb-6">
              O'quvchilarga yangi vazifa bering va fayl/rasm biriktiring
            </p>

            {groups.length === 0 ? (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                <Info className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Sizda hali guruhlar yo'q</h4>
                <p className="text-xs text-slate-300">
                  Topshiriq biriktirish uchun avval kamida bitta guruh yaratishingiz kerak.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setIsGroupModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Guruh yaratish
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Topshiriq nomi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: 12-Mavzu bo'yicha masalalar"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Guruhni tanlang *
                  </label>
                  <select
                    required
                    value={taskGroupId}
                    onChange={(e) => setTaskGroupId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Guruhni tanlang...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Topshirish muddati (Dedlayn)
                  </label>
                  <input
                    type="datetime-local"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Tavsif va ko'rsatmalar
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Vazifa shartlari va talablari..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Task File Attachment Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Fayl yoki Rasm biriktirish (ixtiyoriy):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={taskFileInputRef}
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setTaskFile(file);
                          if (file.type.startsWith('image/')) {
                            setTaskFilePreview(URL.createObjectURL(file));
                          } else {
                            setTaskFilePreview(null);
                          }
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => taskFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Fayl tanlash</span>
                    </button>

                    {taskFile && (
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="truncate max-w-[200px]">{taskFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTaskFile(null);
                            setTaskFilePreview(null);
                          }}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {taskFilePreview && (
                    <div className="mt-3 w-28 h-28 rounded-xl overflow-hidden border border-slate-700 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={taskFilePreview}
                        alt="Task file preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={creatingTask}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {creatingTask ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Yaratilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Topshiriqni E'lon Qilish</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================== CREATE GROUP MODAL ===================== */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsGroupModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Yangi Guruh Ochish</h3>
            <p className="text-xs text-slate-400 mb-6">
              Sinfingiz yoki to'garak nomini kiriting
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Guruh nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 10-A Sinf Matematika"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tavsif (ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  placeholder="Guruh maqsadi yoki dars vaqtlari..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={creatingGroup}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {creatingGroup ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yaratilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Guruhni Saqlash</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== JOIN GROUP MODAL (STUDENT) ===================== */}
      {isJoinGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsJoinGroupModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Guruhga Qo'shilish</h3>
            <p className="text-xs text-slate-400 mb-6">
              O'qituvchingiz bergan Guruh ID raqamini kiriting:
            </p>

            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Guruh ID raqami *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: c8a19283-..."
                  value={joinGroupId}
                  onChange={(e) => setJoinGroupId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={joiningGroup}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {joiningGroup ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Qo'shilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guruhga A'zo Bo'lish</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
