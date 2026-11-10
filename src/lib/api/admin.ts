import { api } from "./http";

export type AdminStats = {
  users: number;
  admins: number;
  inactiveUsers: number;
  invitations: number;
  publishedInvitations: number;
  pendingWishes: number;
  serviceRequests: number;
};

export type AdminUser = {
  _id: string;
  username: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
};

export type AdminInvitation = {
  _id: string;
  title: string;
  slug: string;
  eventType: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  owner: { _id: string; username: string | null; email: string | null };
};

export type Page<T> = { items: T[]; total: number; page: number; limit: number };

export const getAdminStats = () => api.get<AdminStats>("/admin/stats");

export const getAdminUsers = (params: { page?: number; limit?: number; search?: string; role?: string }) =>
  api.get<Page<AdminUser>>("/admin/users", { params });

export const updateAdminUser = (id: string, body: { role?: "user" | "admin"; isActive?: boolean }) =>
  api.patch<AdminUser>(`/admin/users/${id}`, body);

export const getAdminInvitations = (params: { page?: number; limit?: number; search?: string; status?: string }) =>
  api.get<Page<AdminInvitation>>("/admin/invitations", { params });

export type SiteBanner = {
  id: string;
  name: string;
  displayPage: string;
  isEnabled: boolean;
  imgSrc?: string | null;
  link?: string;
};

export type NavItem = {
  id: string;
  title: string;
  path?: string;
  order: number;
  isVisible: boolean;
  children: NavItem[];
};

export type AdminSiteSettings = {
  theme: unknown;
  headerNav: NavItem[];
  banners: SiteBanner[];
  introText: string;
  [key: string]: unknown;
};

export const getAdminSettings = () => api.get<AdminSiteSettings>("/admin/settings");

export const saveAdminBanners = (banners: SiteBanner[]) =>
  api.put<AdminSiteSettings>("/admin/settings/banners", { banners });

export const saveAdminHeaderNav = (headerNav: NavItem[]) =>
  api.put<AdminSiteSettings>("/admin/settings/header-nav", { headerNav });

/** Bỏ Content-Type mặc định (application/json) để trình duyệt tự đặt multipart kèm boundary. */
export const uploadAdminImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<{ url: string }>("/admin/settings/uploads", form, { headers: { "Content-Type": undefined } });
};
