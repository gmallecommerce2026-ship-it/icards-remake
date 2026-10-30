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
  { path: "", label: "TỔNG QUAN" },
  { path: "guests", label: "QUẢN LÝ KHÁCH MỜI" },
  { path: "wishes", label: "QUẢN LÝ LỜI CHÚC" },
  { path: "events", label: "QUẢN LÍ SỰ KIỆN" },
  { path: "planner", label: "KẾ HOẠCH CƯỚI" },
  { path: "budget", label: "NGÂN SÁCH" },
  { path: "settings", label: "CÀI ĐẶT THIỆP MỜI" },
  { path: "delete", label: "XÓA THIỆP MỜI" },
] as const;
