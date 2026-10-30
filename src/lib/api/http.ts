import axios, { type AxiosInstance } from "axios";

const isServer = typeof window === "undefined";

function create(browserBase: string, serverBase: string | undefined): AxiosInstance {
  const instance = axios.create({
    // Browser: đi qua proxy rewrites (same-origin). Server (SSR): gọi thẳng backend.
    baseURL: isServer ? serverBase : browserBase,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("API Error:", error?.response?.data?.message || error.message);
      }
      // 401: xử lý logout/redirect tại AuthProvider (giai đoạn 2)
      return Promise.reject(error);
    }
  );
  return instance;
}

/** Backend chính: https://api.icards.com.vn/api */
export const api = create("/backend-api", process.env.API_URL);
/** Backend admin (settings công khai): https://adminapi.icards.com.vn/api/v1 */
export const adminApi = create("/admin-backend-api", process.env.ADMIN_API_URL);

export const multipart = { headers: { "Content-Type": "multipart/form-data" } };
