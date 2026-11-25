import axios from "axios";
import { clearSession, getToken, SESSION_EXPIRED_EVENT } from "../auth/session";

/** Base URL of the backend API, configured via VITE_API_URL (see .env.example). */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5067/api").replace(/\/+$/, "");

/** Shared axios instance: attaches the JWT and handles expired sessions in one place. */
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.toLowerCase().includes("/users/login");
    if (error.response?.status === 401 && !isAuthCall) {
      clearSession();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from an API error (ProblemDetails, {message}, or plain text). */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors).flat().join(" ");
  if (data?.title) return data.title;
  if (error?.response?.status === 429) return "Too many attempts. Please wait a minute and try again.";
  return fallback;
};

export default api;
