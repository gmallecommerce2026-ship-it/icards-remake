import { API_BASE_URL } from "./http";

type Query = Record<string, string | number | boolean | undefined>;

/**
 * Đọc dữ liệu công khai từ backend trong server component.
 * - Trả về null khi backend báo 404, để trang gọi notFound().
 * - Ném lỗi với mã khác 2xx/404, để Next hiện trang lỗi thay vì hiển thị dữ liệu rỗng im lặng.
 * - Kết quả được cache `revalidate` giây (mặc định 5 phút).
 */
export async function serverGet<T>(path: string, query?: Query, revalidate = 300): Promise<T | null> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  const res = await fetch(`${API_BASE_URL}${path}${qs ? `?${qs}` : ""}`, { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} khi gọi ${path}`);
  return (await res.json()) as T;
}
