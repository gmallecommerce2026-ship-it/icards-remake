import { api } from "./http";
import type { User } from "./types";

export const getMe = () => api.get<User>("/users/me");
export const login = (login: string, password: string) =>
  api.post<{ user: User }>("/auth/login", { login, password });
export const logout = () => api.post("/auth/logout");
export const register = (username: string, email: string, password: string) =>
  api.post("/auth/register", { username, email, password });
export const forgotPassword = (email: string) => api.post("/auth/forgot-password", { email });
export const resetPassword = (token: string, body: Record<string, unknown>) =>
  api.patch(`/auth/reset-password/${token}`, body);
