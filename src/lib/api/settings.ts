import { adminApi } from "./http";

export const getPublicSettings = () => adminApi.get("/public/settings");
