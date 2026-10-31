"use client";

import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Award,
  Eye,
  Flower2,
  Image as ImageIcon,
  Mic,
  MoreHorizontal,
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
import { Be_Vietnam_Pro, Cormorant_Garamond, Space_Mono, Great_Vibes, Oswald } from "next/font/google";

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
type PageStyle = {
  id: string;
  name: string;
  font: string; // tiêu đề
  body: string; // lời mời, giá trị
  bodyItalic?: boolean;
  weight: number;
  upper: boolean;
  tracking: string;
  titleSize: string;
  deco: "none" | "bunting" | "flourish";
  btn: "outline" | "solid";
};

const PAGE_STYLES: PageStyle[] = [
  { id: "principal", name: "Principal", font: "var(--ev-serif), serif", body: "var(--ev-serif), serif", weight: 500, upper: false, tracking: "0", titleSize: "clamp(2.2rem,5.5vw,3.6rem)", deco: "none", btn: "outline" },
  { id: "bunting", name: "Bunting", font: "var(--ev-mono), monospace", body: "var(--ev-mono), monospace", weight: 400, upper: false, tracking: "0.03em", titleSize: "clamp(1.5rem,3.6vw,2.3rem)", deco: "bunting", btn: "solid" },
  { id: "sloane", name: "Sloane", font: "var(--ev-sans), sans-serif", body: "var(--ev-sans), sans-serif", weight: 500, upper: true, tracking: "0.12em", titleSize: "clamp(1.5rem,3.6vw,2.4rem)", deco: "none", btn: "outline" },
  { id: "offset", name: "Offset", font: "var(--ev-display), sans-serif", body: "var(--ev-sans), sans-serif", weight: 700, upper: true, tracking: "0.04em", titleSize: "clamp(2.2rem,6.5vw,4.2rem)", deco: "none", btn: "solid" },
  { id: "plume", name: "Plume", font: "var(--ev-script), cursive", body: "var(--ev-serif), serif", bodyItalic: true, weight: 400, upper: false, tracking: "0", titleSize: "clamp(2.8rem,7.5vw,4.8rem)", deco: "flourish", btn: "outline" },
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
type BlockType = "video" | "speakers" | "wedding-party" | "sponsors" | "gallery" | "details";
type Person = { id: string; name: string; role: string };
type Photo = { id: string; src: string };
type Block = { id: string; type: BlockType; title: string; text: string; url: string; people: Person[]; photos: Photo[] };

const BLOCK_DEFS: Record<BlockType, { desc: string; icon: LucideIcon; title: string }> = {
  video: { title: "Video", desc: "Nhúng liên kết YouTube hoặc Vimeo.", icon: Play },
  speakers: { title: "Diễn giả", desc: "Danh sách diễn giả kèm vai trò.", icon: Mic },
  "wedding-party": { title: "Phù dâu & phù rể", desc: "Giới thiệu những người đồng hành trong ngày cưới.", icon: Flower2 },
  sponsors: { title: "Nhà tài trợ", desc: "Tôn vinh các đơn vị đồng hành.", icon: Award },
  gallery: { title: "Thư viện ảnh", desc: "Tải ảnh lên để khách mời xem từng tấm.", icon: ImageIcon },
  details: { title: "Chi tiết", desc: "Chỉ đường, bãi đỗ xe, trang phục…", icon: AlignLeft },
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
});

function toEmbed(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
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

type Tab = "style" | "settings" | "blocks" | "more";

/** Chế độ xem trước: mọi ô nhập thành chữ thường, ẩn nút thêm / xoá */
const ReadOnlyCtx = createContext(false);

export type EventPageData = { info: EventInfo; styleId: string; accent: string; bg: string; blocks: Block[] };

export type EventDetailsEditorProps = {
  initial?: Partial<EventInfo>;
  guests?: GuestLists;
  onClose?: () => void;
  onSave?: (data: EventPageData) => void;
  /** bấm "Thêm khách mời": nhận luôn cấu hình trang hiện tại để lưu trước khi chuyển bước */
  onAddGuests?: (data: EventPageData) => void;
  onReplay?: () => void;
};

export function EventDetailsEditor({ initial, guests, onClose, onSave, onAddGuests, onReplay }: EventDetailsEditorProps) {
  const [info, setInfo] = useState<EventInfo>({ ...DEFAULT_INFO, ...initial });
  const [styleId, setStyleId] = useState(PAGE_STYLES[0].id);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [bg, setBg] = useState(BGS[0]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tab, setTab] = useState<Tab | null>(null);
  const [showRsvp, setShowRsvp] = useState(true);
  const [showGuests, setShowGuests] = useState(true);
  const [preview, setPreview] = useState(false);

  const st = PAGE_STYLES.find((s) => s.id === styleId) ?? PAGE_STYLES[0];
  const vars = {
    ["--ev-accent" as string]: accent,
    ["--ev-bg" as string]: bg,
    ["--ev-ink" as string]: isDark(bg) ? "#F5F1E8" : "#1D1B2A",
    ["--ev-on-accent" as string]: isDark(accent) ? "#FFFFFF" : "#1D1B2A",
  } as CSSProperties;

  const head: CSSProperties = {
    fontFamily: st.font,
    fontWeight: st.weight,
    letterSpacing: st.tracking,
    textTransform: st.upper ? "uppercase" : "none",
  };
  const body: CSSProperties = { fontFamily: st.body, fontStyle: st.bodyItalic ? "italic" : "normal" };
  const label: CSSProperties = {
    fontFamily: "var(--ev-sans), sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    opacity: 0.65,
  };
  const underline: CSSProperties = { borderBottom: "1px dotted var(--ev-accent)" };

  const set = <K extends keyof EventInfo>(k: K) => (v: string) => setInfo((s) => ({ ...s, [k]: v }));
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
  const rsvpStyle: CSSProperties =
    st.btn === "solid"
      ? { background: "var(--ev-accent)", color: "var(--ev-on-accent)", border: "1px solid var(--ev-accent)" }
      : { border: "1px solid var(--ev-ink)", color: "var(--ev-ink)" };

  return (
    <div className="relative flex min-h-full flex-col bg-white text-[#1D1B2A]" style={{ fontFamily: "var(--ev-sans), system-ui, sans-serif" }}>
      {/* THANH TRÊN */}
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
            <button type="button" onClick={() => onSave({ info, styleId, accent, bg, blocks })} className="hover:underline">
              Lưu
            </button>
          )}
          <button type="button" onClick={() => onAddGuests?.({ info, styleId, accent, bg, blocks })} className="whitespace-nowrap rounded-full px-5 py-2 text-white max-sm:px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" style={{ background: CRIMSON, outlineColor: CRIMSON }}>
            Thêm khách mời
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-stretch">
        {/* THANH CÔNG CỤ BÊN TRÁI */}
        <nav aria-label="Công cụ" hidden={preview} className="sticky top-14 z-30 h-[calc(100dvh-3.5rem)] w-[68px] shrink-0 border-r border-black/10 bg-white">
          <div className="flex flex-col pt-4">
            <RailBtn icon={Palette} label="Kiểu trang" active={tab === "style"} onClick={() => setTab(tab === "style" ? null : "style")} />
            <RailBtn icon={Settings} label="Cài đặt" active={tab === "settings"} onClick={() => setTab(tab === "settings" ? null : "settings")} />
            <RailBtn icon={Pencil} label="Sửa nội dung" onClick={focusTitle} />
            <RailBtn icon={PlusSquare} label="Thêm khối" active={tab === "blocks"} onClick={() => setTab(tab === "blocks" ? null : "blocks")} />
            <RailBtn icon={MoreHorizontal} label="Khác" active={tab === "more"} onClick={() => setTab(tab === "more" ? null : "more")} />
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
                            fontSize: s.id === "plume" ? "1.9rem" : "1.25rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-2 rounded-full border border-black/10 px-2 py-3">
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
                  <Toggle label="Hiện nút phản hồi tham dự" checked={showRsvp} onChange={setShowRsvp} />
                  <Toggle label="Hiện danh sách khách mời" checked={showGuests} onChange={setShowGuests} />
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

              {tab === "more" && (
                <Panel title="Khác" onClose={() => setTab(null)}>
                  <button
                    type="button"
                    onClick={() => {
                      setTab(null);
                      onReplay?.();
                    }}
                    className="flex w-full items-center gap-3 rounded-md border border-black/15 px-4 py-3 text-left text-sm font-medium hover:bg-black/[0.03]"
                  >
                    <RotateCcw className="size-4" /> Xem lại hiệu ứng phong bì
                  </button>
                </Panel>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* TRANG THIỆP ONLINE */}
        <main
          className="relative min-w-0 flex-1 overflow-hidden px-5 pb-28 pt-20 transition-colors duration-500 md:px-10"
          style={{ ...vars, background: "var(--ev-bg)", color: "var(--ev-ink)", ...body }}
        >
          <ReadOnlyCtx.Provider value={preview}>
          {st.deco === "bunting" && <Bunting />}

          <div className="mx-auto max-w-3xl text-center">
            <Editable id="ev-title" multiline cpl={26} value={info.title} onChange={set("title")} placeholder="Tên sự kiện" style={{ ...head, fontSize: st.titleSize, lineHeight: 1.12 }} />

            {st.deco === "flourish" && <Flourish />}

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
              <Editable multiline cpl={44} value={info.description} onChange={set("description")} placeholder="Lời mời của bạn" />
            </div>

            <div className="mt-14 grid gap-10 text-base md:grid-cols-3">
              <InfoCol label="Chủ tiệc" labelStyle={label}>
                <Editable value={info.host} onChange={set("host")} placeholder="Tên bạn" style={underline} />
              </InfoCol>
              <InfoCol label="Thời gian" labelStyle={label}>
                <Editable value={info.date} onChange={set("date")} placeholder="Ngày" style={underline} />
                <Editable value={info.time} onChange={set("time")} placeholder="Giờ" style={underline} />
              </InfoCol>
              <InfoCol label="Địa điểm" labelStyle={label}>
                <Editable value={info.venue} onChange={set("venue")} placeholder="Tên địa điểm" style={underline} />
                <Editable value={info.address} onChange={set("address")} placeholder="Địa chỉ" style={underline} />
              </InfoCol>
            </div>
          </div>

          {showGuests && (
            <section className="mx-auto mt-24 max-w-4xl text-center">
              <h3 style={label}>Danh sách khách mời</h3>
              <GuestGrid title={`${g.attending.length} khách tham dự`} names={g.attending} />
              <GuestGrid title={`${g.pending.length} chưa phản hồi`} names={g.pending} />
            </section>
          )}

          {blocks.map((b, i) => (
            <section key={b.id} id={`block-${b.id}`} className="group relative mx-auto mt-24 max-w-3xl scroll-mt-24 text-center">
              <div hidden={preview} className="absolute -top-9 right-0 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
                <MiniBtn label="Chuyển lên" disabled={i === 0} onClick={() => moveBlock(b.id, -1)} icon={ArrowUp} />
                <MiniBtn label="Chuyển xuống" disabled={i === blocks.length - 1} onClick={() => moveBlock(b.id, 1)} icon={ArrowDown} />
                <MiniBtn label="Xoá khối" onClick={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))} icon={Trash2} />
              </div>
              <Editable value={b.title} onChange={(v) => patchBlock(b.id, { title: v })} placeholder="Tiêu đề khối" style={{ ...head, fontSize: "clamp(1.4rem,3vw,2rem)" }} />
              <div className="mt-8">
                <BlockBody b={b} patch={(p) => patchBlock(b.id, p)} />
              </div>
            </section>
          ))}
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-black/10 py-3 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5" style={{ accentColor: CRIMSON }} />
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

function InfoCol({ label, labelStyle, children }: { label: string; labelStyle: CSSProperties; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h3 style={labelStyle}>{label}</h3>
      <div className="flex w-full flex-col gap-2">{children}</div>
    </div>
  );
}

function GuestGrid({ title, names }: { title: string; names: string[] }) {
  const empty = names.length === 0;
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
  cpl = 30,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  multiline?: boolean;
  cpl?: number; // số ký tự ước tính trên một dòng, để tự giãn chiều cao
  id?: string;
}) {
  const ro = useContext(ReadOnlyCtx);
  const cls = `w-full rounded-sm bg-transparent text-center outline-none placeholder:opacity-40 ${ro ? "cursor-default" : "focus:bg-black/[0.04]"}`;
  if (!multiline) {
    return <input id={id} type="text" readOnly={ro} tabIndex={ro ? -1 : undefined} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cls} style={{ font: "inherit", ...style }} />;
  }
  const rows = Math.max(1, value.split("\n").reduce((n, l) => n + Math.max(1, Math.ceil(l.length / cpl)), 0));
  return <textarea id={id} readOnly={ro} tabIndex={ro ? -1 : undefined} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${cls} resize-none`} style={{ font: "inherit", ...style }} />;
}

function BlockBody({ b, patch }: { b: Block; patch: (p: Partial<Block>) => void }) {
  const ro = useContext(ReadOnlyCtx);
  const addBtn = "mt-6 inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed px-4 py-2 text-xs font-semibold";
  const addStyle: CSSProperties = { borderColor: "var(--ev-accent)", color: "var(--ev-accent)" };

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
    return <Editable multiline cpl={56} value={b.text} onChange={(v) => patch({ text: v })} placeholder="Chỉ đường, bãi đỗ xe, trang phục…" />;
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
            onChange={(e) => {
              // demo: dùng blob URL. Khi nối API thì upload file rồi lưu URL trả về
              const files = Array.from(e.target.files ?? []);
              patch({ photos: [...b.photos, ...files.map((f) => ({ id: uid(), src: URL.createObjectURL(f) }))] });
              e.target.value = "";
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
