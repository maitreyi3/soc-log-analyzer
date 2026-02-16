import { api } from "./client";

export type Role = "admin" | "test";

export interface AuthResponse {
  logged_in: boolean;
  username?: string;
  role?: Role;
}

export const login = (username: string, password: string) =>
  api.post("/api/login", { username, password });

export const checkLogin = () =>
  api.get<AuthResponse>("/api/check_login");

export const logout = () =>
  api.post("/api/logout");
