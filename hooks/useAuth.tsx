import React, { useEffect, useState, createContext, useContext } from 'react';
import { supabase, UserProfile, UserRole } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

// Define the auth context type
type AuthContextType = {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    fullName: string,
    redirectTo?: string,
  ) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfileName: (newName: string) => Promise<{ error: any }>;
  isTeacher: boolean;
  refreshProfile: () => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`[Auth] AuthStateChange: ${event}`, newSession?.user?.email);
        setSession(newSession);
        setLoading(false);
        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id);
        } else {
          setUser(null);
        }
      },
    );

    // Get initial session
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession }, error }) => {
        if (error) {
           console.error('[Auth] getSession error:', error);
        }
        console.log('[Auth] getSession result:', initialSession?.user?.email);
        
        setSession(initialSession);
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
        setLoading(false);
      });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      // RLS policy recursion xatosini oldini olish uchun
      // Avval auth user ma'lumotlarini olamiz
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser?.user) {
        console.error('Error getting auth user:', authError);
        setUser(null);
        return;
      }

      // Profilni olishga harakat qilamiz - Timeout bilan
      // 5 soniya kutamiz, agar javob bo'lmasa fallback qilamiz
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      try {
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) {
          console.warn('Profile fetch error or not found:', error.code, error.message);
          
          // Profil topilmadi yoki xatolik, yangi profil yaratamiz yoki fallback qaytaramiz
          const fallbackProfile: UserProfile = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            full_name: authUser.user.user_metadata?.full_name || 'Foydalanuvchi',
            role: (authUser.user.user_metadata?.role as UserRole) || 'student',
            created_at: new Date().toISOString(),
          };

          // Agar profil yo'q bo'lsa (PGRST116), uni yaratishga urinib ko'ramiz (Orqa planda)
          if (error.code === 'PGRST116') {
             // Asinxron ravishda profil yaratamiz, foydalanuvchini kuttirmaymiz
             supabase.from('profiles').upsert([{
                id: userId,
                email: authUser.user.email || '',
                full_name: authUser.user.user_metadata?.full_name || 'Foydalanuvchi',
                role: (authUser.user.user_metadata?.role as UserRole) || 'student',
             }], { onConflict: 'id' }).then(({ error: upsertError }) => {
                if (upsertError) console.error('Background profile creation failed:', upsertError);
                else console.log('Background profile created successfully');
             });
          }
          
          setUser(fallbackProfile);
          return;
        }

        if (data) {
           setUser(data as UserProfile);
        } else {
           throw new Error('No data returned');
        }
      } catch (raceError) {
        console.error('Profile fetch race error:', raceError);
        // Timeout yoki boshqa xatolik bo'lsa ham fallback beramiz
        const fallbackProfile: UserProfile = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            full_name: authUser.user.user_metadata?.full_name || 'Foydalanuvchi',
            role: (authUser.user.user_metadata?.role as UserRole) || 'student',
            created_at: new Date().toISOString(),
        };
        setUser(fallbackProfile);
      }

    } catch (error: any) {
      console.error('Critical Error in fetchUserProfile:', error);
      // Eng yomon holatda ham login o'tishi kerak
      setUser({
            id: userId,
            email: '',
            full_name: 'Foydalanuvchi',
            role: 'student',
            created_at: new Date().toISOString(),
      });
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login request timed out')), 10000)
      );

      const { error } = (await Promise.race([
        signInPromise,
        timeoutPromise,
      ])) as any;

      return { error };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string,
    redirectTo?: string,
  ) => {
    try {
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
          },
          emailRedirectTo: redirectTo,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign up request timed out')), 10000)
      );

      const {
        data: { user, session },
        error: signUpError,
      } = (await Promise.race([signUpPromise, timeoutPromise])) as any;

      if (signUpError) return { error: signUpError };
      if (!user) return { error: new Error('Foydalanuvchi yaratilmadi') };

      // Agar email confirmation yoqilgan bo'lsa va redirectTo berilgan bo'lsa,
      // avtomatik kirishni o'tkazib yuboramiz va faqat muvaffaqiyat qaytaramiz
      if (redirectTo && !session) {
        return { error: null };
      }

      // Profile avtomatik ravishda database trigger orqali yaratiladi
      // Trigger: handle_new_user() funksiyasi auth.users jadvalida yangi foydalanuvchi yaratilganda ishga tushadi
      // Agar profile yaratilmagan bo'lsa, fetchUserProfile() funksiyasi uni yaratadi

      // Avtomatik kirish
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) return { error: signInError };

      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: error };
    }
  };

  const signOut = async () => {
    try {
      const signOutPromise = supabase.auth.signOut();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign out request timed out')), 5000)
      );

      const { error } = (await Promise.race([signOutPromise, timeoutPromise])) as any;
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const updateProfileName = async (newName: string) => {
    try {
      if (!user) throw new Error('Foydalanuvchi topilmadi');
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName.trim() })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // Check if the user is a teacher
  const isTeacher = user?.role === 'teacher';

  const value: AuthContextType = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfileName,
    isTeacher,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
