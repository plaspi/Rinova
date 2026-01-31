import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "@/components/splashScreen";
import { supabase } from "@/services/supabase_client";
import type { Session, User } from "@supabase/supabase-js";

export type UserRole = 'member' | 'admin' | 'representative';
export type SubPlan = 'free' | 'pro';

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
  const isPro = profile?.subscription_plan === 'pro' || profile?.is_super_admin || false;

  // Helper fetch profile
  const fetchProfile = async (userId: string) => {
    console.log(`[AuthContext] Fetching profile for ${userId}...`);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("[AuthContext] Error fetching profile:", error);
      } else if (data) {
        setProfile(data as UserProfile);
      } else {
        console.warn("[AuthContext] Profile missing");
      }
    } catch (err) {
      console.error("[AuthContext] Critical Error:", err);
    }
  };

  // 1. GESTIONE SESSIONE (Init + Listener)
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Init session error:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`[AuthContext] Auth State Change: ${_event}`);
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false); 
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user]); // Dipendenza cruciale: user

  const signOut = async () => {
    try{
      setIsLoggingOut(true);
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout error: ", error);
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
    <AuthContext.Provider value={{ session, user, profile, isLoading, isLoggingOut, isPro, refreshProfile, signOut }}>
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
    // Se il caricamento è finito e non c'è l'utente, vai al login
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <SplashScreen />;

  return user ? <>{children}</> : null;
}