// NỘI DUNG MẪU: Dữ liệu quản lý thiệp của người dùng

export type RsvpStatus = "attending" | "declined" | "pending";

export type Guest = {
  id: string;
  name: string;
  phone: string;
  status: RsvpStatus;
  guestCount: number;
};

export type InvitationDetail = {
  id: string;
  title: string;
  eventType: string;
  eventDate: string;
  coverTone: { bg: string; ink: string };
  slug: string;
  status: "published" | "draft";
  stats: {
    totalGuests: number;
    attending: number;
    declined: number;
    pending: number;
  };
  recentGuests: Guest[];
};

export const MOCK_INVITATIONS: InvitationDetail[] = [
  {
    id: "68c888675014545208311042",
    title: "Lễ Thành Hôn Ân & Hân",
    eventType: "Tiệc cưới",
    eventDate: "2026-11-28T18:00:00Z",
    coverTone: { bg: "#EAF4EE", ink: "#1D5B35" },
    slug: "an-han-wedding",
    status: "published",
    stats: { totalGuests: 350, attending: 210, declined: 15, pending: 125 },
    recentGuests: [
      { id: "g1", name: "Anh Hoàng (CTY)", phone: "0909xxx111", status: "attending", guestCount: 2 },
      { id: "g2", name: "Chị Linh (Bạn ĐH)", phone: "0988xxx222", status: "pending", guestCount: 1 },
      { id: "g3", name: "Chú Tư", phone: "0912xxx333", status: "declined", guestCount: 0 },
    ],
  },
  {
    id: "99f888675014545208311055",
    title: "Tiệc Sinh Nhật Tròn 1 Tuổi - Bé Dâu",
    eventType: "Thôi nôi",
    eventDate: "2027-01-15T11:00:00Z",
    coverTone: { bg: "#FBEDEE", ink: "#B5485D" },
    slug: "dau-1-tuoi",
    status: "draft",
    stats: { totalGuests: 50, attending: 0, declined: 0, pending: 50 },
    recentGuests: [],
  },
];

export function getUserInvitations(): InvitationDetail[] {
  return MOCK_INVITATIONS;
}

export function getInvitationById(id: string): InvitationDetail | undefined {
  return MOCK_INVITATIONS.find((inv) => inv.id === id);
}