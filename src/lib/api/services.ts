import { api } from "./http";

export const getServices = () => api.get("/services");
export const getService = (slug: string) => api.get(`/services/${slug}`);

/** Gửi yêu cầu tư vấn từ trang dịch vụ. */
export const createServiceRequest = (body: {
  service: string;
  name: string;
  phone: string;
  eventDate?: string;
  note?: string;
}) => api.post("/service-requests", body);
