import { api } from "./http";
import type { ListParams } from "./types";

export const getTemplates = (params: ListParams = {}) => api.get("/invitation-templates", { params });
export const getTemplate = (id: string) => api.get(`/invitation-templates/${id}`);
export const trackTemplateView = (id: string) => api.post(`/invitation-templates/${id}/view`);
export const getTemplateBlocks = () => api.get("/template-blocks");
export const getTemplateBlockBySlug = (slug: string) => api.get(`/template-blocks/slug/${slug}`);
export const getFonts = () => api.get("/fonts");
/** Tài nguyên thiết kế bổ sung (font, màu, hình nền) do admin quản lý. Công khai. */
export const getDesignAssetsPublic = () => api.get("/design-assets");

/** Cây danh mục nhiều cấp (danh mục → nhóm → mẫu thiệp). */
export const getTemplateCategoryTree = () => api.get("/template-categories");

/** Hero 3D theo danh mục cho trang /templates. Công khai, lỗi thì trang vẫn chạy không có hero. */
export const getTemplateHeroes = () => api.get("/template-heroes");
