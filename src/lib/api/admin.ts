import { api } from "./http";
import type { BannerGroupData } from "@/lib/banner-groups";
import type { PageCopy } from "@/lib/page-copy";

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

export type { BannerGroupData as BannerGroup, BannerItemData as BannerItem, BannerPage, BannerSlot, BannerLayout } from "@/lib/banner-groups";

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
  bannerGroups: BannerGroupData[];
  pageCopy?: PageCopy;
  introText: string;
  [key: string]: unknown;
};

export const getAdminSettings = () => api.get<AdminSiteSettings>("/admin/settings");

export const saveAdminBannerGroups = (bannerGroups: BannerGroupData[]) =>
  api.put<AdminSiteSettings>("/admin/settings/banner-groups", { bannerGroups });

export const saveAdminHeaderNav = (headerNav: NavItem[]) =>
  api.put<AdminSiteSettings>("/admin/settings/header-nav", { headerNav });

/** Bỏ Content-Type mặc định (application/json) để trình duyệt tự đặt multipart kèm boundary. */
export const uploadAdminImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<{ url: string }>("/admin/settings/uploads", form, { headers: { "Content-Type": undefined } });
};

/* ---------- Cửa hàng, dịch vụ, tin tức ---------- */

export type ProductVariantInput = { id: string; label: string; price: number };
export type AdminProduct = {
  _id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  thumb: string;
  tone: { bg: string; ink: string };
  variants: ProductVariantInput[];
  shipping: "ship" | "digital";
  leadTime: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  sortOrder: number;
  isPublished: boolean;
};
export type AdminService = {
  _id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  priceFrom: number;
  duration: string;
  audience: string;
  includes: string[];
  sortOrder: number;
  isPublished: boolean;
};
export type AdminPostBlock = { t: "h2" | "p" | "tip"; text: string } | { t: "ul"; items: string[] };
export type AdminPost = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedOn: string;
  readMinutes: number;
  author: string;
  tone: { bg: string; ink: string };
  content: AdminPostBlock[];
  isPublished: boolean;
};

export const getAdminProducts = (search?: string) => api.get<AdminProduct[]>("/admin/products", { params: { search } });
export const createAdminProduct = (body: Omit<AdminProduct, "_id">) => api.post<AdminProduct>("/admin/products", body);
export const updateAdminProduct = (id: string, body: Omit<AdminProduct, "_id">) => api.put<AdminProduct>(`/admin/products/${id}`, body);
export const deleteAdminProduct = (id: string) => api.delete(`/admin/products/${id}`);

export const getAdminServices = () => api.get<AdminService[]>("/admin/services");
export const createAdminService = (body: Omit<AdminService, "_id">) => api.post<AdminService>("/admin/services", body);
export const updateAdminService = (id: string, body: Omit<AdminService, "_id">) => api.put<AdminService>(`/admin/services/${id}`, body);
export const deleteAdminService = (id: string) => api.delete(`/admin/services/${id}`);

export const getAdminPosts = () => api.get<AdminPost[]>("/admin/posts");
export const createAdminPost = (body: Omit<AdminPost, "_id">) => api.post<AdminPost>("/admin/posts", body);
export const updateAdminPost = (id: string, body: Omit<AdminPost, "_id">) => api.put<AdminPost>(`/admin/posts/${id}`, body);
export const deleteAdminPost = (id: string) => api.delete(`/admin/posts/${id}`);

export const saveAdminBlogCategories = (categories: { slug: string; label: string }[]) =>
  api.put<{ categories: { slug: string; label: string }[] }>("/admin/blog-categories", { categories });

export const saveAdminPageCopy = (pageCopy: PageCopy) => api.put<AdminSiteSettings>("/admin/settings/page-copy", { pageCopy });

