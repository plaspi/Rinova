import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "@/components/splashScreen";
import { supabase } from "@/services/supabase_client";
import type { Session, User } from "@supabase/supabase-js";

export type UserRole = 'member' | 'admin' | 'representative';
export type SubPlan = 'free' | 'pro';

export type UserSettings = {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
        email: boolean;
        push: boolean;
        marketing: boolean;
    };
};

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
    theme: 'system',
    language: 'it',
    notifications: { email: true, push: true, marketing: false }
};

export type UserProfile = {
  id: string;
  name: string | null;
  surname: string | null;
  email: string | null;
  street_name: string | null;
  street_number: string | null;
  city: string | null;
  province: string | null;
  zip_code:string | null;
  role: UserRole;
  is_super_admin: boolean;
  avatar_url: string | null;
  subscription_plan: SubPlan; 
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  isPro: boolean;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // FIX: Ref to track the current user ID and prevent stale closures
  const currentUserId = useRef<string | null>(null);

  const isPro = profile?.subscription_plan === 'pro' || profile?.is_super_admin || false;
  const [settings, setSettings] = useState<UserSettings>({
        theme: 'system',
        language: 'it',
        notifications: { email: true, push: true, marketing: false }
    });

  // Helper fetch profile
  const fetchProfile = async (userId: string) => {
    console.log(`[AuthContext] Fetching profile`);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("[AuthContext] Error fetching profile");
      } else if (data) {
        const { data: memberData } = await supabase
          .from('cer_members')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        const finalProfile = {
          ...data,
          role: memberData?.role?.trim().toLowerCase() || 'member' 
        };
        
        setProfile(finalProfile as UserProfile);

        if(data.settings) {
          setSettings({...DEFAULT_SETTINGS, ...data.settings});
        }
      } else {
        console.warn("[AuthContext] Profile missing");
      }
    } catch (err) {
      console.error("[AuthContext] Critical Error fetching profile");
    }
  };

  // update user preferences and settings (first local state then db)
  const updateSettings = async (partialSettings: Partial<UserSettings>) => {
    if (!user) return;

    const newSettings = { ...settings, ...partialSettings };
    setSettings(newSettings);

    try {
        const { error } = await supabase
            .from('users')
            .update({ settings: newSettings })
            .eq('id', user.id);
        
        if (error) throw error;
    } catch (err) {
        console.error("Errore salvataggio settings");
    }
  };

  // 1. GESTIONE SESSIONE E PROFILO (Init + Listener Unificato)
  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;

    // Helper that strictly awaits profile fetching BEFORE dropping the loading screen
    const loadAuthAndProfile = async (currentSession: Session | null, isInitialLoad: boolean) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // FIX: Update our ref so we always know exactly who is logged in
      currentUserId.current = currentSession?.user?.id ?? null;

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }

      if (mounted) {
        setIsLoading(false);
        if (isInitialLoad) hasInitialized = true;
      }
    };

    // A. Initial Load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!hasInitialized) {
        loadAuthAndProfile(session, true);
      }
    });

    // B. Listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return; 

      if (hasInitialized && event === 'SIGNED_IN') {
        // FIX: If the user is already logged in, Supabase is just re-syncing the tab focus. Do nothing!
        if (session?.user?.id === currentUserId.current) {
            setSession(session); // Silently update the token just in case
            return;
        }

        // Only show splash screen if it's actually a brand new user logging in
        setIsLoading(true); 
        loadAuthAndProfile(session, false);
      } 
      else if (hasInitialized && event === 'SIGNED_OUT') {
        setIsLoading(true);
        loadAuthAndProfile(null, false);
      } 
      else if (event === 'TOKEN_REFRESHED') {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try{
      setIsLoggingOut(true);
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setProfile(null);
      currentUserId.current = null; // Clear the ref on logout
    } catch (error) {
      console.error("Logout error");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const refreshProfile = async () => {
    if(user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading, isLoggingOut, isPro, settings, updateSettings, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <SplashScreen />;

  return user ? <>{children}</> : null;
}