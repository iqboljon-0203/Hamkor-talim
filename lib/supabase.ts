import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

// Get environment variables
const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Define database related types
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
}

export interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  submitted_at: string;
  content?: string;
  file_url?: string;
  rating?: number;
  feedback?: string;
}

export interface TaskStatus {
  id: string;
  task_id: string;
  user_id: string;
  status: 'completed' | 'pending' | 'locked';
  updated_at: string;
}

// Helper function to upload a file to Supabase storage
export const uploadFile = async (
  bucket: string,
  filePath: string,
  fileUri: string,
  fileType: string,
) => {
  try {
    console.log('uploadFile chaqirildi:', {
      bucket,
      filePath,
      fileUri,
      fileType,
    });
    const response = await fetch(fileUri);
    const blob = await response.blob();
    console.log('Blob tayyor:', blob);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: fileType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }
    console.log('Supabase storage upload data:', data);
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Helper function to get a public URL for a file
export const getFileUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};
