"use client";

/* Bản demo đơn giản của "Trình sửa thiệp": xem trước phong bì + thiệp, chỉnh màu, nắp, lót, viền và nội dung.
 * Chỉ chạy trên trình duyệt, không gọi API và không lưu gì lên hệ thống. */

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Mail, PenLine, RotateCw, User, Users, type LucideIcon } from "lucide-react";

const GOLD = "#D8B26A";

type EnvColor = { name: string; bg: string; liner: string; dark: boolean };
const ENV_COLORS: EnvColor[] = [
  { name: "Kem", bg: "#F3EADB", liner: "#2F6F5E", dark: false },
  { name: "Hồng nhạt", bg: "#F2DCDD", liner: "#8E3B4C", dark: false },
  { name: "Vàng", bg: "#E6CF94", liner: "#2F5E4E", dark: false },
  { name: "Xanh băng", bg: "#DCE7EF", liner: "#27548A", dark: false },
  { name: "Xanh lá", bg: "#1F5C4A", liner: "#4E9A84", dark: true },
  { name: "Navy", bg: "#22355A", liner: "#5C7DB0", dark: true },
  { name: "Đỏ rượu", bg: "#6E1F33", liner: "#B0566E", dark: true },
  { name: "Đen", bg: "#2A2A2A", liner: "#5A5A60", dark: true },
];

const FLAP_TEXTS = ["Không", "Thiệp mới", "Bạn được mời", "Trân trọng kính mời", "Save the date", "Gửi bạn"];
const LINERS = ["Trơn", "Hoa văn", "Hoa nhí", "Chấm bi"] as const;
const BORDERS = ["Không viền", "Truyền thống", "Chỉ vàng", "Viền kép"] as const;
const SHAPES = [
  { id: "tri", label: "Tam giác" },
  { id: "rect", label: "Chữ nhật" },
] as const;
const CARD_COLORS = [
  { name: "Kem", bg: "#FBF7F0", ink: "#2b2420", accent: "#A8733A" },
  { name: "Hồng", bg: "#F8E6E7", ink: "#5a2a33", accent: "#B94A6A" },
  { name: "Xanh rêu", bg: "#1F5C4A", ink: "#F4EDE2", accent: "#E8C77A" },
  { name: "Đêm", bg: "#14233F", ink: "#F4EDE2", accent: "#E8C77A" },
  { name: "Trắng", bg: "#FFFFFF", ink: "#1c1a24", accent: "#27548A" },
];
const CALL_WORDS = ["Kính gửi", "Thân gửi", "Gửi"];

type TabId = "envelope" | "card" | "sender" | "recipient";
const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "envelope", label: "Phong bì", icon: Mail },
  { id: "card", label: "Thiệp", icon: PenLine },
  { id: "sender", label: "Người gửi", icon: User },
  { id: "recipient", label: "Người nhận", icon: Users },
];

/* Hoa văn lót: vẽ bằng SVG nền, không cần ảnh ngoài */
const svgBg = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const linerStyle = (pattern: (typeof LINERS)[number], color: string): CSSProperties => {
  switch (pattern) {
    case "Hoa văn":
      return {
        backgroundColor: color,
        backgroundImage: svgBg(`<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26'><path d='M13 7v12M7 13h12' stroke='${GOLD}' stroke-width='2' stroke-linecap='round'/></svg>`),
        backgroundSize: "26px 26px",
      };
    case "Hoa nhí":
      return {
        backgroundColor: color,
        backgroundImage: svgBg(`<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='7.5' r='3' fill='#fff' opacity='.55'/><circle cx='16.5' cy='12' r='3' fill='#fff' opacity='.55'/><circle cx='12' cy='16.5' r='3' fill='#fff' opacity='.55'/><circle cx='7.5' cy='12' r='3' fill='#fff' opacity='.55'/><circle cx='12' cy='12' r='1.6' fill='${GOLD}'/></svg>`),
        backgroundSize: "24px 24px",
      };
    case "Chấm bi":
      return {
        backgroundColor: color,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,.45) 2px, transparent 2.5px)",
        backgroundSize: "16px 16px",
      };
    default:
      return { backgroundColor: color };
  }
};

/* Nút dạng viên thuốc. Dùng style inline vì CSS reset toàn cục của header (button { border: none; background: none }) đè lên class Tailwind. */
const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    style={{
      height: 36,
      padding: "0 14px",
      borderRadius: 999,
      border: `1px solid ${active ? "var(--color-ink)" : "var(--color-line)"}`,
      background: active ? "var(--color-ink)" : "#fff",
      color: active ? "#fff" : "var(--color-ink)",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      transition: "background-color .2s, border-color .2s",
    }}
  >
    {children}
  </button>
);

const Label = ({ children }: { children: ReactNode }) => (
  <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</p>
);

const Field = ({ value, onChange, placeholder, multiline = false }: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) => {
  const cls = "w-full rounded-sm border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-lacquer";
  return multiline ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-none`} />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
  );
};

export default function EditorDemo() {
  const [tab, setTab] = useState<TabId>("envelope");
  // phong bì
  const [envIdx, setEnvIdx] = useState(4);
  const [shape, setShape] = useState<(typeof SHAPES)[number]["id"]>("tri");
  const [flapText, setFlapText] = useState("Thiệp mới");
  const [liner, setLiner] = useState<(typeof LINERS)[number]>("Hoa văn");
  const [border, setBorder] = useState<(typeof BORDERS)[number]>("Truyền thống");
  const [open, setOpen] = useState(false);
  // thiệp
  const [cardIdx, setCardIdx] = useState(0);
  const [title, setTitle] = useState("Thiệp mời đám cưới");
  const [couple, setCouple] = useState("Minh Anh & Hoàng Nam");
  const [date, setDate] = useState("Chủ nhật · 12.10.2026");
  const [note, setNote] = useState("Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi.");
  const [flipped, setFlipped] = useState(false);
  // người gửi / người nhận
  const [sender, setSender] = useState("Gia đình nhà gái");
  const [recipient, setRecipient] = useState("Anh Tuấn");
  const [call, setCall] = useState(CALL_WORDS[0]);

  const env = ENV_COLORS[envIdx];
  const card = CARD_COLORS[cardIdx];
  const isTri = shape === "tri";
  const flapH = isTri ? 70 : 52; // % chiều cao env
  const flapClip = isTri ? "polygon(0 0, 100% 0, 50% 100%)" : "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
  const sealTop = isTri ? 68 : 52;
  const frames = border === "Truyền thống" ? [8] : border === "Chỉ vàng" ? [0] : border === "Viền kép" ? [6, 11] : [];
  const frameWidth = border === "Chỉ vàng" ? 2 : 1;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-sm border border-line bg-white lg:grid-cols-[1.08fr_1fr]">
      {/* Khung xem trước */}
      <div className="relative flex flex-col bg-[#F1ECE4] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Chip active={false} onClick={() => setOpen((v) => !v)}>
              {open ? "Đóng nắp" : "Mở nắp"}
            </Chip>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((v) => !v)}
            style={{ height: 36, padding: "0 14px", borderRadius: 999, border: "1px solid var(--color-line)", background: "#fff", color: "var(--color-ink)", fontSize: 14, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
            <RotateCw className="size-3.5" aria-hidden />
            Lật thiệp
          </button>
        </div>

        <div className="relative mx-auto mt-6 w-full max-w-[460px] flex-1" style={{ aspectRatio: "1 / 1" }}>
          {/* Phong bì */}
          <div
            className="absolute left-[13%] top-[24%] h-[52%] w-[74%]"
            style={{ perspective: 1200, filter: "drop-shadow(0 18px 22px rgba(20,20,30,.16))" }}
          >
            <div className="absolute inset-0 rounded-[3px]" style={{ backgroundColor: env.bg, filter: "brightness(.72)" }} />

            {/* Thiệp: nằm trong phong bì, nhô lên khi mở nắp */}
            <div
              className="absolute transition-[top] duration-700 ease-out"
              style={{ left: "19%", width: "62%", top: open ? "-34%" : "14%", aspectRatio: "3 / 2", zIndex: 1 }}
            >
              <div
                className="relative size-full transition-transform duration-700 ease-out"
                style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-[3px] p-3 text-center shadow-md"
                  style={{ backgroundColor: card.bg, color: card.ink, backfaceVisibility: "hidden" }}
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: card.accent }}>{title}</p>
                  <p className="text-[15px] font-semibold leading-tight sm:text-lg">{couple}</p>
                  <p className="text-[10px] opacity-75">{date}</p>
                  <p className="mt-1 text-[10px] opacity-80">{call} {recipient}</p>
                </div>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[3px] p-4 text-center shadow-md"
                  style={{ backgroundColor: card.bg, color: card.ink, transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  <p className="text-[10px] italic leading-relaxed opacity-90">{note}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: card.accent }}>Từ {sender}</p>
                </div>
              </div>
            </div>

            {/* Lớp che phần trên của thiệp khi đóng nắp: thiệp chỉ lộ ra trong túi, không lộ ở hai góc */}
            <div
              aria-hidden
              className="absolute inset-0 transition-opacity duration-500"
              style={{ zIndex: 2, opacity: open ? 0 : 1, backgroundColor: env.bg, clipPath: "polygon(0 0, 100% 0, 100% 33%, 50% 68%, 0 33%)" }}
            />

            {/* Lớp túi trước (hình chữ V) */}
            <div
              className="absolute inset-0"
              style={{
                zIndex: 3,
                backgroundColor: env.bg,
                backgroundImage: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.14))",
                clipPath: "polygon(0 33%, 50% 68%, 100% 33%, 100% 100%, 0 100%)",
              }}
            />

            {/* Nắp: mặt trước có chữ, mặt sau là lớp lót hoa văn */}
            <div
              className="absolute inset-x-0 top-0"
              style={{
                height: `${flapH}%`,
                zIndex: open ? 0 : 4, // khi mở, nắp nằm dưới thiệp để chữ trên thiệp không bị che
                transformOrigin: "top center",
                transformStyle: "preserve-3d",
                transform: open ? "rotateX(180deg)" : "rotateX(0deg)",
                transition: "transform .8s cubic-bezier(.22,.61,.36,1)",
              }}
            >
              <div
                className="absolute inset-0 flex items-start justify-center pt-[16%]"
                style={{
                  clipPath: flapClip,
                  backgroundColor: env.bg,
                  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 70%)",
                  backfaceVisibility: "hidden",
                }}
              >
                {flapText && (
                  <span
                    className="px-3 text-center text-[9px] font-semibold uppercase tracking-[0.22em] sm:text-[10px]"
                    style={{ color: env.dark ? GOLD : "#7a5a24" }}
                  >
                    {flapText}
                  </span>
                )}
              </div>
              <div
                className="absolute inset-0"
                style={{ clipPath: flapClip, transform: "rotateX(180deg)", backfaceVisibility: "hidden", ...linerStyle(liner, env.liner) }}
              />
            </div>

            {/* Viền trang trí */}
            {frames.map((inset) => (
              <div
                key={inset}
                aria-hidden
                className="pointer-events-none absolute"
                style={{ inset: `${inset}px`, border: `${frameWidth}px solid ${GOLD}`, zIndex: 5 }}
              />
            ))}

            {/* Con dấu sáp */}
            <div
              className="absolute grid aspect-square w-[15%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-serif text-white shadow-[0_3px_6px_rgba(0,0,0,.35)]"
              style={{
                left: "50%",
                top: `${sealTop}%`,
                zIndex: 6,
                background: "radial-gradient(circle at 35% 30%, #d2455f 0%, #a1213a 55%, #6e1224 100%)",
              }}
            >
              <span className="text-[13px] sm:text-base">I</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">Bản xem thử, chưa lưu lên hệ thống</p>
      </div>

      {/* Bảng điều khiển */}
      <div className="flex min-h-[520px] flex-col">
        <div role="tablist" aria-label="Phần chỉnh sửa" className="grid grid-cols-4 border-b border-line">
          {TABS.map(({ id, label, icon: Icon }) => {
            const on = tab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setTab(id)}
                className={`relative flex flex-col items-center gap-1 py-3.5 text-xs font-medium transition-colors ${on ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                <Icon className="size-4" aria-hidden />
                {label}
                {on && <span aria-hidden className="absolute inset-x-4 bottom-0 h-0.5 bg-ink" />}
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto p-5 sm:p-6">
          {tab === "envelope" && (
            <>
              <div>
                <Label>Màu phong bì</Label>
                <div className="flex flex-wrap gap-2.5">
                  {ENV_COLORS.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      aria-label={c.name}
                      title={c.name}
                      onClick={() => setEnvIdx(i)}
                      className={`size-8 rounded-full border border-black/10 transition-transform hover:scale-110 ${envIdx === i ? "ring-2 ring-ink ring-offset-2" : ""}`}
                      style={{ backgroundColor: c.bg }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Kiểu nắp</Label>
                <div className="flex gap-2">
                  {SHAPES.map((s) => <Chip key={s.id} active={shape === s.id} onClick={() => setShape(s.id)}>{s.label}</Chip>)}
                </div>
              </div>
              <div>
                <Label>Chữ trên nắp</Label>
                <div className="flex flex-wrap gap-2">
                  {FLAP_TEXTS.map((t) => (
                    <Chip key={t} active={flapText === (t === "Không" ? "" : t)} onClick={() => setFlapText(t === "Không" ? "" : t)}>{t}</Chip>
                  ))}
                </div>
                <div className="mt-3">
                  <Field value={flapText} onChange={setFlapText} placeholder="Hoặc tự viết, ví dụ: Thân mời bạn" />
                </div>
              </div>
              <div>
                <Label>Viền phong bì</Label>
                <div className="flex flex-wrap gap-2">
                  {BORDERS.map((b) => <Chip key={b} active={border === b} onClick={() => setBorder(b)}>{b}</Chip>)}
                </div>
              </div>
              <div>
                <Label>Hoa văn lót</Label>
                <div className="flex flex-wrap gap-2">
                  {LINERS.map((l) => <Chip key={l} active={liner === l} onClick={() => setLiner(l)}>{l}</Chip>)}
                </div>
              </div>
            </>
          )}

          {tab === "card" && (
            <>
              <div>
                <Label>Màu thiệp</Label>
                <div className="flex flex-wrap gap-2.5">
                  {CARD_COLORS.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      aria-label={c.name}
                      title={c.name}
                      onClick={() => setCardIdx(i)}
                      className={`size-8 rounded-full border border-black/10 transition-transform hover:scale-110 ${cardIdx === i ? "ring-2 ring-ink ring-offset-2" : ""}`}
                      style={{ backgroundColor: c.bg }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Nội dung</Label>
                <Field value={title} onChange={setTitle} placeholder="Tiêu đề nhỏ" />
                <Field value={couple} onChange={setCouple} placeholder="Tên cô dâu & chú rể" />
                <Field value={date} onChange={setDate} placeholder="Ngày giờ tổ chức" />
                <Field value={note} onChange={setNote} placeholder="Lời mời (mặt sau)" multiline />
              </div>
            </>
          )}

          {tab === "sender" && (
            <div className="space-y-3">
              <Label>Tên người gửi</Label>
              <Field value={sender} onChange={setSender} placeholder="Ví dụ: Gia đình nhà gái" />
              <p className="text-xs leading-relaxed text-muted">Tên này hiện ở mặt sau thiệp, phía dưới lời mời.</p>
            </div>
          )}

          {tab === "recipient" && (
            <>
              <div className="space-y-3">
                <Label>Tên người nhận</Label>
                <Field value={recipient} onChange={setRecipient} placeholder="Ví dụ: Anh Tuấn" />
              </div>
              <div>
                <Label>Cách xưng hô</Label>
                <div className="flex flex-wrap gap-2">
                  {CALL_WORDS.map((w) => <Chip key={w} active={call === w} onClick={() => setCall(w)}>{w}</Chip>)}
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted">Trên thực tế, mỗi khách có một đường link riêng và thiệp hiện đúng tên người nhận.</p>
            </>
          )}
        </div>

        <div className="border-t border-line bg-white p-5 sm:p-6">
          <Link
            href="/templates"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-ink text-sm font-semibold text-white transition-colors hover:bg-lacquer"
          >
            Tạo thiệp với mẫu này
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-muted">Đây là bản xem thử để bạn hình dung cách chỉnh sửa. Chọn một mẫu để bắt đầu thiết kế thiệp thật.</p>
        </div>
      </div>
    </div>
  );
}
