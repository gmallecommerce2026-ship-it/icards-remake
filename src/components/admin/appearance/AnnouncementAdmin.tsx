"use client";

import { useEffect, useState } from "react";
import { getAdminSettings, saveAdminAnnouncementBar } from "@/lib/api/admin";
import { ANNOUNCEMENT_PRESET_SRC, AnnouncementBarView, DEFAULT_ANNOUNCEMENT_BG, type AnnouncementBarData, type AnnouncementPreset } from "@/components/home/AnnouncementBar";
import { ImageField } from "@/components/admin/ImageField";
import { ErrorBox, btnCls, errorMessage, inputCls } from "@/components/admin/ui";

const EMPTY: Required<Pick<AnnouncementBarData, "isEnabled" | "text" | "isMarquee" | "speed" | "isDismissible">> & AnnouncementBarData = {
  isEnabled: false,
  text: "",
  isMarquee: true,
  speed: 60,
  isDismissible: false,
  backgroundColor: DEFAULT_ANNOUNCEMENT_BG,
  textColor: "#ffffff",
};

const HEX6 = /^#[0-9a-f]{6}$/i;

const PRESETS: { value: AnnouncementPreset; label: string; hint: string }[] = [
  { value: "train", label: "Tàu hỏa kéo banner", hint: "Mặc định" },
  { value: "truck", label: "Xe tải kéo banner", hint: "Lặp vô hạn" },
  { value: "none", label: "Chỉ màu nền", hint: "Không chuyển động" },
];

/** Thẻ chọn nền động: xem trước chính ảnh GIF, khung vuông, viền sáng khi đang chọn. */
function PresetPicker({ value, disabled, onChange }: { value: AnnouncementPreset; disabled: boolean; onChange: (v: AnnouncementPreset) => void }) {
  return (
    <div role="radiogroup" aria-label="Nền động" className="grid gap-3 sm:grid-cols-3">
      {PRESETS.map((p) => {
        const active = value === p.value;
        return (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(p.value)}
            className={`grid gap-2 border bg-white p-2 text-left transition-colors ${active ? "border-[#27548A] ring-1 ring-[#27548A]" : "border-[#C5D0DE] hover:border-[#27548A]"}`}
          >
            <span className="relative block h-12 w-full overflow-hidden bg-[#27548A]">
              {p.value === "none" ? (
                <span className="absolute inset-0 grid place-items-center text-xs text-white/80">Màu nền</span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ANNOUNCEMENT_PRESET_SRC[p.value]} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
            </span>
            <span className="flex items-center justify-between gap-2 text-sm font-medium">
              {p.label}
              {active && <span className="text-xs text-[#27548A]">Đang dùng</span>}
            </span>
            <span className="text-xs text-[#5B6B7F]">{p.hint}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Ô chọn màu: bảng màu của trình duyệt + ô nhập mã hex. */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <span className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} (bảng màu)`}
          className="h-10 w-12 cursor-pointer border border-[#C5D0DE] bg-white p-1"
          value={HEX6.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <input className={`${inputCls} w-32 font-mono uppercase`} maxLength={9} value={value} onChange={(e) => onChange(e.target.value)} />
      </span>
    </label>
  );
}

function Toggle({ checked, onChange, children, hint }: { checked: boolean; onChange: (v: boolean) => void; children: string; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5 text-sm">
      <input type="checkbox" className="mt-0.5 size-4" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="font-medium">{children}</span>
        {hint && <span className="block text-xs text-[#5B6B7F]">{hint}</span>}
      </span>
    </label>
  );
}

/** Tab "Thanh thông báo": thanh chữ (có thể chạy) nằm trên cùng header của website. */
export default function AnnouncementAdmin() {
  const [bar, setBar] = useState<AnnouncementBarData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getAdminSettings()
      .then(({ data }) => {
        const saved = ((data.theme as { announcementBar?: AnnouncementBarData } | undefined)?.announcementBar ?? {}) as AnnouncementBarData;
        if (alive) setBar({ ...EMPTY, ...saved, backgroundColor: saved.backgroundColor || EMPTY.backgroundColor, textColor: saved.textColor || EMPTY.textColor });
      })
      .catch((e) => alive && setError(errorMessage(e, "Không tải được cấu hình thanh thông báo.")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const set = (patch: Partial<AnnouncementBarData>) => setBar((b) => ({ ...b, ...patch }));

  const save = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await saveAdminAnnouncementBar(bar);
      setNotice("Đã lưu. Thanh thông báo trên website sẽ cập nhật ở lần tải tiếp theo.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-[#5B6B7F]">Đang tải…</p>;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-[#5B6B7F]">
          Thanh thông báo nằm trên cùng, phía trên header của website. Có thể để chữ đứng yên hoặc chạy liên tục, đặt màu hoặc ảnh nền.
        </p>
        <button type="button" className={btnCls} disabled={saving} onClick={save}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      {notice && <p className="text-sm text-[#1E7A4C]">{notice}</p>}

      <section className="grid gap-3">
        <h2 className="text-base font-bold">Xem trước</h2>
        <div className="overflow-hidden border border-[#D9E1EC]">
          <AnnouncementBarView bar={{ ...bar, text: bar.text || "Nội dung thông báo sẽ hiện ở đây" }} />
          <div className="grid h-12 place-items-center bg-white text-xs text-[#5B6B7F]">Header của website</div>
        </div>
        {!bar.isEnabled && <p className="text-xs text-[#8E5B00]">Thanh đang tắt nên khách chưa nhìn thấy. Bật “Hiển thị thanh thông báo” rồi lưu.</p>}
      </section>

      <section className="grid gap-5 border border-[#D9E1EC] bg-white p-5">
        <Toggle checked={!!bar.isEnabled} onChange={(v) => set({ isEnabled: v })}>Hiển thị thanh thông báo</Toggle>

        <label className="grid gap-1.5 text-sm font-medium">
          Nội dung
          <textarea
            className="min-h-20 rounded-md border border-[#C5D0DE] bg-white px-3 py-2 text-sm outline-none focus:border-[#27548A]"
            maxLength={300}
            value={bar.text ?? ""}
            onChange={(e) => set({ text: e.target.value })}
            placeholder="Ví dụ: Miễn phí giao thiệp in cho đơn từ 500.000đ · Ưu đãi tháng 11 giảm 20%"
          />
          <span className="text-xs font-normal text-[#5B6B7F]">{(bar.text ?? "").length}/300 ký tự</span>
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Liên kết khi bấm vào (không bắt buộc)
          <input className={`${inputCls} max-w-xl`} placeholder="/templates hoặc https://…" value={bar.link ?? ""} onChange={(e) => set({ link: e.target.value })} />
        </label>

        <div className="grid gap-3 border-t border-[#EEF2F7] pt-5">
          <Toggle
            checked={!!bar.isMarquee || ((bar.backgroundPreset ?? "train") !== "none" && !bar.backgroundImage)}
            onChange={(v) => set({ isMarquee: v })}
            hint={(bar.backgroundPreset ?? "train") !== "none" && !bar.backgroundImage
              ? "Đang dùng nền tàu/xe tải: đoàn xe luôn chạy kèm banner chữ. Chọn “Chỉ màu nền” ở trên để chữ đứng yên."
              : "Chữ chạy liên tục từ phải sang trái, dừng lại khi rê chuột vào."}
          >
            Chữ chạy
          </Toggle>
          {(bar.isMarquee || ((bar.backgroundPreset ?? "train") !== "none" && !bar.backgroundImage)) && (
            <label className="grid max-w-md gap-1.5 text-sm font-medium">
              <span className="flex justify-between">
                Tốc độ <span className="tabular-nums text-[#5B6B7F]">{bar.speed ?? 60} px/giây</span>
              </span>
              <input type="range" min={20} max={200} step={5} value={bar.speed ?? 60} onChange={(e) => set({ speed: Number(e.target.value) })} />
              <span className="flex justify-between text-xs font-normal text-[#5B6B7F]"><span>Chậm</span><span>Nhanh</span></span>
            </label>
          )}
          <Toggle checked={!!bar.isDismissible} onChange={(v) => set({ isDismissible: v })} hint="Hiện nút ✕ để khách tắt thanh. Khi bạn đổi nội dung, thanh sẽ hiện lại với mọi khách.">
            Cho phép khách tắt thanh
          </Toggle>
        </div>

        <div className="grid gap-4 border-t border-[#EEF2F7] pt-5">
          <h3 className="text-sm font-bold">Màu sắc và nền</h3>
          <div className="flex flex-wrap gap-6">
            <ColorField label="Màu nền" value={bar.backgroundColor ?? ""} onChange={(v) => set({ backgroundColor: v })} />
            <ColorField label="Màu chữ" value={bar.textColor ?? ""} onChange={(v) => set({ textColor: v })} />
          </div>
          <div className="grid gap-2">
            <h4 className="text-sm font-medium">Nền động</h4>
            <PresetPicker
              value={bar.backgroundPreset ?? "train"}
              disabled={!!bar.backgroundImage}
              onChange={(v) => set({ backgroundPreset: v })}
            />
            <p className="text-xs text-[#5B6B7F]">
              {bar.backgroundImage
                ? "Đang dùng ảnh nền tuỳ chỉnh bên dưới nên nền động tạm không áp dụng. Xoá ảnh tuỳ chỉnh để chọn lại nền động."
                : "Nền động được cuộn liên tục phía sau chữ. Chọn “Chỉ màu nền” để dùng màu nền ở trên."}
            </p>
          </div>
          <ImageField
            label="Ảnh nền tuỳ chỉnh (ghi đè nền động, không bắt buộc)"
            value={bar.backgroundImage ?? ""}
            onChange={(url) => set({ backgroundImage: url })}
          />
          <p className="text-xs text-[#5B6B7F]">Ảnh tuỳ chỉnh được phủ lên và làm tối nhẹ để chữ dễ đọc. Xoá ảnh để quay lại nền động hoặc màu nền.</p>
        </div>
      </section>
    </div>
  );
}
