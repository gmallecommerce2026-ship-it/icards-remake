import { api } from "./http";
import type { PublicContentKey } from "./content-keys";

/** Danh mục và nội dung cấu hình công khai (vd "templates.categories"). */
export const getPublicContent = <T = unknown>(key: PublicContentKey) =>
  api.get<T>(`/public/content/${key}`);
