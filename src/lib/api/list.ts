/* Chuẩn hoá dữ liệu danh sách từ backend.
 * Backend trả mảng thuần; chấp nhận thêm dạng { data: [...] } để an toàn.
 * Backend dùng name / previewImage, còn giao diện cũ đọc title / imgSrc: templatesOf làm cầu nối. */

export function listOf<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  return ((body as { data?: T[] } | null)?.data ?? []) as T[];
}

type RawTemplate = { titleStyle?: import("@/lib/title-style").TemplateTitleStyle; _id: string; slug: string; name?: string; title?: string; category: string; description?: string; previewImage?: string; imgSrc?: string };

export const templatesOf = (body: unknown) =>
  listOf<RawTemplate>(body).map((t) => ({ ...t, title: t.title ?? t.name ?? "", imgSrc: t.imgSrc ?? t.previewImage }));
