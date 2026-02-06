import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000",
  withCredentials: true,
});

export const login = (username: string, password: string) =>
  api.post("/api/login", { username, password });

export const checkLogin = () => api.get("/api/check_login");
export const logout = () => api.post("/api/logout");

export const uploadLog = (formData: FormData) =>
  api.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getDashboard = () => api.get("/api/dashboard");
export const getFiles = () => api.get("/api/files");

export const downloadFile = async (filename: string) => {
  const response = await api.get(`/api/files/${filename}`, {
    responseType: "blob",
  });

  return response.data;
};

export default api;
