// Kiểu tối thiểu cho dữ liệu API. Kiểu chi tiết của từng danh mục nằm ở lib/templates.ts, shop.ts, services.ts, blog.ts, faq.ts.
export type Id = string;
export interface Entity { _id: Id; createdAt?: string; updatedAt?: string; [key: string]: unknown }
export interface ListParams { page?: number; limit?: number; sort?: string; [key: string]: unknown }
export type User = Entity & { username?: string; email?: string; fullName?: string; phone?: string; avatar?: string; role?: string };
export type Invitation = Entity;
export type Guest = Entity;
export type GuestGroup = Entity;
export type Wish = Entity;
export type Template = Entity;
export type Product = Entity;
export type Page = Entity & { slug?: string; title?: string };
