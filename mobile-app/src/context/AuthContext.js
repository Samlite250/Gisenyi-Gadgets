import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { authLogger } from '../utils/logger';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const justRegistered = useRef(false);
  const [profile, setProfile] = useState(null);

  // Use scope:'local' so we don't hit the server with an already-dead token
  const clearStaleSession = async () => {
    try {
      // Force clear AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      const supabaseKeys = keys.filter(key =>
        key.includes('supabase.auth.token') ||
        key.includes('sb-') ||
        key.startsWith('supabase-auth-token')
      );
      if (supabaseKeys.length > 0) {
        await AsyncStorage.multiRemove(supabaseKeys);
        authLogger.info('Cleared stale session keys from AsyncStorage');
      }
    } catch (err) {
      authLogger.warn('Failed to clear AsyncStorage keys:', err.message);
    }

    await supabase.auth.signOut({ scope: 'local' });
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        authLogger.warn('Session retrieval error, clearing local session:', error.message);
        await clearStaleSession();
      } else if (session) {
        // Session already contains user - no need to call getUser()
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch(async (err) => {
      // Catch any unexpected errors during session initialization
      authLogger.error('Failed to initialize session:', err.message);
      await clearStaleSession();
      setLoading(false);
    });

    // Listen for auth state changes (persistent login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        authLogger.info('Auth state change:', event);

        // If signUp() set the flag, immediately sign out so the user lands on Login
        if ((event === 'SIGNED_IN' || event === 'SIGNED_UP') && justRegistered.current) {
          justRegistered.current = false;
          await supabase.auth.signOut({ scope: 'local' });
          return;
        }

        // Handle token refresh errors and unexpected sign-outs
        if (event === 'TOKEN_REFRESHED' && !session) {
          authLogger.warn('Token refresh failed, clearing stale session');
          await clearStaleSession();
          return;
        }

        // Handle auth errors (invalid/expired tokens)
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

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
        authLogger.warn('Profile fetch error', error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      authLogger.error('Profile fetch failed', err);
    }
  };

  const signUp = async ({ email, password, fullName, phone }) => {
    justRegistered.current = true;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) {
      justRegistered.current = false;
      throw error;
    }
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    if (Platform.OS === 'web') {
      // On web, use full-page redirect — no popup (avoids COOP issues)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      return;
    }

    // Native (Android/iOS): open browser, capture deep-link callback
    const redirectUrl = makeRedirectUri({ scheme: 'com.gisenyigadgets.app', path: 'auth/callback' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success') {
      const url = result.url;

      // PKCE flow: Supabase returns ?code= which must be exchanged for a session
      const queryParams = new URLSearchParams(url.split('?')[1] || '');
      const code = queryParams.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        return;
      }

      // Fallback: implicit flow returns #access_token= in the hash
      const hashParams = new URLSearchParams(url.split('#')[1] || '');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    // For mobile: use deep link, for web: use current origin
    const redirectTo = Platform.OS === 'web'
      ? `${window.location.origin}/reset-password`
      : 'com.gisenyigadgets.app://reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
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
    signInWithGoogle,
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
