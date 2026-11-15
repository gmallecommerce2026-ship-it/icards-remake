// Nhóm route "studio": trang chỉnh sửa thiệp chiếm toàn màn hình.
// Không dùng chung layout của (dashboard) nên không có sidebar.
import RequireAuth from "@/components/RequireAuth";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
