import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE;

if (!baseURL) throw new Error("Missing NEXT_PUBLIC_API_BASE");

export const api = axios.create({
  baseURL,
  withCredentials: true,
});