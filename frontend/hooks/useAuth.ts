"use client";

import { useEffect, useState } from "react";
import { checkLogin, logout as apiLogout } from "@/lib/api";

type Role = "admin" | "test" | null;

interface AuthState {
  loggedIn: boolean;
  username: string | null;
  role: Role;
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
    let mounted = true;

    checkLogin()
      .then((res) => {
        if (!mounted) return;

        setAuth({
          loggedIn: res.data.logged_in,
          username: res.data.username ?? null,
          role: res.data.role ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (!mounted) return;

        setAuth({
          loggedIn: false,
          username: null,
          role: null,
          loading: false,
        });
      });

    return () => {
      mounted = false;
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
