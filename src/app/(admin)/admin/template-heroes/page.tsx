import { redirect } from "next/navigation";

// Hero danh mục 3D đã gom vào "Tuỳ chỉnh giao diện".
export default function AdminTemplateHeroesPage() {
  redirect("/admin/appearance?tab=heroes");
}
