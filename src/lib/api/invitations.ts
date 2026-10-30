import { api, multipart } from "./http";
import type { ListParams } from "./types";

type Body = Record<string, unknown>;
const inv = (id: string) => `/invitations/${id}`;

// --- Invitation ---
export const getInvitations = () => api.get("/invitations");
export const getInvitation = (id: string) => api.get(inv(id));
export const getPublicInvitation = (id: string, params?: { guestId?: string; [k: string]: unknown }) =>
  api.get(`/invitations/public/${id}`, { params });
export const createInvitation = (form: FormData) => api.post("/invitations", form, multipart);
export const updateInvitation = (id: string, form: FormData) => api.put(inv(id), form, multipart);
export const deleteInvitation = (id: string) => api.delete(inv(id));
export const updateSettings = (id: string, body: Body) => api.put(`${inv(id)}/settings`, body);
export const updateBudgetRequest = (id: string, body: Body) => api.put(`${inv(id)}/budgetRequest`, body);

// --- Tasks ---
export const getTasks = (id: string) => api.get(`${inv(id)}/tasks`);
export const updateTasks = (id: string, body: Body) => api.put(`${inv(id)}/tasks`, body);

// --- Guests ---
export const addGuest = (id: string, body: Body) => api.post(`${inv(id)}/guests`, body);
export const updateGuest = (id: string, guestId: string, body: Body) => api.put(`${inv(id)}/guests/${guestId}`, body);
export const deleteGuest = (id: string, guestId: string) => api.delete(`${inv(id)}/guests/${guestId}`);
export const bulkAddGuests = (id: string, body: Body) => api.post(`${inv(id)}/guests/bulk`, body);
export const bulkUpdateGuests = (id: string, body: Body) => api.put(`${inv(id)}/guests/bulk-update`, body);
export const bulkDeleteGuests = (id: string, body: Body) => api.post(`${inv(id)}/guests/bulk-delete`, body);
export const bulkSendEmail = (id: string, body: Body) => api.post(`${inv(id)}/guests/bulk-send-email`, body);
export const sendGuestEmail = (id: string, guestId: string, body?: Body) =>
  api.put(`${inv(id)}/guests/${guestId}/send-email`, body);
export const submitRsvp = (id: string, guestId: string, body: Body) =>
  api.put(`${inv(id)}/guests/${guestId}/rsvp`, body);

// --- Guest groups ---
export const getGuestGroups = (id: string) => api.get(`${inv(id)}/guest-groups`);
export const createGuestGroup = (id: string, body: Body) => api.post(`${inv(id)}/guest-groups`, body);
export const updateGuestGroup = (id: string, groupId: string, body: Body) =>
  api.put(`${inv(id)}/guest-groups/${groupId}`, body);
export const deleteGuestGroup = (id: string, groupId: string) => api.delete(`${inv(id)}/guest-groups/${groupId}`);

// --- Master guests ---
export const getMasterGuests = (params?: ListParams) => api.get("/master-guests", { params });
