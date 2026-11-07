// Lấy dữ liệu danh mục cho các trang công khai (chỉ dùng trong server component).
// Mọi dữ liệu đều đến từ backend; mock cũ đã được seed vào DB (xem backend: npm run seed).
import { serverGet } from "./api/server";
import type { PublicContentKey } from "./api/content-keys";
import type { InvitationTemplate } from "./templates";
import type { Product } from "./shop";
import type { Service, ProcessStep } from "./services";
import type { Post } from "./blog";
import type { FaqGroup, FaqItem } from "./faq";
import type { PortfolioItem, Tier, ProfessionalProcessStep } from "./professional";

export type Option = { id: string; label: string };
export type SlugOption = { slug: string; label: string };

async function content<T>(key: PublicContentKey, fallback: T): Promise<T> {
  return (await serverGet<T>(`/public/content/${key}`)) ?? fallback;
}

// ---- Mẫu thiệp
export const getTemplates = async (query?: { category?: string; sort?: string; limit?: number }) =>
  (await serverGet<InvitationTemplate[]>("/invitation-templates", query)) ?? [];
export const getTemplate = (slug: string) => serverGet<InvitationTemplate>(`/invitation-templates/${slug}`);
export const getTemplateCategories = () => content<Option[]>("templates.categories", []);

// ---- Cửa hàng
export const getProducts = async (query?: { category?: string; limit?: number }) =>
  (await serverGet<Product[]>("/products", query)) ?? [];
export const getProduct = (slug: string) => serverGet<Product>(`/products/${slug}`);
export const getShopCategories = () => content<Option[]>("shop.categories", []);

// ---- Dịch vụ
export const getServices = async () => (await serverGet<Service[]>("/services")) ?? [];
export const getService = (slug: string) => serverGet<Service>(`/services/${slug}`);
export const getServicesProcess = () => content<ProcessStep[]>("services.process", []);

// ---- Blog
export const getPosts = async () => (await serverGet<Post[]>("/pages", { isBlog: "true" })) ?? [];
export const getPost = (slug: string) => serverGet<Post>(`/pages/${slug}`);
export const getBlogCategories = () => content<SlugOption[]>("blog.categories", []);

// ---- FAQ
export const getFaq = async () =>
  (await serverGet<{ groups: FaqGroup[]; items: FaqItem[] }>("/pages/faq")) ?? { groups: [], items: [] };

// ---- Trang chuyên nghiệp
export const getProfessionalProcess = () => content<ProfessionalProcessStep[]>("professional.process", []);
export const getProfessionalTiers = () => content<Tier[]>("professional.tiers", []);
export const getProfessionalPortfolio = () => content<PortfolioItem[]>("professional.portfolio", []);
