// Nơi duy nhất khai báo đường dẫn khu "Quản lý thiệp mời".
// Đổi route chỉ cần sửa ở đây.

const BASE = "/invitation-management";

export const ROUTES = {
  invitationManagement: BASE,
  myEventsView: `${BASE}/my-events/view`,
  newEvent: `${BASE}/my-events/view`, // trang canvas 3D + phong bì
  invitation: (id: string) => `${BASE}/${id}`,
  invitationTab: (id: string, tab: string) => `${BASE}/${id}/${tab}`,
} as const;

// Các tab trong trang chi tiết một thiệp mời (/invitation-management/[id]/...)
export const INVITATION_TABS = [
  { path: "", label: "Tổng quan" },
  { path: "guests", label: "Khách mời" },
  { path: "wishes", label: "Lời chúc" },
  { path: "events", label: "Sự kiện" },
  { path: "planner", label: "Kế hoạch cưới" },
  { path: "budget", label: "Ngân sách" },
  { path: "settings", label: "Cài đặt" },
  { path: "delete", label: "Xóa thiệp" },
] as const;
