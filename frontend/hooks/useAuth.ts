"use client";

import { useEffect, useState } from "react";
import { checkLogin, logout as apiLogout, Role } from "@/lib/api/auth";

interface AuthState {
  loggedIn: boolean;
  username: string | null;
  role: Role | null;
  loading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    loggedIn: false,
    username: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const loadAuth = async () => {
      try {
        const res = await checkLogin();
        if (cancelled) return;

        setAuth({
          loggedIn: res.data.logged_in,
          username: res.data.username ?? null,
          role: res.data.role ?? null,
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setAuth({
            loggedIn: false,
            username: null,
            role: null,
            loading: false,
          });
        }
      }
    };

    loadAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    await apiLogout();
    setAuth({
      loggedIn: false,
      username: null,
      role: null,
      loading: false,
    });
  };

  return {
    ...auth,
    logout,
  };
}
