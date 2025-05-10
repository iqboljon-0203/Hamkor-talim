import { useEffect, useState, createContext, useContext } from 'react';
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
  ) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
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
}): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
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
      .then(async ({ data: { session: initialSession } }) => {
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profil topilmadi, yangi profil yaratamiz
          const { data: userData, error: userError } =
            await supabase.auth.getUser();

          if (userError) {
            console.error('Error getting user data:', userError);
            throw userError;
          }

          if (userData?.user) {
            const { error: insertError } = await supabase
              .from('profiles')
              .upsert(
                [
                  {
                    id: userId,
                    email: userData.user.email,
                    full_name:
                      userData.user.user_metadata.full_name || 'New User',
                    role: userData.user.user_metadata.role || 'student',
                  },
                ],
                { onConflict: 'id' },
              );

            if (insertError) {
              console.error('Error creating profile:', insertError);
              throw insertError;
            }

            // Get the newly created profile
            const { data: newProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (profileError) {
              console.error('Error fetching new profile:', profileError);
              throw profileError;
            }

            setUser(newProfile as UserProfile);
            return;
          }
        }
        console.error('Profile fetch error:', error);
        throw error;
      }

      setUser(data as UserProfile);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string,
  ) => {
    try {
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
          },
        },
      });

      if (signUpError) return { error: signUpError };
      if (!user) return { error: new Error('Foydalanuvchi yaratilmadi') };

      // Create profile with upsert to handle potential duplicates
      const { error: profileError } = await supabase.from('profiles').upsert(
        [
          {
            id: user.id,
            email,
            full_name: fullName,
            role,
          },
        ],
        { onConflict: 'id' },
      );

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { error: profileError };
      }

      // Avtomatik ravishda tizimga kirish
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) return { error: signInError };

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
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
