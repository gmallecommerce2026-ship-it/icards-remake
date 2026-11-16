"use client";

/**
 * Bản đồ chọn địa điểm cho thiệp.
 *  - Trang chỉnh sửa (readOnly = false): tìm địa điểm, bấm hoặc kéo ghim để chọn vị trí.
 *  - Trang sự kiện / xem trước (readOnly = true): chỉ xem, có nút "Chỉ đường".
 * Khung và kiểu ghim lấy theo kiểu trang đang chọn (xem venueMapThemes.ts), nên hai nơi luôn khớp nhau.
 */

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Navigation, Search } from "lucide-react";
import { directionsUrl, geocode, hasMapTilerKey, mapStyleUrl, reverseGeocode, type GeoResult } from "@/lib/maptiler";
import { venueMapTheme, type MapFrame, type MapMarker } from "./venueMapThemes";

/** Hà Nội: điểm bắt đầu khi chưa ghim địa điểm nào */
const DEFAULT_CENTER: [number, number] = [105.8342, 21.0278];

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

const MARKERS: Record<MapMarker, { svg: string; w: number; h: number; anchor: "bottom" | "center" }> = {
  pin: {
    svg: `<svg viewBox="0 0 24 32" width="100%" height="100%" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12c0 8.6 12 20 12 20s12-11.4 12-20C24 5.4 18.6 0 12 0z" fill="currentColor" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
    w: 30, h: 40, anchor: "bottom",
  },
  ring: {
    svg: `<svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="#fff" stroke="currentColor" stroke-width="4"/><circle cx="16" cy="16" r="4.5" fill="currentColor"/></svg>`,
    w: 32, h: 32, anchor: "center",
  },
  dot: {
    svg: `<svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true"><circle cx="16" cy="16" r="7" fill="#fff" fill-opacity=".85" stroke="currentColor" stroke-width="2.5"/><path d="M16 1v8M16 23v8M1 16h8M23 16h8" stroke="currentColor" stroke-width="2.5"/></svg>`,
    w: 36, h: 36, anchor: "center",
  },
};

function makeMarkerEl(kind: MapMarker): HTMLDivElement {
  const m = MARKERS[kind];
  const el = document.createElement("div");
  el.style.cssText = `width:${m.w}px;height:${m.h}px;color:var(--ev-accent);cursor:grab;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3));`;
  el.innerHTML = m.svg;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", "Vị trí tổ chức");
  return el;
}

function frameStyle(f: MapFrame): CSSProperties {
  const faint = "color-mix(in srgb, var(--ev-ink) 18%, transparent)";
  const base: CSSProperties = { overflow: "hidden" };
  switch (f) {
    case "double":
      return { ...base, border: "1px solid var(--ev-accent)", outline: "1px solid var(--ev-accent)", outlineOffset: 6 };
    case "round":
      return { ...base, borderRadius: 24, border: `1px solid ${faint}`, boxShadow: "0 16px 32px -18px rgba(0,0,0,.35)" };
    case "offset":
      return { ...base, border: "2px solid var(--ev-ink)", boxShadow: "8px 8px 0 var(--ev-accent)" };
    case "glass":
      return { ...base, borderRadius: 24, border: "1px solid color-mix(in srgb, var(--ev-ink) 12%, transparent)", boxShadow: "0 20px 40px -24px rgba(0,0,0,.5)" };
    case "dashed":
      return { ...base, border: "1px dashed var(--ev-accent)", outline: `1px solid ${faint}`, outlineOffset: 4 };
    default:
      return { ...base, border: `1px solid ${faint}` };
  }
}

export type VenueMapProps = {
  /** kiểu trang hiện tại (styleId) — quyết định style bản đồ, khung và ghim */
  styleId: string;
  lat: number | null;
  lng: number | null;
  /** địa chỉ đang nhập: nếu đang trống, chọn vị trí sẽ điền địa chỉ gợi ý vào */
  address: string;
  readOnly: boolean;
  /** kiểu nhãn nhỏ (tiêu đề mục) lấy từ kiểu trang */
  labelStyle: CSSProperties;
  /** gọi khi người dùng chọn / đổi / bỏ ghim. suggestedAddress chỉ có khi lấy được địa chỉ từ bản đồ */
  onPick: (lat: number | null, lng: number | null, suggestedAddress?: string) => void;
};

export function VenueMap({ styleId, lat, lng, address, readOnly, labelStyle, onPick }: VenueMapProps) {
  const theme = venueMapTheme(styleId);
  const hasPoint = isNum(lat) && isNum(lng);
  const pt = hasPoint ? { lat: lat as number, lng: lng as number } : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const markerKindRef = useRef<MapMarker | null>(null);
  const markerOnMapRef = useRef(false);
  const styleRef = useRef(theme.style);
  const readOnlyRef = useRef(readOnly);
  const onPickRef = useRef(onPick);
  const pickRef = useRef<(la: number, ln: number) => void>(() => {});
  const pointRef = useRef<{ lat: number; lng: number } | null>(pt);
  const addressRef = useRef(address);

  const [mapError, setMapError] = useState("");
  const loadError = !hasMapTilerKey()
    ? "Chưa cấu hình khoá MapTiler (NEXT_PUBLIC_MAPTILER_KEY)."
    : mapError;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");

  // Giữ các giá trị mới nhất để handler của bản đồ (gắn một lần) luôn đọc đúng
  useEffect(() => {
    readOnlyRef.current = readOnly;
    onPickRef.current = onPick;
    pointRef.current = pt;
    addressRef.current = address;
  });

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!hasMapTilerKey()) return; // thông báo lỗi được hiển thị từ loadError
    const start = pointRef.current;
    const map = new MapLibreMap({
      container: el,
      style: mapStyleUrl(styleRef.current),
      center: start ? [start.lng, start.lat] : DEFAULT_CENTER,
      zoom: start ? 15 : 11,
      attributionControl: { compact: true },
      cooperativeGestures: true, // cuộn trang bằng chuột/ngón tay không bị bản đồ "nuốt"
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.on("click", (e) => {
      if (readOnlyRef.current) return;
      pickRef.current(e.lngLat.lat, e.lngLat.lng);
    });
    map.on("error", (e) => {
      const status = (e as unknown as { error?: { status?: number } }).error?.status;
      if (status === 401 || status === 403) {
        setMapError("MapTiler từ chối khoá. Kiểm tra NEXT_PUBLIC_MAPTILER_KEY và danh sách domain được phép.");
      }
    });
    mapRef.current = map;

    // Khi vùng bản đồ đổi kích thước (mở/ẩn, đổi màn hình) thì vẽ lại cho khớp
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);

    return () => {
      ro.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      markerKindRef.current = null;
      markerOnMapRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Đổi kiểu trang -> đổi style bản đồ (ghim vẫn giữ nguyên)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || styleRef.current === theme.style) return;
    styleRef.current = theme.style;
    map.setStyle(mapStyleUrl(theme.style));
  }, [theme.style]);

  // Ghim: tạo lại khi đổi hình ghim, cập nhật vị trí / hiện-ẩn theo dữ liệu, bật-tắt kéo theo chế độ
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markerKindRef.current !== theme.marker || !markerRef.current) {
      markerRef.current?.remove();
      const m = new Marker({
        element: makeMarkerEl(theme.marker),
        anchor: MARKERS[theme.marker].anchor,
        draggable: !readOnly,
      });
      m.on("dragend", () => {
        const ll = m.getLngLat();
        pickRef.current(ll.lat, ll.lng);
      });
      markerRef.current = m;
      markerKindRef.current = theme.marker;
      markerOnMapRef.current = false;
    }
    const m = markerRef.current;
    if (!m) return;
    m.setDraggable(!readOnly);
    if (hasPoint) {
      m.setLngLat([lng as number, lat as number]);
      if (!markerOnMapRef.current) {
        m.addTo(map);
        markerOnMapRef.current = true;
      }
    } else if (markerOnMapRef.current) {
      m.remove();
      markerOnMapRef.current = false;
    }
  }, [theme.marker, hasPoint, lat, lng, readOnly]);

  // Hàm chọn vị trí: báo toạ độ ngay, rồi lấy địa chỉ gần nhất để gợi ý điền vào ô địa chỉ
  const pick = (la: number, ln: number) => {
    const p = { lat: round6(la), lng: round6(ln) };
    pointRef.current = p;
    onPickRef.current(p.lat, p.lng);
    reverseGeocode(p.lat, p.lng)
      .then((r) => {
        const cur = pointRef.current;
        if (!r?.label || !cur || cur.lat !== p.lat || cur.lng !== p.lng) return;
        // chỉ báo lại khi vẫn là vị trí vừa chọn (người dùng chưa chọn chỗ khác)
        onPickRef.current(p.lat, p.lng, addressRef.current.trim() ? undefined : r.label);
      })
      .catch(() => { /* không lấy được địa chỉ thì vẫn giữ toạ độ */ });
  };

  // Gán các hàm/giá trị mới nhất sau mỗi lần render (không gán ref trong lúc render)
  useEffect(() => {
    pickRef.current = pick;
  });

  async function onSearch(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchMsg("");
    try {
      const rs = await geocode(q);
      setResults(rs);
      if (!rs.length) setSearchMsg("Không tìm thấy địa điểm này. Thử nhập tên đường, quận/huyện hoặc thành phố.");
    } catch {
      setSearchMsg("Không tìm được địa điểm, vui lòng thử lại.");
    } finally {
      setSearching(false);
    }
  }

  function chooseResult(r: GeoResult) {
    setResults([]);
    setSearchMsg("");
    const p = { lat: round6(r.lat), lng: round6(r.lng) };
    pointRef.current = p;
    mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 15 });
    onPick(p.lat, p.lng, addressRef.current.trim() ? undefined : r.label);
  }

  const showSection = !readOnly || hasPoint;
  const faintLine = { borderColor: "color-mix(in srgb, var(--ev-ink) 25%, transparent)" };

  return (
    <section hidden={!showSection} className="mx-auto mt-16 w-full max-w-3xl text-center">
      <h3 style={labelStyle}>Vị trí trên bản đồ</h3>

      {!readOnly && (
        <div className="mx-auto mt-5 max-w-xl text-left">
          <form onSubmit={onSearch} className="flex items-stretch gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 border-b py-2" style={faintLine}>
              <Search className="size-4 shrink-0 opacity-60" aria-hidden />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchMsg(""); }}
                placeholder="Tìm địa điểm hoặc địa chỉ"
                aria-label="Tìm địa điểm trên bản đồ"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
              />
            </label>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="shrink-0 px-4 text-sm font-semibold uppercase tracking-[0.12em] disabled:opacity-40"
              style={{ color: "var(--ev-accent)" }}
            >
              {searching ? "Đang tìm…" : "Tìm"}
            </button>
          </form>
          {searchMsg && <p className="mt-2 text-xs opacity-70">{searchMsg}</p>}
          {results.length > 0 && (
            <ul className="mt-2 divide-y rounded-md border" style={faintLine}>
              {results.map((r) => (
                <li key={`${r.lat},${r.lng}`}>
                  <button type="button" onClick={() => chooseResult(r)} className="w-full px-3 py-2 text-left text-sm hover:bg-black/[0.04]">
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="relative mt-6 w-full bg-white/40" style={frameStyle(theme.frame)}>
        <div ref={containerRef} className="w-full" style={{ height: "clamp(240px, 45vh, 380px)" }} />
        {loadError && (
          <div className="absolute inset-0 grid place-items-center bg-white/85 p-6 text-sm text-[#1D1B2A]">{loadError}</div>
        )}
        {!readOnly && !hasPoint && !loadError && (
          <div className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-max rounded-full bg-white/90 px-3 py-1 text-xs text-[#1D1B2A] shadow">
            Bấm vào bản đồ để ghim vị trí
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
        {pt && <span className="opacity-60">Toạ độ {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</span>}
        {!readOnly && hasPoint && (
          <>
            <span className="opacity-60">Kéo ghim để đổi vị trí</span>
            <button type="button" onClick={() => onPickRef.current(null, null)} className="underline underline-offset-4">
              Bỏ ghim
            </button>
          </>
        )}
        {readOnly && pt && (
          <a
            href={directionsUrl(pt.lat, pt.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4"
            style={{ color: "var(--ev-accent)" }}
          >
            <Navigation className="size-3.5" aria-hidden /> Chỉ đường
          </a>
        )}
      </div>
    </section>
  );
}
