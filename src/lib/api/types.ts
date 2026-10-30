// Kiểu tối thiểu. Backend chưa có schema chính thức: bổ sung field dần khi làm UI.
export type Id = string;
export interface Entity { _id: Id; createdAt?: string; updatedAt?: string; [key: string]: unknown }
export interface ListParams { page?: number; limit?: number; sort?: string; [key: string]: unknown }
export type User = Entity & { username?: string; email?: string; avatar?: string };
export type Invitation = Entity;
export type Guest = Entity;
export type GuestGroup = Entity;
export type Wish = Entity;
export type Template = Entity;
export type Product = Entity;
export type Page = Entity & { slug?: string; title?: string };
