import { api } from "./client";

export interface FileEntry {
  name: string;
  size?: number;
  uploaded_at?: string;
}

export const uploadLog = (formData: FormData) =>
  api.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getFiles = () =>
  api.get<FileEntry[]>("/api/files");

export const downloadFile = async (filename: string): Promise<Blob> => {
  const response = await api.get<Blob>(`/api/files/${filename}`, {
    responseType: "blob",
  });

  return response.data;
};
