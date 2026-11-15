import { api } from "./http";

type Body = Record<string, unknown>;
export const getPublicWishes = (eventId: string) => api.get(`/wishes/public/${eventId}`);
export const createPublicWish = (eventId: string, body: Body) => api.post(`/wishes/public/${eventId}`, body);
export const getWishesAdmin = (invitationId: string, params: { page?: number; limit?: number } = { limit: 200 }) =>
  api.get(`/wishes/admin/${invitationId}`, { params });
export const updateWish = (wishId: string, body: Body) => api.put(`/wishes/${wishId}`, body);
export const deleteWish = (wishId: string) => api.delete(`/wishes/${wishId}`);
