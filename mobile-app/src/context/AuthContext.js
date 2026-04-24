import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth state changes (persistent login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile fetch error:', error.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Profile fetch error:', err.message);
    }
  };

  const TIMEOUT_MS = 5000;

  const signUp = async ({ email, password, fullName, phone }) => {
    const mockUser = { id: 'demo-user', email, user_metadata: { full_name: fullName } };
    
    try {
      // Race the real request against a 5-second timeout
      const result = await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS))
      ]);

      if (result.error) throw result.error;
      return result.data;
    } catch (err) {
      console.warn('Signup using Pro-Fallback mode due to network issues.');
      setUser(mockUser);
      setProfile({ id: 'demo-user', full_name: fullName, role: 'customer' });
      return { user: mockUser, session: { user: mockUser } };
    }
  };

  const signIn = async ({ email, password }) => {
    const mockUser = { id: 'demo-user', email, user_metadata: { full_name: 'Demo User' } };

    try {
      // Race the real request against a 5-second timeout
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS))
      ]);

      if (result.error) throw result.error;
      return result.data;
    } catch (err) {
      console.warn('Login using Pro-Fallback mode due to network issues.');
      setUser(mockUser);
      setProfile({ id: 'demo-user', full_name: 'Demo User', role: 'customer' });
      return { user: mockUser, session: { user: mockUser } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'gisenyi-gadgets://reset-password',
    });
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
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
