import { api } from "./http";

export const getPublicSettings = () => api.get("/public/settings");
