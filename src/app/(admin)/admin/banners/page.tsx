import { redirect } from "next/navigation";

// Banner đã gom vào "Tuỳ chỉnh giao diện".
export default function AdminBannersPage() {
  redirect("/admin/appearance?tab=banners");
}
