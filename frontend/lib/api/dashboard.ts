import { api } from "./client";
import type { DashboardStats } from "@/lib/types/analytics";

export const getDashboard = () =>
  api.get<DashboardStats>("/api/dashboard");
