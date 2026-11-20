'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, UserProfile, UserRole } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isTeacher: boolean;
  isGuest: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, fullName: string, role: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateGuestName: (newName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
        setIsGuest(false);
      }
    } catch (err) {
      console.error('[Auth] Error fetching profile:', err);
    }
  };

  const setupGuestSession = () => {
    if (typeof window === 'undefined') return;
    let guestId = localStorage.getItem('hamkor_guest_id');
    if (!guestId) {
      guestId = 'student_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('hamkor_guest_id', guestId);
    }
    const guestName = localStorage.getItem('hamkor_guest_name') || "Hamkor O'quvchi";

    const guestProfile: UserProfile = {
      id: guestId,
      email: 'oquvchi@hamkor.uz',
      full_name: guestName,
      role: 'student',
      created_at: new Date().toISOString(),
    };

    const mockUser: any = {
      id: guestId,
      email: 'oquvchi@hamkor.uz',
      app_metadata: {},
      user_metadata: { full_name: guestName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(guestProfile);
    setIsGuest(true);
  };

  useEffect(() => {
    let mounted = true;

    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          setIsGuest(false);
          await fetchProfile(session.user.id);
        } else if (mounted) {
          // Direct PWA access without forced login
          setupGuestSession();
        }
      } catch (err) {
        console.error('[Auth] Error getting session:', err);
        if (mounted) setupGuestSession();
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setIsGuest(false);
          await fetchProfile(session.user.id);
        } else {
          setupGuestSession();
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (!error && data.user) {
      setUser(data.user);
      setIsGuest(false);
      await fetchProfile(data.user.id);
    }
    return { error };
  };

  const signUp = async (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        // Insert profile row
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
        });

        setUser(data.user);
        setIsGuest(false);
        setProfile({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
        });
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth] Error signing out:', err);
    } finally {
      setupGuestSession();
    }
  };

  const refreshProfile = async () => {
    if (user && !isGuest) {
      await fetchProfile(user.id);
    }
  };

  const updateGuestName = (newName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hamkor_guest_name', newName);
      if (profile) {
        setProfile({ ...profile, full_name: newName });
      }
      if (user) {
        setUser({ ...user, user_metadata: { ...user.user_metadata, full_name: newName } } as any);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isTeacher: profile?.role === 'teacher',
        isGuest,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateGuestName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
