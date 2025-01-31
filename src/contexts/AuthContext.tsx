import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types/auth';
import { getAuthErrorMessage, AUTH_ERRORS } from '../utils/auth-errors';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  
  const resetState = () => {
    setSession(null);
    setUser(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setError(getAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        try {
          await fetchUserProfile(session.user.id);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUser(null);
          setError(getAuthErrorMessage(err));
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!profile) throw new Error('No profile found');

      setUser({
        id: userId,
        email: session?.user?.email || '',
        role: profile.role,
        displayName: profile.display_name
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(getAuthErrorMessage(err));
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    let userData = null;

    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      if (error) throw error;
      if (!user) throw new Error('No user data returned');

      // Set session first
      setSession(session);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found');
      }

      userData = {
        id: user.id,
        email: user.email!,
        role: profile.role || 'user',
        displayName: profile.display_name,
        onboarding: {
          status: profile.onboarding_status,
          step: profile.onboarding_step
        }
      };

      setUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      console.error('Sign in error:', err);
      setUser(null);
      setSession(null);
      throw new Error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth state
      resetState();
      
      // Clear local storage
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      error, 
      signIn, 
      signUp: async () => {}, // Implement if needed
      signOut,
      clearError,
      resetState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};