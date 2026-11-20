import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://skmoaeimhufhetmntiie.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbW9hZWltaHVmaGV0bW50aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjY4NjIsImV4cCI6MjA3ODYwMjg2Mn0.TkUAf9S2may5WIjXhCWWsKHwlAKmhEfGp8_PNLJfHzo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  description?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  group_id: string;
  created_by: string;
  created_at: string;
  file_url?: string;
  file_name?: string;
}

export interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  submitted_at: string;
  content?: string;
  file_url?: string;
  rating?: number;
  grade?: number;
  feedback?: string;
  status?: 'submitted' | 'graded' | 'late' | string;
  profile?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File | Blob,
  fileType?: string,
  upsert = true
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: fileType || file.type || 'application/octet-stream',
      upsert,
      cacheControl: '3600',
    });
  if (error) throw error;
  return data;
};

export const getFileUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};
