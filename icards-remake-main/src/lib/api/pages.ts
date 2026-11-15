import { api } from "./http";
import type { ListParams } from "./types";

export const getBlogs = (params: ListParams = {}) =>
  api.get("/pages", { params: { isBlog: true, isPublished: true, sort: "-createdAt", limit: 10, page: 1, ...params } });
export const getStaticPages = () =>
  api.get("/pages", { params: { isBlog: false, isPublished: true, sort: "title" } });
export const getPages = (params: ListParams = {}) => api.get("/pages", { params });
export const getPageBySlug = (slug: string) => api.get(`/pages/${slug}`);        // BlogDetail, DynamicPage
export const getPublicPageBySlug = (slug: string) => api.get(`/public/pages/${slug}`);
export const getFaq = () => api.get("/pages/faq");
export const getPageCategories = () => api.get("/public/page-categories");
export const getTopics = () => api.get("/public/topics");
