import { api } from "./http";
import type { ListParams } from "./types";

export const getTemplates = (params: ListParams = {}) => api.get("/invitation-templates", { params });
export const getTemplate = (id: string) => api.get(`/invitation-templates/${id}`);
export const trackTemplateView = (id: string) => api.post(`/invitation-templates/${id}/view`);
export const getTemplateBlocks = () => api.get("/template-blocks");
export const getTemplateBlockBySlug = (slug: string) => api.get(`/template-blocks/slug/${slug}`);
export const getFonts = () => api.get("/fonts");
export const getDesignAssets = (type: "icon" | "component" | "tag") =>
  api.get("/design-assets", { params: { type } });
