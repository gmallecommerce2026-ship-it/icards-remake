import { api } from "./http";
import type { ListParams } from "./types";

export const getProducts = (params: ListParams = {}) => api.get("/products", { params });
export const getProduct = (id: string) => api.get(`/products/${id}`);
export const getRelatedProducts = (category: string, limit = 4) => getProducts({ category, limit });
