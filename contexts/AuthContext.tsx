import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthSession } from "@/types";

const AUTH_STORAGE_KEY = "@contractoros_auth_session";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsedSession = JSON.parse(stored) as AuthSession;
        setSession(parsedSession);
        console.log("[Auth] Session loaded:", parsedSession.user.email, parsedSession.user.role);
      } else {
        console.log("[Auth] No session found");
      }
    } catch (error) {
      console.error("[Auth] Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = async (newSession: AuthSession) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      console.log("[Auth] Session saved:", newSession.user.email, newSession.user.role);
    } catch (error) {
      console.error("[Auth] Failed to save session:", error);
      throw error;
    }
  };

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setSession(null);
      console.log("[Auth] Session cleared");
    } catch (error) {
      console.error("[Auth] Failed to clear session:", error);
    }
  };

  const login = async (authSession: AuthSession) => {
    await saveSession(authSession);
  };

  const logout = async () => {
    await clearSession();
  };

  const isAdmin = session?.user.role === "admin";
  const isCrew = session?.user.role === "crew";
  const isCustomer = session?.user.role === "customer";
  const isAuthenticated = !!session;

  return {
    session,
    isLoading,
    isAuthenticated,
    isAdmin,
    isCrew,
    isCustomer,
    user: session?.user ?? null,
    organization: session?.organization ?? null,
    login,
    logout,
  };
});
