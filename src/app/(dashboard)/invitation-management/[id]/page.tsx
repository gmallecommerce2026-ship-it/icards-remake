import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Copy, ExternalLink, Edit3, ChevronLeft, Users, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { getInvitationById } from "@/lib/dashboard";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const inv = getInvitationById(id);
  return {
    title: inv ? `${inv.title} | Quản lý thiệp` : "Chi tiết thiệp | iCards",
  };
}

export default async function InvitationDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inv = getInvitationById(id);

  if (!inv) {
    notFound();
  }

  // Helper tính % để vẽ thanh progress
  const percentAttending = inv.stats.totalGuests ? Math.round((inv.stats.attending / inv.stats.totalGuests) * 100) : 0;

  return (
    <div>
      <Link
        href={ROUTES.invitationManagement}
        className="mb-6 inline-flex items-center text-sm font-medium text-muted hover:text-ink focus-visible:outline-none"
      >
        <ChevronLeft className="mr-1 h-4 w-4" /> Quay lại danh sách
      </Link>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">{inv.title}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              inv.status === "published" ? "bg-[#EAF4EE] text-[#1D5B35]" : "bg-line text-muted"
            }`}>
              {inv.status === "published" ? "Đang hoạt động" : "Bản nháp"}
            </span>
          </div>
          <p className="text-muted">ID: {inv.id} • Ngày: {new Date(inv.eventDate).toLocaleDateString("vi-VN")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {inv.status === "published" && (
            <>
              <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition-colors hover:bg-porcelain focus-visible:outline-none focus-visible:border-lacquer">
                <Copy className="h-4 w-4" /> Copy Link
              </button>
              <Link 
                href={`/${inv.slug}`} // Giả lập link ra ngoài trang sự kiện
                target="_blank"
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink transition-colors hover:bg-porcelain focus-visible:outline-none"
              >
                <ExternalLink className="h-4 w-4" /> Xem thiệp
              </Link>
            </>
          )}
          <button className="flex h-10 items-center justify-center gap-2 rounded-xl bg-lacquer px-4 text-sm font-medium text-white transition-colors hover:bg-lacquer-dark focus-visible:outline-none">
            <Edit3 className="h-4 w-4" /> Sửa thiết kế
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 flex items-center text-muted"><Users className="mr-2 h-4 w-4" /> Tổng số</div>
          <div className="text-2xl font-bold text-ink">{inv.stats.totalGuests}</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 flex items-center text-[#1D5B35]"><CheckCircle className="mr-2 h-4 w-4" /> Tham dự</div>
          <div className="text-2xl font-bold text-ink">{inv.stats.attending}</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 flex items-center text-lacquer"><XCircle className="mr-2 h-4 w-4" /> Từ chối</div>
          <div className="text-2xl font-bold text-ink">{inv.stats.declined}</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 flex items-center text-[#9A5A12]"><HelpCircle className="mr-2 h-4 w-4" /> Chưa phản hồi</div>
          <div className="text-2xl font-bold text-ink">{inv.stats.pending}</div>
        </div>
      </div>

      {/* Guest List Preview */}
      <div className="rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Lượt phản hồi mới nhất</h2>
          <Link
            href={ROUTES.invitationTab(inv.id, "guests")}
            className="text-sm font-medium text-lacquer hover:underline focus-visible:outline-none"
          >
            Xem toàn bộ danh sách
          </Link>
        </div>
        <div className="p-0">
          {inv.recentGuests.length > 0 ? (
            <table className="w-full text-left text-sm text-ink">
              <thead className="bg-porcelain/50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">Tên khách</th>
                  <th className="px-6 py-4 font-medium">Số điện thoại</th>
                  <th className="px-6 py-4 font-medium">Phản hồi</th>
                  <th className="px-6 py-4 font-medium">Số người đi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inv.recentGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-porcelain/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{guest.name}</td>
                    <td className="px-6 py-4 text-muted">{guest.phone}</td>
                    <td className="px-6 py-4">
                      {guest.status === "attending" && <span className="inline-flex rounded bg-[#EAF4EE] px-2 py-1 text-xs font-semibold text-[#1D5B35]">Tham dự</span>}
                      {guest.status === "declined" && <span className="inline-flex rounded bg-lacquer-soft px-2 py-1 text-xs font-semibold text-lacquer">Từ chối</span>}
                      {guest.status === "pending" && <span className="inline-flex rounded bg-[#FFF1DF] px-2 py-1 text-xs font-semibold text-[#9A5A12]">Chưa xem</span>}
                    </td>
                    <td className="px-6 py-4">{guest.guestCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <Users className="mb-3 h-8 w-8 opacity-20" />
              <p>Chưa có dữ liệu khách mời</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}