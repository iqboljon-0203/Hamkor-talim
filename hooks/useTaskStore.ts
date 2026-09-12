import { create } from 'zustand';
import {
  supabase,
  Task,
  Submission,
  TaskStatus,
  uploadFile,
  getFileUrl,
} from '@/lib/supabase';

interface TaskState {
  tasks: Task[];
  submissions: Submission[];
  taskStatuses: TaskStatus[];
  loading: boolean;
  error: string | null;
  restrictTasksToGroups: (groupIds: string[]) => void;

  // Task related methods
  fetchTasks: (groupId: string) => Promise<void>;
  fetchTasksByGroupIds: (groupIds: string[]) => Promise<void>;
  createTask: (
    task: Partial<Task>,
    file?: { uri: string; type: string; name: string },
  ) => Promise<{ success: boolean; error?: any }>;
  updateTask: (
    taskId: string,
    task: Partial<Task>,
    file?: { uri: string; type: string; name: string },
  ) => Promise<{ success: boolean; error?: any }>;
  getTaskDetails: (
    taskId: string,
  ) => Promise<{ task: Task | null; error?: any }>;
  deleteTask: (
    taskId: string,
  ) => Promise<{ success: boolean; error?: any }>;

  // Submission related methods
  fetchSubmissions: (
    taskIds: string[] | string,
    userId?: string,
  ) => Promise<void>;
  submitTask: (
    taskId: string,
    userId: string,
    file: { uri: string; type: string; name: string } | null,
    description: string,
  ) => Promise<{ success: boolean; error?: any }>;
  rateSubmission: (
    submissionId: string,
    rating: number,
    feedback: string,
  ) => Promise<{ success: boolean; error?: any }>;

  // Task status related methods
  fetchTaskStatuses: (userId: string) => Promise<void>;
  updateTaskStatus: (
    taskId: string,
    userId: string,
    status: 'completed' | 'pending' | 'locked',
  ) => Promise<{ success: boolean; error?: any }>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  submissions: [],
  taskStatuses: [],
  loading: false,
  error: null,
  restrictTasksToGroups: (groupIds) => {
    if (!groupIds || groupIds.length === 0) {
      set({ tasks: [] });
      return;
    }
    const { tasks } = get();
    const filteredTasks = tasks.filter((task) => groupIds.includes(task.group_id));
    if (filteredTasks.length !== tasks.length) {
      set({ tasks: filteredTasks });
    }
  },

  fetchTasks: async (groupId) => {
    // This function is kept for backward compatibility but using the batch fetcher internally is better if possible.
    // For now, let's keep it as single group fetch but improve state update.
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('group_id', groupId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const { tasks } = get();
      // Remove old tasks for this specific group to avoid duplicates, then add new ones
      const otherGroupTasks = tasks.filter((t) => t.group_id !== groupId);
      const newTasks = [...otherGroupTasks, ...(data || [])];
      
      // Sort all tasks
      newTasks.sort(
        (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      );

      set({ tasks: newTasks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Optimized batch fetching
  fetchTasksByGroupIds: async (groupIds: string[]) => {
     if (!groupIds.length) return;
     
     set({ loading: true, error: null });
     try {
       const { data, error } = await supabase
         .from('tasks')
         .select('*')
         .in('group_id', groupIds)
         .order('due_date', { ascending: true });

       if (error) throw error;

       const { tasks } = get();
       // Filter out tasks belonging to the requested groups (to replace them)
       const otherTasks = tasks.filter(t => !groupIds.includes(t.group_id));
       const allTasks = [...otherTasks, ...(data || [])];
       
       allTasks.sort(
        (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
       );

       set({ tasks: allTasks, loading: false });
     } catch (error: any) {
        set({ error: error.message, loading: false });
     }
  },

  createTask: async (task, file) => {
    try {
      let fileUrl;

      if (file) {
        const filePath = `tasks/${Date.now()}_${file.name}`;
        await uploadFile('task-files', filePath, file.uri, file.type || 'application/octet-stream');
        fileUrl = getFileUrl('task-files', filePath);
      }

      // Remove 'file' property if exists (typescript-friendly)
      const taskData = { ...task };
      delete (taskData as any).file;

      // Create the task
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, file_url: fileUrl }])
        .select();

      if (error) throw error;

      // Add to store
      const { tasks } = get();
      set({ tasks: [...tasks, data[0]] });

      // Get all students in the group and set their task status
      const { data: members, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', task.group_id);

      if (memberError) throw memberError;

      // Set initial status for all students
      const statusPromises = members.map((member) =>
        supabase.from('task_statuses').insert([
          {
            task_id: data[0].id,
            user_id: member.user_id,
            status: 'pending',
          },
        ]),
      );

      await Promise.all(statusPromises);

      return { success: true };
    } catch (error: any) {
      console.error('Task yaratishda xatolik:', error);
      return { success: false, error: error.message };
    }
  },

  updateTask: async (taskId, task, file) => {
    try {
      let fileUrl;

      // Upload new file if provided
      if (file) {
        const filePath = `tasks/${Date.now()}_${file.name}`;
        await uploadFile('task-files', filePath, file.uri, file.type || 'application/octet-stream');
        fileUrl = getFileUrl('task-files', filePath);
      }

      // Remove 'file' property if exists (typescript-friendly)
      const taskData = { ...task };
      delete (taskData as any).file;

      // Update the task
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...taskData, file_url: fileUrl })
        .eq('id', taskId)
        .select();

      if (error) throw error;

      // Update in store
      const { tasks } = get();
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, ...data[0] } : t,
      );

      set({ tasks: updatedTasks });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  getTaskDetails: async (taskId) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;

      return { task: data };
    } catch (error: any) {
      return { task: null, error: error.message };
    }
  },

  deleteTask: async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      const { tasks } = get();
      set({ tasks: tasks.filter((t) => t.id !== taskId) });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  fetchSubmissions: async (taskIds: string[] | string, userId?: string) => {
    if (Array.isArray(taskIds) && taskIds.length === 0) {
      set({ loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      console.log('[TaskStore] fetchSubmissions start', { taskIds, userId });

      let query = supabase
        .from('submissions')
        .select(
          `
          *,
          profile:profiles!left (
            id,
            full_name,
            email
          )
        `,
        );

      if (Array.isArray(taskIds)) {
        query = query.in('task_id', taskIds);
      } else {
        query = query.eq('task_id', taskIds);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Submissions fetch error:', error);
        throw error;
      }

      console.log('[TaskStore] fetchSubmissions received', {
        count: data?.length || 0,
        sample: data?.slice(0, 2).map((item) => ({
          id: item.id,
          user_id: item.user_id,
          profileFullName: item.profile?.full_name,
        })),
      });

      // Yangi javoblarni store'ga qo'shamiz
      const { submissions } = get();
      let filteredSubmissions;
      if (Array.isArray(taskIds)) {
        filteredSubmissions = submissions.filter(
          (sub) => !taskIds.includes(sub.task_id),
        );
      } else {
        filteredSubmissions = submissions.filter(
          (sub) => sub.task_id !== taskIds,
        );
      }
      set({
        submissions: [...filteredSubmissions, ...(data || [])],
        loading: false,
      });
    } catch (error: any) {
      console.error('Error in fetchSubmissions:', error);
      set({ error: error.message, loading: false });
    }
  },

  submitTask: async (
    taskId: string,
    userId: string,
    file: { uri: string; type: string; name: string } | null,
    description: string,
  ) => {
    try {
      // Fayl majburiy!
      if (!file) {
        throw new Error('Fayl tanlash majburiy!');
      }
      let fileUrl;

      // Fayl yuklash (majburiy)
      if (file) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${taskId}_${userId}_${Date.now()}.${fileExt}`;
          const filePath = `task-submissions/${fileName}`;

          await uploadFile(
            'submission-files',
            filePath,
            file.uri,
            file.type || 'application/octet-stream',
            false,
          );

          fileUrl = getFileUrl('submission-files', filePath);
        } catch (fileError: any) {
          console.error('Fayl yuklashda xatolik:', fileError);
          throw new Error(
            'Fayl yuklashda xatolik yuz berdi: ' + fileError.message,
          );
        }
      }

      // Javobni bazaga saqlash
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          task_id: taskId,
          user_id: userId,
          file_url: fileUrl,
          content: description,
          submitted_at: new Date().toISOString(),
        })
        .select();

      if (submissionError) {
        console.error('Javob saqlashda xatolik:', submissionError);
        throw new Error(
          'Javob saqlashda xatolik yuz berdi: ' + submissionError.message,
        );
      }

      // Javobni store'ga qo'shish
      const { submissions } = get();
      set({ submissions: [...submissions, submissionData[0]] });

      return { success: true };
    } catch (error: any) {
      console.error('Javob yuborishda xatolik:', error);
      return {
        success: false,
        error: error.message || 'Javob yuborishda xatolik yuz berdi',
      };
    }
  },

  rateSubmission: async (submissionId, rating, feedback) => {
    try {
      console.log('[TaskStore] rateSubmission start', {
        submissionId,
        rating,
        feedback,
      });

      const { error } = await supabase
        .from('submissions')
        .update({ rating, feedback })
        .eq('id', submissionId);

      if (error) throw error;

      // Update in store
      const { submissions } = get();
      const updatedSubmissions = submissions.map((sub) =>
        sub.id === submissionId ? { ...sub, rating, feedback } : sub,
      );

      set({ submissions: updatedSubmissions });

      console.log('[TaskStore] rateSubmission success');

      return { success: true };
    } catch (error: any) {
      console.error('[TaskStore] rateSubmission error', error);
      return { success: false, error: error.message };
    }
  },

  fetchTaskStatuses: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('task_statuses')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      set({ taskStatuses: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateTaskStatus: async (taskId, userId, status) => {
    try {
      const { error } = await supabase
        .from('task_statuses')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('task_id', taskId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update in store
      const { taskStatuses } = get();
      const updatedStatuses = taskStatuses.map((s) =>
        s.task_id === taskId && s.user_id === userId
          ? { ...s, status, updated_at: new Date().toISOString() }
          : s,
      ) as TaskStatus[];

      set({ taskStatuses: updatedStatuses });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
}));
