import { redirect } from "next/navigation";

// Menu đã gom vào "Tuỳ chỉnh giao diện".
export default function AdminMenuPage() {
  redirect("/admin/appearance?tab=menu");
}
