import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { mutate } from '../lib/swrHooks';
import { userScopedKeys } from '../lib/swrKeys';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isActive: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  const syncUserState = async (authUser: User | null) => {
    // Clear user-scoped SWR caches when user changes
    if (!authUser || authUser.id !== user?.id) {
      // Invalidate all user-scoped SWR keys to prevent stale data across user switches
      if (user?.id) {
        const oldUserKeys = userScopedKeys(user.id);
        Object.values(oldUserKeys).forEach((key) => {
          if (key) mutate(key, undefined, false);
        });
      }
    }

    if (!authUser) {
      setUser(null);
      setIsAdmin(false);
      setIsActive(true);
      return;
    }

    const adminFlag = authUser.user_metadata?.is_admin === true;
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_active')
      .eq('id', authUser.id)
      .maybeSingle();

    const active = profile?.is_active ?? true;

    if (!active) {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setIsActive(false);
      return;
    }

    setUser(authUser);
    setIsAdmin(adminFlag);
    setIsActive(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncUserState(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        await syncUserState(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, [user?.id]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_active')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile && !profile.is_active) {
          await supabase.auth.signOut();
          return { error: new Error('Akun Anda sedang dinonaktifkan oleh admin') };
        }
      }

      return { error: error ? new Error(error.message) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isActive, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
