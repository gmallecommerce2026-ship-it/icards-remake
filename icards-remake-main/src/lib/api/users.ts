import { api, multipart } from "./http";
import type { User } from "./types";

export const updateMe = (body: Partial<User>) => api.put("/users/me", body);
export const updateAvatar = (form: FormData) => api.put("/users/me/avatar", form, multipart);
export const changePassword = (body: Record<string, unknown>) => api.put("/users/me/change-password", body);
export const getPersonalImages = () => api.get("/users/me/personal-images");
export const deletePersonalImages = (data: Record<string, unknown>) =>
  api.delete("/users/me/personal-images", { data });
export const uploadImages = (form: FormData) => api.post("/users/me/upload-images", form, multipart);
