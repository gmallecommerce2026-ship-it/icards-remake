"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, UNAUTHORIZED_EVENT } from "@/lib/api";

/** Dạng người dùng mà giao diện đang dùng (giữ nguyên tên field để các trang dashboard không phải đổi). */
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarBg: string;
};

/** Dạng user trả về từ backend (xem docs/API_CONTRACT.md). */
type ApiUser = { _id: string; username?: string; email?: string; fullName?: string | null; phone?: string | null };

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  /** true trong lúc kiểm tra phiên đăng nhập ban đầu */
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AVATAR_BG = "#a3152f"; // bg-lacquer

const toUser = (u: ApiUser): User => ({
  id: u._id,
  name: u.fullName || u.username || u.email || "",
  email: u.email ?? "",
  phone: u.phone ?? "",
  avatarBg: AVATAR_BG,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(toUser(data as ApiUser));
    } catch {
      setUser(null); // 401 = chưa đăng nhập, không phải lỗi
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Khi API báo 401 giữa chừng (cookie hết hạn) thì coi như đã đăng xuất
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (login: string, password: string) => {
    const { data } = await authApi.login(login, password);
    setUser(toUser(data.user as ApiUser));
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { data } = await authApi.register(username, email, password);
    setUser(toUser((data as { user: ApiUser }).user));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: !!user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
}
