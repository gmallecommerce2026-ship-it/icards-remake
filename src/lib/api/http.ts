import axios, { type AxiosInstance } from "axios";

/**
 * Địa chỉ backend. Mặc định https://api.icards.com.vn/api.
 * Khi chạy local đặt NEXT_PUBLIC_API_URL=http://localhost:5000/api trong .env.local.
 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.icards.com.vn/api").replace(/\/+$/, "");

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
