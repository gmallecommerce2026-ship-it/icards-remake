// Hàm dùng chung cho luồng thiệp: studio lưu thiệp, trang quản lý và trang công khai.
import type { EventInfo } from "@/components/invitation-send/EventDetailsEditor";

/** Thiệp như backend trả về (GET /invitations/:id và danh sách). */
export type ApiInvitation = {
  _id: string;
  slug: string;
  title: string;
  eventType: "wedding" | "birthday" | "baby" | "event";
  templateSlug?: string | null;
  eventDate?: string | null;
  cover?: string | null;
  status: "draft" | "published";
  info?: Partial<EventInfo>;
  page?: Record<string, unknown>;
  design?: { pages?: unknown; backdrops?: unknown; envelope?: Record<string, unknown> };
  settings: {
    allowRsvp: boolean;
    allowWishes: boolean;
    moderateWishes: boolean;
    showGuestList: boolean;
    maxCompanions: number;
    rsvpDeadline?: string | null;
  };
  budget?: { total?: number; items?: BudgetItem[] };
  tasks?: PlannerTask[];
  stats: InvitationStats;
  createdAt?: string;
};

export type InvitationStats = {
  totalGuests: number;
  attending: number;
  declined: number;
  pending: number;
  giftTotal: number;
  headcount: number;
  emailSent: number;
  emailFailed: number;
};

export type BudgetItem = { name: string; estimate?: number; actual?: number; paid?: boolean; note?: string };
export type PlannerTask = { _id?: string; title: string; done: boolean; dueDate?: string; category?: string; note?: string };

/** Chuyển "Chủ nhật, 14.12.2026" + "10:30" thành ISO. Trả về undefined nếu không đọc được ngày. */
export function toEventDateIso(info: Pick<EventInfo, "date" | "time">): string | undefined {
  const m = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(info.date ?? "");
  if (!m) return undefined;
  const t = /(\d{1,2}):(\d{2})/.exec(info.time ?? "");
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), t ? Number(t[1]) : 0, t ? Number(t[2]) : 0);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Đọc ngày ISO về dạng hiển thị dd/mm/yyyy. */
export function formatEventDate(iso?: string | null): string {
  if (!iso) return "Chưa đặt ngày";
  return new Date(iso).toLocaleDateString("vi-VN");
}

/** Link công khai gửi cho khách (cùng định dạng với link trong email). */
export function publicLink(origin: string, slug: string): string {
  return `${origin}/events/view?id=${encodeURIComponent(slug)}`;
}

/** Thông báo lỗi có thể đọc từ phản hồi NestJS. */
export function errorText(err: unknown, fallback = "Có lỗi xảy ra, vui lòng thử lại."): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(" · ");
  return typeof msg === "string" ? msg : fallback;
}
