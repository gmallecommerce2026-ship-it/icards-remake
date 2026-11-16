/**
 * Tiện ích gọi MapTiler Cloud (bản đồ + tìm địa điểm).
 *
 * Khoá lấy từ biến môi trường NEXT_PUBLIC_MAPTILER_KEY (đặt trong .env.local hoặc cấu hình build).
 * Đây là khoá dùng ở trình duyệt nên hãy giới hạn theo domain (Allowed domains / HTTP referrer)
 * trong trang quản lý khoá của MapTiler.
 */

// Lưu ý: Next chỉ thay thế biến NEXT_PUBLIC_* khi truy cập trực tiếp kiểu này.
export const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

const API = "https://api.maptiler.com";

export const hasMapTilerKey = () => MAPTILER_KEY.trim().length > 0;

/** URL style JSON của MapTiler cho một mã style (vd: "streets-v4") */
export function mapStyleUrl(styleId: string): string {
  return `${API}/maps/${styleId}/style.json?key=${encodeURIComponent(MAPTILER_KEY)}`;
}

export type GeoResult = { label: string; lat: number; lng: number };

const toResults = (json: unknown): GeoResult[] => {
  const features = (json as { features?: unknown[] } | null)?.features;
  if (!Array.isArray(features)) return [];
  return features
    .map((f): GeoResult | null => {
      const ft = f as { place_name?: string; text?: string; center?: [number, number] };
      if (!ft.center || ft.center.length < 2) return null;
      return { label: ft.place_name || ft.text || "", lng: ft.center[0], lat: ft.center[1] };
    })
    .filter((x): x is GeoResult => !!x && Number.isFinite(x.lat) && Number.isFinite(x.lng));
};

/** Tìm địa điểm / địa chỉ theo chữ người dùng nhập (ưu tiên tiếng Việt) */
export async function geocode(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const q = query.trim();
  if (!q || !hasMapTilerKey()) return [];
  const url = `${API}/geocoding/${encodeURIComponent(q)}.json?key=${encodeURIComponent(MAPTILER_KEY)}&language=vi&limit=5`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`geocoding ${res.status}`);
  return toResults(await res.json());
}

/** Từ toạ độ lấy địa chỉ gần nhất (dùng khi người dùng ghim trên bản đồ) */
export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<GeoResult | null> {
  if (!hasMapTilerKey()) return null;
  const url = `${API}/geocoding/${lng},${lat}.json?key=${encodeURIComponent(MAPTILER_KEY)}&language=vi&limit=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  return toResults(await res.json())[0] ?? null;
}

/** Liên kết mở chỉ đường trên Google Maps (khách mời bấm để đi) */
export const directionsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lng.toFixed(6)}`;
