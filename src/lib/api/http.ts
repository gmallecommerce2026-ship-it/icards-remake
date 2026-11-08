import axios, { type AxiosInstance } from "axios";

/**
 * Địa chỉ backend, cố định lúc BUILD (NEXT_PUBLIC_*).
 * - VPS (khuyến nghị): NEXT_PUBLIC_API_URL=/api  → browser gọi cùng domain, Next proxy sang API (xem next.config.mjs).
 * - Local: NEXT_PUBLIC_API_URL=http://localhost:5000/api trong .env.local.
 * Phía server (SSR) không dùng được đường dẫn tương đối nên tự chuyển sang API_INTERNAL_URL.
 */
const PUBLIC_API = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.icards.com.vn/api").replace(/\/+$/, "");
const SERVER_API = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:3001").replace(/\/+$/, "");
export const API_BASE_URL = typeof window === "undefined" && PUBLIC_API.startsWith("/") ? `${SERVER_API}${PUBLIC_API}` : PUBLIC_API;

/** Phát khi backend trả 401 (phiên hết hạn). AuthProvider lắng nghe để đăng xuất. */
export const UNAUTHORIZED_EVENT = "icards:unauthorized";

/** Dùng cho cả browser và server component. Cookie httpOnly icards_token được gửi nhờ withCredentials. */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("API Error:", error?.response?.data?.message || error.message);
    }
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

export const multipart = { headers: { "Content-Type": "multipart/form-data" } };
