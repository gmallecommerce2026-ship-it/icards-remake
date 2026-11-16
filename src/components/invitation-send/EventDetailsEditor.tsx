"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Award,
  Eye,
  Flower2,
  Image as ImageIcon,
  MapPin,
  Mic,
  Palette,
  Pencil,
  PencilLine,
  Play,
  Plus,
  PlusSquare,
  RotateCcw,
  Settings,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { Be_Vietnam_Pro, Cormorant_Garamond, Space_Mono, Great_Vibes, Oswald } from "@/lib/fonts";
import { EventSettings } from "./EventSettings";
import { VenueMap } from "./VenueMap";

/* Font: tất cả đều có subset "vietnamese" */
const fSerif = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--ev-serif", display: "swap" });
const fMono = Space_Mono({ subsets: ["latin", "vietnamese"], weight: ["400", "700"], variable: "--ev-mono", display: "swap" });
const fSans = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], variable: "--ev-sans", display: "swap" });
const fDisplay = Oswald({ subsets: ["latin", "vietnamese"], weight: ["500", "700"], variable: "--ev-display", display: "swap" });
const fScript = Great_Vibes({ subsets: ["latin", "vietnamese"], weight: "400", variable: "--ev-script", display: "swap" });
/** gắn className này lên phần tử bao ngoài để các biến font có hiệu lực */
export const EVENT_FONT_VARS = [fSerif, fMono, fSans, fDisplay, fScript].map((f) => f.variable).join(" ");

const CRIMSON = "#A3152F";
const uid = () => Math.random().toString(36).slice(2, 9);

/* ------------------------------------------------------------------ */
/*  KIỂU TRANG (tab Page Style)                                        */
/* ------------------------------------------------------------------ */
export type PageDeco =
  | "none" | "bunting" | "flourish"
  | "heritage" | "gazette" | "botanica" | "deco" | "confetti" | "blueprint" | "monogram" | "aurora";
/** kiểu khối "Chủ tiệc / Thời gian / Địa điểm" */
export type ColsVariant = "plain" | "ruled" | "cards" | "boxed" | "glass";
export type PageStyle = {
  id: string;
  name: string;
  font: string; // tiêu đề
  body: string; // lời mời, giá trị
  bodyItalic?: boolean;
  weight: number;
  upper: boolean;
  tracking: string;
  titleSize: string;
  deco: PageDeco;
  btn: "outline" | "solid" | "pill" | "soft";
  titleItalic?: boolean;
  titleColor?: "ink" | "accent";
  labelFont?: string;
  cols?: ColsVariant;
  /** cỡ chữ của nút chọn kiểu trong bảng (mặc định 1.25rem) */
  previewSize?: string;
};

const PAGE_STYLES: PageStyle[] = [
  { id: "principal", name: "Principal", font: "var(--ev-serif), serif", body: "var(--ev-serif), serif", weight: 500, upper: false, tracking: "0", titleSize: "clamp(2.2rem,5.5vw,3.6rem)", deco: "none", btn: "outline" },
  { id: "bunting", name: "Bunting", font: "var(--ev-mono), monospace", body: "var(--ev-mono), monospace", weight: 400, upper: false, tracking: "0.03em", titleSize: "clamp(1.5rem,3.6vw,2.3rem)", deco: "bunting", btn: "solid" },
  { id: "sloane", name: "Sloane", font: "var(--ev-sans), sans-serif", body: "var(--ev-sans), sans-serif", weight: 500, upper: true, tracking: "0.12em", titleSize: "clamp(1.5rem,3.6vw,2.4rem)", deco: "none", btn: "outline" },
  { id: "offset", name: "Offset", font: "var(--ev-display), sans-serif", body: "var(--ev-sans), sans-serif", weight: 700, upper: true, tracking: "0.04em", titleSize: "clamp(2.2rem,6.5vw,4.2rem)", deco: "none", btn: "solid" },
  { id: "plume", name: "Plume", font: "var(--ev-script), cursive", body: "var(--ev-serif), serif", bodyItalic: true, weight: 400, upper: false, tracking: "0", titleSize: "clamp(2.8rem,7.5vw,4.8rem)", deco: "flourish", btn: "outline", previewSize: "1.9rem" },
  // ---- 8 kiểu mới ----
  // Cổ điển: chữ hoa thưa, khung đôi + hoạ tiết góc, ngăn cách hình thoi
  { id: "heritage", name: "Heritage", font: "var(--ev-serif), serif", body: "var(--ev-serif), serif", weight: 600, upper: true, tracking: "0.16em", titleSize: "clamp(1.7rem,4.2vw,2.8rem)", deco: "heritage", btn: "outline", cols: "ruled", previewSize: "1.05rem" },
  // Báo chí: tiêu đề đậm kiểu masthead kẹp giữa hai đường kẻ đôi
  { id: "gazette", name: "Gazette", font: "var(--ev-serif), serif", body: "var(--ev-serif), serif", weight: 700, upper: true, tracking: "0.05em", titleSize: "clamp(2rem,5.2vw,3.5rem)", deco: "gazette", btn: "solid", cols: "ruled", previewSize: "1.15rem" },
  // Vườn hoa: chữ nghiêng mềm, cành lá đối xứng, thẻ bo tròn
  { id: "botanica", name: "Botanica", font: "var(--ev-serif), serif", body: "var(--ev-serif), serif", bodyItalic: true, titleItalic: true, weight: 500, upper: false, tracking: "0", titleSize: "clamp(2.4rem,6.2vw,4rem)", deco: "botanica", btn: "soft", cols: "cards", previewSize: "1.45rem" },
  // Art Deco: chữ Oswald thưa, màu nhấn, khung vát + quạt ở bốn góc
  { id: "deco", name: "Art Deco", font: "var(--ev-display), sans-serif", body: "var(--ev-sans), sans-serif", weight: 500, upper: true, tracking: "0.22em", titleSize: "clamp(1.8rem,4.6vw,3rem)", titleColor: "accent", deco: "deco", btn: "outline", cols: "boxed", previewSize: "1rem" },
  // Tiệc vui: chữ tròn đậm, confetti nhiều màu, nút bo tròn
  { id: "confetti", name: "Confetti", font: "var(--ev-sans), sans-serif", body: "var(--ev-sans), sans-serif", weight: 600, upper: false, tracking: "-0.02em", titleSize: "clamp(2rem,5.6vw,3.6rem)", titleColor: "accent", deco: "confetti", btn: "pill", cols: "cards", previewSize: "1.2rem" },
  // Bản vẽ kỹ thuật: lưới ô vuông, dấu góc, chữ mono hoa
  { id: "blueprint", name: "Blueprint", font: "var(--ev-mono), monospace", body: "var(--ev-mono), monospace", weight: 700, upper: true, tracking: "0.08em", titleSize: "clamp(1.4rem,3.4vw,2.2rem)", labelFont: "var(--ev-mono), monospace", deco: "blueprint", btn: "outline", cols: "boxed", previewSize: "1rem" },
  // Chữ lồng: vòng tròn chữ cái đầu tên + serif thanh lịch
  { id: "monogram", name: "Monogram", font: "var(--ev-serif), serif", body: "var(--ev-serif), serif", bodyItalic: true, weight: 500, upper: false, tracking: "0.02em", titleSize: "clamp(1.9rem,4.8vw,3.1rem)", deco: "monogram", btn: "pill", cols: "plain", previewSize: "1.3rem" },
  // Cực quang: nền loang màu nhấn, chữ mảnh, thẻ kính mờ
  { id: "aurora", name: "Aurora", font: "var(--ev-sans), sans-serif", body: "var(--ev-sans), sans-serif", weight: 500, upper: false, tracking: "-0.03em", titleSize: "clamp(2.2rem,6vw,4rem)", titleColor: "accent", deco: "aurora", btn: "soft", cols: "glass", previewSize: "1.25rem" },
];
const ACCENTS = ["#2F4C8F", "#A3152F", "#0F7B6C", "#C9811B", "#D6478A", "#1D1B2A"];
const BGS = ["#FFFCF6", "#FFFFFF", "#FCEFF2", "#EAF1FB", "#EFEBE0", "#14233F"];

const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 140;
};

/* ------------------------------------------------------------------ */
/*  KHỐI (tab Add Blocks)                                              */
/* ------------------------------------------------------------------ */
type BlockType = "video" | "speakers" | "wedding-party" | "sponsors" | "gallery" | "details" | "map";
type Person = { id: string; name: string; role: string };
type Photo = { id: string; src: string };
/** lat/lng: vị trí ghim của khối bản đồ (chỉ dùng khi type === "map") */
type Block = { id: string; type: BlockType; title: string; text: string; url: string; people: Person[]; photos: Photo[]; lat: number | null; lng: number | null };

const BLOCK_DEFS: Record<BlockType, { desc: string; icon: LucideIcon; title: string }> = {
  video: { title: "Video", desc: "Nhúng liên kết YouTube hoặc Vimeo.", icon: Play },
  speakers: { title: "Diễn giả", desc: "Danh sách diễn giả kèm vai trò.", icon: Mic },
  "wedding-party": { title: "Phù dâu & phù rể", desc: "Giới thiệu những người đồng hành trong ngày cưới.", icon: Flower2 },
  sponsors: { title: "Nhà tài trợ", desc: "Tôn vinh các đơn vị đồng hành.", icon: Award },
  gallery: { title: "Thư viện ảnh", desc: "Tải ảnh lên để khách mời xem từng tấm.", icon: ImageIcon },
  details: { title: "Chi tiết", desc: "Chỉ đường, bãi đỗ xe, trang phục…", icon: AlignLeft },
  map: { title: "Vị trí", desc: "Ghim địa điểm trên bản đồ để khách mời chỉ đường.", icon: MapPin },
};
const PEOPLE_TYPES: BlockType[] = ["speakers", "wedding-party", "sponsors"];

const makeBlock = (type: BlockType): Block => ({
  id: uid(),
  type,
  title: BLOCK_DEFS[type].title,
  text: "",
  url: "",
  people: PEOPLE_TYPES.includes(type) ? [0, 1, 2].map(() => ({ id: uid(), name: "", role: "" })) : [],
  photos: [],
  lat: null,
  lng: null,
});

function toEmbed(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
}

/** Ảnh người dùng chọn -> data URL JPEG đã thu nhỏ (blob URL chết sau khi tải lại trang, khách mời cũng không xem được) */
async function imageToDataUrl(file: File, max = 1600): Promise<string | null> {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(bmp.width * k));
    c.height = Math.max(1, Math.round(bmp.height * k));
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#fff"; // PNG trong suốt -> nền trắng thay vì đen khi đổi sang JPEG
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    return c.toDataURL("image/jpeg", 0.82);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  DỮ LIỆU                                                            */
/* ------------------------------------------------------------------ */
export type EventInfo = { title: string; description: string; host: string; date: string; time: string; venue: string; address: string };
export type GuestLists = { attending: string[]; pending: string[] };

const DEFAULT_INFO: EventInfo = {
  title: "Lễ thành hôn của Minh Anh & Quốc Bảo",
  description: "Rất mong được đón tiếp bạn trong ngày vui của chúng tôi.",
  host: "Gia đình hai họ",
  date: "Chủ nhật, 13/12/2026",
  time: "18:00",
  venue: "Trung tâm Tiệc cưới Sen Vàng",
  address: "12 Đường Láng, Đống Đa, Hà Nội",
};

type Tab = "style" | "settings" | "blocks";

/** Chế độ xem trước: mọi ô nhập thành chữ thường, ẩn nút thêm / xoá */
const ReadOnlyCtx = createContext(false);

export type EventPageData = { info: EventInfo; styleId: string; accent: string; bg: string; blocks: Block[]; showRsvp: boolean; showGuests: boolean };
export type EventPageConfig = Pick<EventPageData, "styleId" | "accent" | "bg" | "blocks">;

const HEX = /^#[0-9a-fA-F]{6}$/;
const SAFE_SRC = /^(?:https?:\/\/|\/|data:image\/(?:jpeg|png|webp|gif);base64,)/;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
/** toạ độ hợp lệ hoặc null */
const coord = (v: unknown, limit: number): number | null =>
  typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= limit ? v : null;
const objs = (v: unknown) => (Array.isArray(v) ? v : []).filter((x): x is Record<string, unknown> => !!x && typeof x === "object");

/**
 * Đọc cấu hình trang (`invitation.page` từ API) về dạng an toàn: giá trị lạ / thiếu -> mặc định,
 * màu phải là hex 6 ký tự, ảnh chỉ nhận http(s), đường dẫn tương đối hoặc data URL (bỏ blob: cũ).
 * Dùng chung cho studio (mở lại thiệp đã lưu) và trang công khai, để hai nơi dựng ra cùng một trang.
 */
export function normalizePage(raw: unknown): EventPageConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const styleId = PAGE_STYLES.some((x) => x.id === r.styleId) ? (r.styleId as string) : PAGE_STYLES[0].id;
  const accent = typeof r.accent === "string" && HEX.test(r.accent) ? r.accent : ACCENTS[0];
  const bg = typeof r.bg === "string" && HEX.test(r.bg) ? r.bg : BGS[0];
  const types = Object.keys(BLOCK_DEFS);
  const blocks = objs(r.blocks)
    .filter((b) => typeof b.type === "string" && types.includes(b.type))
    .map((b): Block => ({
      id: str(b.id, 40) || uid(),
      type: b.type as BlockType,
      title: str(b.title, 200),
      text: str(b.text, 5000),
      url: str(b.url, 500),
      people: objs(b.people).slice(0, 60).map((p) => ({ id: str(p.id, 40) || uid(), name: str(p.name, 120), role: str(p.role, 120) })),
      photos: objs(b.photos).slice(0, 60).map((p) => ({ id: str(p.id, 40) || uid(), src: str(p.src, 3_000_000) })).filter((p) => SAFE_SRC.test(p.src)),
      lat: coord(b.lat, 90),
      lng: coord(b.lng, 180),
    }));
  return { styleId, accent, bg, blocks };
}

/** Kiểu chữ của trang theo `styleId` (để phần dưới trang công khai dùng đúng phông tiêu đề) */
export function getPageStyle(id: string): PageStyle {
  return PAGE_STYLES.find((x) => x.id === id) ?? PAGE_STYLES[0];
}

/** Chữ nhãn nhỏ ("CHỦ TIỆC", "THỜI GIAN"...) theo kiểu trang */
export function labelStyle(st: PageStyle): CSSProperties {
  return {
    fontFamily: st.labelFont ?? "var(--ev-sans), sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    opacity: 0.65,
  };
}

/** Nút (phản hồi tham dự, gửi lời chúc...) theo kiểu trang */
export function buttonStyle(st: PageStyle): CSSProperties {
  const solid: CSSProperties = { background: "var(--ev-accent)", color: "var(--ev-on-accent)", border: "1px solid var(--ev-accent)" };
  switch (st.btn) {
    case "solid": return { ...solid, borderRadius: 0 };
    case "pill": return { ...solid, borderRadius: 999 };
    case "soft": return { background: "color-mix(in srgb, var(--ev-accent) 16%, transparent)", color: "var(--ev-accent)", border: "1px solid color-mix(in srgb, var(--ev-accent) 35%, transparent)", borderRadius: 999 };
    default: return { border: "1px solid var(--ev-ink)", color: "var(--ev-ink)", borderRadius: 0 };
  }
}

/** Biến màu của trang: cùng công thức với khung thiệp trong editor */
export function pageTheme(accent: string, bg: string): CSSProperties {
  return {
    ["--ev-accent" as string]: accent,
    ["--ev-bg" as string]: bg,
    ["--ev-ink" as string]: isDark(bg) ? "#F5F1E8" : "#1D1B2A",
    ["--ev-on-accent" as string]: isDark(accent) ? "#FFFFFF" : "#1D1B2A",
  } as CSSProperties;
}

export type EventDetailsEditorProps = {
  initial?: Partial<EventInfo>;
  guests?: GuestLists;
  onClose?: () => void;
  onSave?: (data: EventPageData) => void;
  /** bấm "Thêm khách mời": nhận luôn cấu hình trang hiện tại để lưu trước khi chuyển bước */
  onAddGuests?: (data: EventPageData) => void;
  onReplay?: () => void;
  /** đang lưu thiệp (chờ chạy animation + chuyển trang): khoá hai nút Lưu / Thêm khách mời */
  busy?: boolean;
  /** chế độ xem cho khách mời: ẩn thanh công cụ, chỉ hiện nội dung thiệp */
  readOnly?: boolean;
  defaultShowRsvp?: boolean;
  defaultShowGuests?: boolean;
  /** cấu hình trang đã lưu (`invitation.page`): kiểu trang, màu, các khối. Không truyền thì dùng mặc định */
  initialPage?: unknown;
  /** hai công tắc trong "Cài đặt sự kiện" đã lưu (map từ settings.allowRsvp / settings.showGuestList) */
  initialSettings?: { showRsvp?: boolean; showGuests?: boolean };
};

export function EventDetailsEditor({
  initial, guests, onClose, onSave, onAddGuests, onReplay, busy = false,
  readOnly = false, defaultShowRsvp = true, defaultShowGuests = false, initialPage, initialSettings,
}: EventDetailsEditorProps) {
  const [info, setInfo] = useState<EventInfo>({ ...DEFAULT_INFO, ...initial });
  const [saved] = useState(() => normalizePage(initialPage));   // chỉ đọc một lần lúc mở
  const [styleId, setStyleId] = useState(saved.styleId);
  const [accent, setAccent] = useState(saved.accent);
  const [bg, setBg] = useState(saved.bg);
  const [blocks, setBlocks] = useState<Block[]>(saved.blocks);
  const [tab, setTab] = useState<Tab | null>(null);
  const [showRsvp, setShowRsvp] = useState(initialSettings?.showRsvp ?? defaultShowRsvp);
  const [showGuests, setShowGuests] = useState(initialSettings?.showGuests ?? defaultShowGuests);
  const [preview, setPreview] = useState(readOnly);

  const st = PAGE_STYLES.find((s) => s.id === styleId) ?? PAGE_STYLES[0];
  const vars = pageTheme(accent, bg);

  const head: CSSProperties = {
    fontFamily: st.font,
    fontWeight: st.weight,
    fontStyle: st.titleItalic ? "italic" : "normal",
    letterSpacing: st.tracking,
    textTransform: st.upper ? "uppercase" : "none",
    color: st.titleColor === "accent" ? "var(--ev-accent)" : undefined,
  };
  const body: CSSProperties = { fontFamily: st.body, fontStyle: st.bodyItalic ? "italic" : "normal" };
  const label = labelStyle(st);
  const underline: CSSProperties = { borderBottom: "1px dotted var(--ev-accent)" };

  const set = <K extends keyof EventInfo>(k: K) => (v: string) => setInfo((s) => ({ ...s, [k]: v }));
  /** khối bản đồ lấy địa chỉ gợi ý: chỉ điền khi ô địa chỉ đang trống */
  const suggestAddress = (addr: string) => setInfo((s) => (s.address.trim() ? s : { ...s, address: addr }));
  const patchBlock = (id: string, p: Partial<Block>) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...p } : b)));
  const moveBlock = (id: string, dir: -1 | 1) =>
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const next = [...bs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const addBlock = (type: BlockType) => {
    const b = makeBlock(type);
    setBlocks((bs) => [...bs, b]);
    requestAnimationFrame(() => document.getElementById(`block-${b.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };
  const focusTitle = () => {
    setTab(null);
    const el = document.getElementById("ev-title") as HTMLTextAreaElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.focus({ preventScroll: true });
  };

  const g: GuestLists = guests ?? { attending: [], pending: [] };
  const rsvpStyle = buttonStyle(st);

  return (
    <div className={`relative flex min-h-full flex-col ${readOnly ? "" : "bg-white"} text-[#1D1B2A]`} style={{ fontFamily: "var(--ev-sans), system-ui, sans-serif" }}>
      {/* THANH TRÊN (ẩn ở chế độ xem của khách mời) */}
      {!readOnly && (
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur">
        <button type="button" onClick={onClose} aria-label="Đóng" className="grid size-9 place-items-center rounded-full hover:bg-black/5">
          <X className="size-5" />
        </button>
        <div className="flex items-center gap-2 text-sm font-semibold sm:gap-4">
          <button
            type="button"
            onClick={() => {
              setTab(null);
              setPreview((v) => !v);
            }}
            aria-pressed={preview}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: CRIMSON }}
          >
            {preview ? <PencilLine className="size-4" /> : <Eye className="size-4" />}
            <span className="max-sm:sr-only">{preview ? "Tiếp tục chỉnh sửa" : "Xem trước"}</span>
          </button>
          {onSave && (
            <button type="button" disabled={busy} onClick={() => onSave({ info, styleId, accent, bg, blocks, showRsvp, showGuests })} className="hover:underline disabled:opacity-50">
              Lưu
            </button>
          )}
          <button type="button" disabled={busy} onClick={() => onAddGuests?.({ info, styleId, accent, bg, blocks, showRsvp, showGuests })} className="whitespace-nowrap rounded-full px-5 py-2 text-white disabled:opacity-60 max-sm:px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ background: CRIMSON, outlineColor: CRIMSON }}>
            {busy ? "Đang lưu…" : "Thêm khách mời"}
          </button>
        </div>
      </header>
      )}

      <div className="flex flex-1 items-stretch">
        {/* THANH CÔNG CỤ BÊN TRÁI */}
        <nav aria-label="Công cụ" hidden={preview} className="sticky top-14 z-30 h-[calc(100dvh-3.5rem)] w-[68px] shrink-0 border-r border-black/10 bg-white">
          <div className="flex flex-col pt-4">
            <RailBtn icon={Palette} label="Kiểu trang" active={tab === "style"} onClick={() => setTab(tab === "style" ? null : "style")} />
            <RailBtn icon={Settings} label="Cài đặt" active={tab === "settings"} onClick={() => setTab(tab === "settings" ? null : "settings")} />
            <RailBtn icon={Pencil} label="Sửa nội dung" onClick={focusTitle} />
            <RailBtn icon={PlusSquare} label="Thêm khối" active={tab === "blocks"} onClick={() => setTab(tab === "blocks" ? null : "blocks")} />
          </div>
        </nav>

        {/* PANEL */}
        <AnimatePresence initial={false}>
          {tab && !preview && (
            <motion.aside
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="z-40 overflow-y-auto border-black/10 bg-white max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:h-[55dvh] max-md:rounded-t-2xl max-md:border-t max-md:shadow-2xl md:sticky md:top-14 md:h-[calc(100dvh-3.5rem)] md:w-[300px] md:shrink-0 md:border-r"
            >
              {tab === "style" && (
                <Panel title="Kiểu trang" onClose={() => setTab(null)}>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div className="grid content-start gap-2">
                      {PAGE_STYLES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStyleId(s.id)}
                          aria-pressed={s.id === styleId}
                          className="grid h-[68px] place-items-center rounded-md border px-3 text-center transition-colors hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          style={{
                            borderColor: s.id === styleId ? CRIMSON : "rgba(0,0,0,.12)",
                            boxShadow: s.id === styleId ? `0 0 0 1px ${CRIMSON}` : undefined,
                            outlineColor: CRIMSON,
                            fontFamily: s.font,
                            fontWeight: s.weight,
                            letterSpacing: s.tracking,
                            textTransform: s.upper ? "uppercase" : "none",
                            fontSize: s.previewSize ?? "1.25rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                    <div className="sticky top-0 flex flex-col items-center gap-2 self-start rounded-full border border-black/10 bg-white px-2 py-3">
                      <ColorWheel label="Chọn màu nhấn tuỳ ý" value={accent} onPick={setAccent} />
                      {ACCENTS.map((c) => (
                        <Dot key={c} label={`Màu nhấn ${c}`} color={c} active={c === accent} onPick={() => setAccent(c)} />
                      ))}
                      <span aria-hidden className="my-1 h-px w-5 bg-black/20" />
                      <ColorWheel label="Chọn màu nền tuỳ ý" value={bg} onPick={setBg} />
                      {BGS.map((c) => (
                        <Dot key={c} label={`Màu nền ${c}`} color={c} active={c === bg} onPick={() => setBg(c)} />
                      ))}
                    </div>
                  </div>
                </Panel>
              )}

              {tab === "settings" && (
                <Panel title="Cài đặt sự kiện" onClose={() => setTab(null)}>
                  <EventSettings showRsvp={showRsvp} setShowRsvp={setShowRsvp} showGuests={showGuests} setShowGuests={setShowGuests} />
                  <button
                    type="button"
                    onClick={() => {
                      setTab(null);
                      onReplay?.();
                    }}
                    className="mt-4 flex w-full items-center gap-3 rounded-md border border-black/15 px-4 py-3 text-left text-sm font-medium hover:bg-black/[0.03]"
                  >
                    <RotateCcw className="size-4" /> Xem lại hiệu ứng phong bì
                  </button>
                </Panel>
              )}

              {tab === "blocks" && (
                <Panel title="Thêm khối" onClose={() => setTab(null)}>
                  <p className="mb-4 text-sm text-black/60">Thêm không gian để chia sẻ thêm thông tin với khách mời.</p>
                  <div className="grid gap-2">
                    {(Object.keys(BLOCK_DEFS) as BlockType[]).map((t) => {
                      const d = BLOCK_DEFS[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => addBlock(t)}
                          className="flex items-start gap-3 rounded-md border border-dashed border-black/20 p-3 text-left transition-colors hover:border-solid hover:bg-black/[0.03]"
                        >
                          <span className="grid size-12 shrink-0 place-items-center rounded bg-[#F1ECDD]">
                            <d.icon className="size-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold" style={{ color: CRIMSON }}>
                              {d.title}
                            </span>
                            <span className="block text-xs leading-snug text-black/60">{d.desc}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Panel>
              )}

            </motion.aside>
          )}
        </AnimatePresence>

        {/* TRANG THIỆP ONLINE */}
        <main
          className="relative isolate min-w-0 flex-1 overflow-hidden px-5 pb-28 pt-20 transition-colors duration-500 md:px-10"
          style={{ ...vars, background: "var(--ev-bg)", color: "var(--ev-ink)", ...body }}
        >
          <ReadOnlyCtx.Provider value={preview}>
          <Backdrop deco={st.deco} />

          <div className="relative mx-auto max-w-3xl text-center">
            <AboveTitle deco={st.deco} title={info.title} />
            <Editable id="ev-title" multiline value={info.title} onChange={set("title")} placeholder="Tên sự kiện" style={{ ...head, fontSize: st.titleSize, lineHeight: 1.2 }} />

            <BelowTitle deco={st.deco} />

            {showRsvp && (
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {["Sẽ tham dự", "Không tham dự"].map((t) => (
                  <span key={t} className="px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ ...rsvpStyle, fontFamily: "var(--ev-sans), sans-serif" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mx-auto mt-10 max-w-xl text-lg">
              <Editable multiline value={info.description} onChange={set("description")} placeholder="Lời mời của bạn" />
            </div>

            <div className="mt-14 grid gap-10 text-base md:grid-cols-3">
              <InfoCol label="Chủ tiệc" labelStyle={label} cols={st.cols}>
                <Editable value={info.host} onChange={set("host")} placeholder="Tên bạn" style={underline} />
              </InfoCol>
              <InfoCol label="Thời gian" labelStyle={label} cols={st.cols}>
                <Editable value={info.date} onChange={set("date")} placeholder="Ngày" style={underline} />
                <Editable value={info.time} onChange={set("time")} placeholder="Giờ" style={underline} />
              </InfoCol>
              <InfoCol label="Địa điểm" labelStyle={label} cols={st.cols}>
                <Editable value={info.venue} onChange={set("venue")} placeholder="Tên địa điểm" style={underline} />
                <Editable value={info.address} onChange={set("address")} placeholder="Địa chỉ" style={underline} />
              </InfoCol>
            </div>
          </div>

          {showGuests && !(preview && g.attending.length + g.pending.length === 0) && (
            <section className="mx-auto mt-24 max-w-4xl text-center">
              <h3 style={label}>Danh sách khách mời</h3>
              <GuestGrid title={`${g.attending.length} khách tham dự`} names={g.attending} />
              <GuestGrid title={`${g.pending.length} chưa phản hồi`} names={g.pending} />
            </section>
          )}

          {blocks.map((b, i) => {
            // khối bản đồ chưa ghim: khách mời không thấy khối trống
            if (b.type === "map" && preview && (b.lat === null || b.lng === null)) return null;
            return (
            <section key={b.id} id={`block-${b.id}`} className="group relative mx-auto mt-24 max-w-3xl scroll-mt-24 text-center">
              <div hidden={preview} className="absolute -top-9 right-0 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
                <MiniBtn label="Chuyển lên" disabled={i === 0} onClick={() => moveBlock(b.id, -1)} icon={ArrowUp} />
                <MiniBtn label="Chuyển xuống" disabled={i === blocks.length - 1} onClick={() => moveBlock(b.id, 1)} icon={ArrowDown} />
                <MiniBtn label="Xoá khối" onClick={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))} icon={Trash2} />
              </div>
              <Editable value={b.title} onChange={(v) => patchBlock(b.id, { title: v })} placeholder="Tiêu đề khối" style={{ ...head, fontSize: "clamp(1.4rem,3vw,2rem)" }} />
              <div className="mt-8">
                <BlockBody b={b} patch={(p) => patchBlock(b.id, p)} styleId={styleId} address={info.address} onSuggestAddress={suggestAddress} />
              </div>
            </section>
            );
          })}
          </ReadOnlyCtx.Provider>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  THÀNH PHẦN NHỎ                                                     */
/* ------------------------------------------------------------------ */
function RailBtn({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex w-full flex-col items-center gap-1 px-1 py-3 text-center text-[11px] font-medium leading-tight transition-colors hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
      style={{ color: active ? CRIMSON : "#4B5563", outlineColor: CRIMSON }}
    >
      <Icon className="size-5" />
      {label}
    </button>
  );
}

function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Đóng bảng" className="grid size-8 place-items-center rounded-full hover:bg-black/5">
          <X className="size-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

function Dot({ label, color, active, onPick }: { label: string; color: string; active: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onPick}
      className="size-7 shrink-0 rounded-full border border-black/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ background: color, outline: active ? `2px solid ${CRIMSON}` : undefined, outlineOffset: 2, outlineColor: CRIMSON }}
    />
  );
}

/** Vòng màu: bấm để mở bảng chọn màu của trình duyệt */
function ColorWheel({ label, value, onPick }: { label: string; value: string; onPick: (c: string) => void }) {
  return (
    <label
      title={label}
      className="relative size-7 shrink-0 cursor-pointer rounded-full border border-black/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2"
      style={{ background: "conic-gradient(#f43f5e, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #f43f5e)", outlineColor: CRIMSON }}
    >
      <input type="color" value={value} onChange={(e) => onPick(e.target.value)} aria-label={label} className="absolute inset-0 size-full cursor-pointer opacity-0" />
    </label>
  );
}


function MiniBtn({ label, icon: Icon, onClick, disabled }: { label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full bg-black/70 text-white transition-opacity hover:bg-black disabled:opacity-30"
    >
      <Icon className="size-4" />
    </button>
  );
}

const COLS: Record<ColsVariant, { cls: string; style?: CSSProperties }> = {
  plain: { cls: "" },
  ruled: { cls: "md:px-4 md:[&:not(:first-child)]:border-l", style: { borderColor: "color-mix(in srgb, var(--ev-accent) 45%, transparent)" } },
  cards: { cls: "rounded-2xl p-6", style: { background: "color-mix(in srgb, var(--ev-accent) 9%, transparent)", border: "1px solid color-mix(in srgb, var(--ev-accent) 22%, transparent)" } },
  boxed: { cls: "p-6", style: { border: "1px solid var(--ev-accent)", boxShadow: "5px 5px 0 color-mix(in srgb, var(--ev-accent) 30%, transparent)" } },
  glass: { cls: "rounded-2xl p-6 backdrop-blur-sm", style: { background: "color-mix(in srgb, var(--ev-ink) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--ev-ink) 12%, transparent)" } },
};

function InfoCol({ label, labelStyle, cols = "plain", children }: { label: string; labelStyle: CSSProperties; cols?: ColsVariant; children: ReactNode }) {
  const v = COLS[cols];
  return (
    <div className={`flex flex-col items-center gap-3 ${v.cls}`} style={v.style}>
      <h3 style={labelStyle}>{label}</h3>
      <div className="flex w-full flex-col gap-2">{children}</div>
    </div>
  );
}

function GuestGrid({ title, names }: { title: string; names: string[] }) {
  const ro = useContext(ReadOnlyCtx);
  const empty = names.length === 0;
  if (empty && ro) return null;   // khách mời xem: không hiện tên giả "Tên khách"
  const list = empty ? Array.from({ length: 4 }, () => "Tên khách") : names;
  return (
    <div className="mt-8">
      <p className="mb-5 text-base">{title}</p>
      <ul className={`mx-auto grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4 ${empty ? "opacity-40" : ""}`}>
        {list.map((n, i) => (
          <li key={`${n}-${i}`}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

/** Ô nhập "trong trang": nhìn như chữ thường, bấm vào là sửa được */
function Editable({
  value,
  onChange,
  placeholder,
  style,
  multiline,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  multiline?: boolean;
  id?: string;
}) {
  const ro = useContext(ReadOnlyCtx);
  const cls = `w-full rounded-sm bg-transparent text-center outline-none placeholder:opacity-40 ${ro ? "cursor-default" : "focus:bg-black/[0.04]"}`;
  if (!multiline) {
    return <input id={id} type="text" readOnly={ro} tabIndex={ro ? -1 : undefined} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} style={{ font: "inherit", ...style }} />;
  }
  return <AutoTextarea id={id} readOnly={ro} value={value} placeholder={placeholder} onChange={onChange} className={cls} style={style} />;
}

/**
 * Ô nhiều dòng tự co giãn theo nội dung THẬT (scrollHeight), không đoán số ký tự mỗi dòng như trước.
 * Cách cũ đoán thiếu dòng -> hiện scrollbar cạnh tiêu đề (nhất là chữ tiếng Việt nhiều dấu, phông to).
 * Chạy lại khi: nội dung/kiểu chữ đổi, chiều rộng khung đổi, phông tải xong.
 */
function AutoTextarea({ id, value, placeholder, onChange, readOnly, className, style }: {
  id?: string; value: string; placeholder?: string; onChange: (v: string) => void; readOnly: boolean; className: string; style?: CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  useLayoutEffect(fit);   // mỗi lần render (đổi chữ, đổi kiểu trang, đổi cỡ chữ)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement ?? el);   // quan sát khung cha (chiều rộng), không phải chính ô (tránh lặp vô hạn)
    const fonts = document.fonts;
    void fonts?.ready.then(fit);
    fonts?.addEventListener?.("loadingdone", fit);
    return () => { ro.disconnect(); fonts?.removeEventListener?.("loadingdone", fit); };
  }, [fit]);
  return (
    <textarea
      ref={ref}
      id={id}
      rows={1}
      readOnly={readOnly}
      tabIndex={readOnly ? -1 : undefined}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} block resize-none overflow-hidden`}
      // đệm trên/dưới để dấu tiếng Việt (ế, ử, ặ...) không bị cắt khi ô ẩn phần tràn
      style={{ font: "inherit", paddingBlock: "0.1em", ...style }}
    />
  );
}

function BlockBody({
  b, patch, styleId, address, onSuggestAddress,
}: {
  b: Block;
  patch: (p: Partial<Block>) => void;
  styleId: string;
  address: string;
  onSuggestAddress: (addr: string) => void;
}) {
  const ro = useContext(ReadOnlyCtx);
  const addBtn = "mt-6 inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed px-4 py-2 text-xs font-semibold";
  const addStyle: CSSProperties = { borderColor: "var(--ev-accent)", color: "var(--ev-accent)" };

  if (b.type === "map") {
    return (
      <VenueMap
        styleId={styleId}
        lat={b.lat}
        lng={b.lng}
        address={address}
        readOnly={ro}
        onPick={(la, ln, suggested) => {
          patch({ lat: la, lng: ln });
          if (suggested) onSuggestAddress(suggested);
        }}
      />
    );
  }

  if (b.type === "video") {
    const embed = toEmbed(b.url);
    return (
      <>
        <Editable value={b.url} onChange={(v) => patch({ url: v })} placeholder="Dán liên kết YouTube hoặc Vimeo" style={{ borderBottom: "1px dotted var(--ev-accent)" }} />
        {embed ? (
          <div className="mt-6 aspect-video overflow-hidden rounded-md">
            <iframe src={embed} title={b.title} className="h-full w-full" allow="encrypted-media; picture-in-picture" allowFullScreen />
          </div>
        ) : b.url ? (
          <p className="mt-3 text-sm opacity-60">Chưa nhận ra liên kết này. Hãy dùng liên kết YouTube hoặc Vimeo.</p>
        ) : null}
      </>
    );
  }

  if (b.type === "details") {
    return <Editable multiline value={b.text} onChange={(v) => patch({ text: v })} placeholder="Chỉ đường, bãi đỗ xe, trang phục…" />;
  }

  if (b.type === "gallery") {
    return (
      <>
        {b.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {b.photos.map((ph) => (
              <div key={ph.id} className="relative aspect-square overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.src} alt="" className="h-full w-full object-cover" />
                <button type="button" hidden={ro} aria-label="Xoá ảnh" onClick={() => patch({ photos: b.photos.filter((x) => x.id !== ph.id) })} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/65 text-white hover:bg-black">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label hidden={ro} className={addBtn} style={addStyle}>
          <Plus className="size-3.5" /> Thêm ảnh
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={async (e) => {
              // data URL đã thu nhỏ: backend đẩy lên kho ảnh khi lưu thiệp và thay bằng URL thật
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              const srcs = await Promise.all(files.map((f) => imageToDataUrl(f)));
              const added = srcs.flatMap((src) => (src ? [{ id: uid(), src }] : []));
              if (added.length) patch({ photos: [...b.photos, ...added] });
            }}
          />
        </label>
      </>
    );
  }

  // speakers · wedding-party · sponsors
  const setPerson = (id: string, k: "name" | "role", v: string) => patch({ people: b.people.map((p) => (p.id === id ? { ...p, [k]: v } : p)) });
  return (
    <>
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-3">
        {b.people.map((p) => (
          <div key={p.id} className="relative">
            <Editable value={p.name} onChange={(v) => setPerson(p.id, "name", v)} placeholder="Họ tên" style={{ fontWeight: 600, borderBottom: "1px dotted var(--ev-accent)" }} />
            <div className="mt-1 text-sm opacity-75">
              <Editable value={p.role} onChange={(v) => setPerson(p.id, "role", v)} placeholder="Vai trò" />
            </div>
            <button type="button" hidden={ro} aria-label="Xoá" onClick={() => patch({ people: b.people.filter((x) => x.id !== p.id) })} className="absolute -right-1 -top-2 grid size-5 place-items-center rounded-full opacity-40 hover:opacity-100">
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" hidden={ro} onClick={() => patch({ people: [...b.people, { id: uid(), name: "", role: "" }] })} className={addBtn} style={addStyle}>
        <Plus className="size-3.5" /> Thêm người
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  TRANG TRÍ                                                          */
/* ------------------------------------------------------------------ */
function Bunting() {
  const n = 22;
  return (
    <svg aria-hidden viewBox="0 0 1000 80" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 h-16 w-full" fill="none" stroke="var(--ev-accent)" strokeWidth="2">
      <path d="M0 8 Q500 40 1000 8" vectorEffect="non-scaling-stroke" />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const x = t * 1000;
        const y = 8 + 64 * t * (1 - t); // điểm nằm trên đường cong ở trên
        return <path key={i} d={`M${x - 15} ${y} L${x + 15} ${y} L${x} ${y + 32} Z`} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

function Flourish() {
  return (
    <svg aria-hidden viewBox="0 0 200 20" className="mx-auto mt-6 h-5 w-44" fill="none" stroke="var(--ev-accent)" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 10 C 30 -4, 50 24, 80 10 S 130 -2, 198 10" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  HOẠ TIẾT THEO KIỂU TRANG                                           */
/*  Backdrop: lớp nền nằm SAU nội dung (khung, lưới, đốm màu...)       */
/*  AboveTitle / BelowTitle: nằm ngay trên / dưới tiêu đề              */
/*  Mọi màu lấy từ --ev-accent / --ev-ink nên đổi màu trang là đổi theo */
/* ------------------------------------------------------------------ */
const mix = (pct: number, c = "var(--ev-accent)") => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
const LEAF = "M0 0 C 6 -9 20 -9 28 0 C 20 9 6 9 0 0Z";

function Backdrop({ deco }: { deco: PageDeco }) {
  if (deco === "none" || deco === "flourish" || deco === "gazette" || deco === "monogram") return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {deco === "bunting" && <Bunting />}
      {deco === "heritage" && <HeritageFrame />}
      {deco === "botanica" && <BotanicaCorners />}
      {deco === "deco" && <DecoFrame />}
      {deco === "confetti" && <Confetti />}
      {deco === "blueprint" && <BlueprintGrid />}
      {deco === "aurora" && <AuroraGlow />}
    </div>
  );
}

function AboveTitle({ deco, title }: { deco: PageDeco; title: string }) {
  if (deco === "gazette") return <Rules />;
  if (deco === "botanica") return <BotanicaTop />;
  if (deco === "monogram") return <Monogram title={title} />;
  if (deco === "blueprint") return <Crosshair />;
  return null;
}

function BelowTitle({ deco }: { deco: PageDeco }) {
  switch (deco) {
    case "flourish": return <Flourish />;
    case "heritage": return <Divider />;
    case "gazette": return <Rules flip />;
    case "deco": return <DecoDivider />;
    case "confetti": return <Squiggle />;
    case "monogram": return <Divider round />;
    case "blueprint": return <div className="mt-6 border-t border-dashed" style={{ borderColor: mix(60) }} />;
    case "aurora": return <div className="mx-auto mt-6 h-px w-40" style={{ background: "linear-gradient(90deg, transparent, var(--ev-accent), transparent)" }} />;
    default: return null;
  }
}

/* ---- Heritage: khung đôi + hoạ tiết góc ---- */
function HeritageFrame() {
  const line = (inset: number, o: number): CSSProperties => ({ position: "absolute", inset, border: "1px solid var(--ev-accent)", opacity: o });
  const corners: CSSProperties[] = [
    { left: 8, top: 8 },
    { right: 8, top: 8, transform: "scaleX(-1)" },
    { left: 8, bottom: 8, transform: "scaleY(-1)" },
    { right: 8, bottom: 8, transform: "scale(-1,-1)" },
  ];
  return (
    <>
      <div style={line(12, 0.75)} />
      <div style={line(18, 0.3)} />
      {corners.map((pos, i) => (
        <svg key={i} viewBox="0 0 40 40" className="absolute size-10" style={pos} fill="none" stroke="var(--ev-accent)" strokeWidth="1.2" strokeLinecap="round">
          <path d="M3 37 V12 Q3 3 12 3 H37" />
          <circle cx="12" cy="12" r="2.2" fill="var(--ev-accent)" stroke="none" />
        </svg>
      ))}
    </>
  );
}

/** Đường kẻ có hình thoi (hoặc chấm tròn) ở giữa */
function Divider({ round = false }: { round?: boolean }) {
  return (
    <svg viewBox="0 0 240 16" className="mx-auto mt-8 h-4 w-56" fill="none" stroke="var(--ev-accent)" strokeWidth="1.2" aria-hidden>
      <path d="M0 8H100M140 8H240" />
      {round ? <circle cx="120" cy="8" r="4" /> : <path d="M120 2 L126 8 L120 14 L114 8Z" fill="var(--ev-accent)" />}
    </svg>
  );
}

/* ---- Gazette: hai đường kẻ đôi (đậm + mảnh) ---- */
function Rules({ flip = false }: { flip?: boolean }) {
  const thick = <div style={{ height: 4, background: "var(--ev-ink)" }} />;
  const thin = <div style={{ height: 1, background: "var(--ev-ink)" }} />;
  return (
    <div className={flip ? "mt-7" : "mb-7"} style={{ display: "grid", gap: 3 }}>
      {flip ? <>{thin}{thick}</> : <>{thick}{thin}</>}
    </div>
  );
}

/* ---- Botanica: cành lá ---- */
function BotanicaTop() {
  const half = (
    <g>
      <path d="M4 20 C 40 20 80 20 118 20" />
      {[14, 38, 62, 86].flatMap((x, i) =>
        [-45, 45].map((a) => (
          <path key={`${x}-${a}`} d={LEAF} fill="var(--ev-accent)" stroke="none" transform={`translate(${x} 20) rotate(${a}) scale(${(0.55 + i * 0.08).toFixed(2)})`} />
        )),
      )}
    </g>
  );
  return (
    <svg viewBox="0 0 280 40" className="mx-auto mb-6 h-9 w-72 max-w-full" fill="none" stroke="var(--ev-accent)" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
      {half}
      <g transform="translate(280 0) scale(-1 1)">{half}</g>
      <circle cx="140" cy="20" r="4" fill="var(--ev-accent)" stroke="none" />
      <circle cx="140" cy="20" r="8" />
    </svg>
  );
}

function BotanicaCorners() {
  const leaves = [28, 58, 88, 118, 148, 176].flatMap((x, i) => {
    const y = 70 - 0.3125 * (x - 4);
    const s = 1 - i * 0.08;
    return [-67, 33].map((a) => ({ k: `${x}-${a}`, t: `translate(${x} ${y.toFixed(1)}) rotate(${a}) scale(${s.toFixed(2)})` }));
  });
  const sprig = (
    <svg viewBox="0 0 200 80" className="h-28 w-72 max-md:w-48" fill="none" stroke="var(--ev-accent)" strokeWidth="1.4" strokeLinecap="round">
      <path d="M4 70 C 50 60 110 40 196 10" />
      {leaves.map((l) => <path key={l.k} d={LEAF} fill="var(--ev-accent)" stroke="none" transform={l.t} />)}
      <path d={LEAF} fill="var(--ev-accent)" stroke="none" transform="translate(196 10) rotate(-17) scale(.7)" />
    </svg>
  );
  return (
    <>
      <div className="absolute left-0 top-0 opacity-[0.16]" style={{ transform: "translate(-6%, 6%)" }}>{sprig}</div>
      <div className="absolute bottom-0 right-0 opacity-[0.16]" style={{ transform: "translate(6%, -6%) scale(-1,-1)" }}>{sprig}</div>
    </>
  );
}

/* ---- Art Deco: khung đôi + quạt ở bốn góc ---- */
function DecoFrame() {
  const line = (inset: number, o: number): CSSProperties => ({ position: "absolute", inset, border: "1px solid var(--ev-accent)", opacity: o });
  const corners: CSSProperties[] = [
    { left: 12, top: 12 },
    { right: 12, top: 12, transform: "scaleX(-1)" },
    { left: 12, bottom: 12, transform: "scaleY(-1)" },
    { right: 12, bottom: 12, transform: "scale(-1,-1)" },
  ];
  const rays: [number, number][] = [[56, 0], [51.74, 21.43], [39.6, 39.6], [21.43, 51.74], [0, 56]];
  return (
    <>
      <div style={line(12, 0.9)} />
      <div style={line(18, 0.35)} />
      {corners.map((pos, i) => (
        <svg key={i} viewBox="0 0 60 60" className="absolute size-14 max-md:size-10" style={pos} fill="none" stroke="var(--ev-accent)" strokeWidth="1.2" strokeLinecap="round">
          {[14, 28, 42, 56].map((r) => <path key={r} d={`M${r} 0 A${r} ${r} 0 0 1 0 ${r}`} />)}
          {rays.map(([x, y]) => <path key={`${x}-${y}`} d={`M0 0 L${x} ${y}`} />)}
        </svg>
      ))}
    </>
  );
}

function DecoDivider() {
  return (
    <svg viewBox="0 0 240 16" className="mx-auto mt-8 h-4 w-56" fill="var(--ev-accent)" stroke="var(--ev-accent)" strokeWidth="1.2" aria-hidden>
      <path d="M0 8H84M156 8H240" fill="none" />
      <path d="M120 1 L127 8 L120 15 L113 8Z" />
      <path d="M96 4 L100 8 L96 12 L92 8Z M144 4 L148 8 L144 12 L140 8Z" />
    </svg>
  );
}

/* ---- Confetti: đốm màu cố định (không random lúc render để khỏi lệch giữa server và trình duyệt) ---- */
// [trái %, trên %, kích thước px, hình (0 chấm · 1 vòng · 2 tam giác · 3 vuông), màu, góc xoay]
const CONFETTI: [number, number, number, number, number, number][] = [
  [3, 52, 8, 0, 0, 187], [9, 9, 10, 0, 0, 222], [89, 32, 8, 3, 0, 289], [4, 82, 18, 0, 3, 25], [88, 73, 10, 2, 3, 73],
  [17, 5, 18, 1, 0, 297], [83, 4, 12, 0, 0, 288], [10, 28, 14, 3, 2, 238], [60, 6, 12, 1, 1, 124], [10, 40, 18, 3, 2, 229],
  [10, 11, 8, 3, 1, 175], [95, 55, 8, 0, 2, 174], [46, 99, 18, 3, 0, 47], [8, 91, 8, 0, 2, 331], [89, 8, 12, 3, 2, 11],
  [93, 23, 18, 0, 3, 30], [92, 18, 10, 3, 3, 254], [3, 59, 14, 2, 1, 220], [37, 7, 12, 3, 1, 77], [3, 21, 10, 1, 0, 248],
  [25, 5, 12, 0, 1, 214], [49, 6, 10, 0, 3, 348], [52, 7, 14, 3, 0, 246], [53, 92, 10, 0, 1, 225], [89, 45, 18, 0, 0, 0],
  [21, 9, 8, 2, 0, 36],
];
const CONFETTI_COLORS = ["var(--ev-accent)", "#F4B942", "#2EC4B6", "#FF6B8B"];

function Confetti() {
  return (
    <>
      {CONFETTI.map(([l, t, size, shape, c, rot], i) => {
        const color = CONFETTI_COLORS[c];
        const base: CSSProperties = { position: "absolute", left: `${l}%`, top: `${t}%`, width: size, height: size, transform: `rotate(${rot}deg)`, opacity: 0.85 };
        if (shape === 0) return <i key={i} style={{ ...base, borderRadius: "50%", background: color }} />;
        if (shape === 1) return <i key={i} style={{ ...base, borderRadius: "50%", border: `2px solid ${color}` }} />;
        if (shape === 2) return <i key={i} style={{ ...base, background: color, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />;
        return <i key={i} style={{ ...base, height: size * 0.5, borderRadius: 2, background: color }} />;
      })}
    </>
  );
}

function Squiggle() {
  return (
    <svg viewBox="0 0 120 12" className="mx-auto mt-5 h-3 w-28" fill="none" stroke="var(--ev-accent)" strokeWidth="3" strokeLinecap="round" aria-hidden>
      <path d="M3 6 q 7 -8 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0" />
    </svg>
  );
}

/* ---- Blueprint: lưới ô vuông + dấu góc ---- */
function BlueprintGrid() {
  const brackets: CSSProperties[] = [
    { left: 14, top: 14, borderWidth: "2px 0 0 2px" },
    { right: 14, top: 14, borderWidth: "2px 2px 0 0" },
    { left: 14, bottom: 14, borderWidth: "0 0 2px 2px" },
    { right: 14, bottom: 14, borderWidth: "0 2px 2px 0" },
  ];
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${mix(14)} 1px, transparent 1px), linear-gradient(90deg, ${mix(14)} 1px, transparent 1px), linear-gradient(${mix(28)} 1px, transparent 1px), linear-gradient(90deg, ${mix(28)} 1px, transparent 1px)`,
          backgroundSize: "24px 24px, 24px 24px, 120px 120px, 120px 120px",
        }}
      />
      {brackets.map((b, i) => (
        <div key={i} className="absolute size-6" style={{ ...b, borderStyle: "solid", borderColor: "var(--ev-accent)" }} />
      ))}
    </>
  );
}

function Crosshair() {
  return (
    <svg viewBox="0 0 40 40" className="mx-auto mb-6 size-8" fill="none" stroke="var(--ev-accent)" strokeWidth="1.4" aria-hidden>
      <circle cx="20" cy="20" r="9" />
      <path d="M20 2 V12 M20 28 V38 M2 20 H12 M28 20 H38" />
    </svg>
  );
}

/* ---- Monogram: vòng tròn chữ cái đầu của hai tên ("Minh Anh & Quốc Bảo" -> A & B) ---- */
function initials(title: string): { a: string; b: string; amp: boolean } {
  const t = title.normalize("NFC").trim();
  const up = (w?: string) => (w?.[0] ?? "").toLocaleUpperCase("vi");
  const words = (p: string) => p.split(/\s+/).filter(Boolean);
  const parts = t.split(/\s*&\s*|\s*\+\s*|\s+và\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const a = words(parts[0]);
    const b = words(parts[1]);
    return { a: up(a[a.length - 1]), b: up(b[b.length - 1]), amp: true };   // tên riêng tiếng Việt là từ cuối
  }
  const w = words(t).filter((x) => x.length > 1);
  return { a: up(w[0]) || "✦", b: up(w[1]), amp: false };
}

function Monogram({ title }: { title: string }) {
  const { a, b, amp } = initials(title);
  return (
    <div
      aria-hidden
      className="mx-auto mb-8 grid size-24 place-items-center rounded-full"
      style={{
        border: "1px solid var(--ev-accent)",
        boxShadow: `inset 0 0 0 5px var(--ev-bg), inset 0 0 0 6px ${mix(45)}`,
        fontFamily: "var(--ev-serif), serif",
        fontSize: "1.9rem",
        color: "var(--ev-accent)",
        letterSpacing: "0.04em",
      }}
    >
      <span>
        {a}
        {amp && <span style={{ fontSize: "1rem", margin: "0 0.15em" }}>{"&"}</span>}
        {b}
      </span>
    </div>
  );
}

/* ---- Aurora: vệt sáng loang màu nhấn ---- */
function AuroraGlow() {
  const blob = (size: number, style: CSSProperties, c: string): CSSProperties => ({ position: "absolute", width: size, height: size, borderRadius: "50%", filter: "blur(70px)", background: c, ...style });
  return (
    <>
      <div style={blob(460, { left: -140, top: -120, opacity: 0.42 }, "var(--ev-accent)")} />
      <div style={blob(380, { right: -120, top: "28%", opacity: 0.3 }, "color-mix(in srgb, var(--ev-accent) 55%, #ffffff)")} />
      <div style={blob(420, { left: "20%", bottom: -180, opacity: 0.28 }, "color-mix(in srgb, var(--ev-accent) 70%, #F4B942)")} />
    </>
  );
}
